from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable, Optional


class DomainError(Exception):
    pass


class PermissionDenied(DomainError):
    pass


class ConflictError(DomainError):
    pass


@dataclass
class Actor:
    user_id: int
    loja_id: Optional[int]
    cargo: str


class CoreTransactionServices:
    def __init__(self, db, audit_service, clock):
        self.db = db
        self.audit = audit_service
        self.clock = clock

    def _ensure_same_loja_or_admin(self, actor: Actor, loja_id: Optional[int]) -> None:
        if actor.cargo == "admin_principal":
            return
        if actor.loja_id is None or loja_id is None or actor.loja_id != loja_id:
            raise PermissionDenied("Usuário sem acesso ao escopo da loja informada")

    def _ensure_action_allowed(self, actor: Actor, allowed_cargos: set[str]) -> None:
        if actor.cargo not in allowed_cargos:
            raise PermissionDenied("Usuário sem permissão para executar esta ação")

    def _ensure_current_actor_can_target_loja(self, actor: Actor, loja_id: Optional[int]) -> None:
        self._ensure_same_loja_or_admin(actor, loja_id)

    def _resolve_entity_loja_id(self, tx, entidade_tipo: str, entidade_id: int) -> Optional[int]:
        mapa = {
            "contrato": "select loja_id from contratos where id = %s and deleted_at is null",
            "caso": "select loja_id from casos_operacionais where id = %s and deleted_at is null",
            "cobranca": "select loja_id from cobrancas where id = %s and deleted_at is null",
            "evento": "select loja_id from eventos where id = %s and deleted_at is null",
            "reembolso": "select loja_id from reembolsos where id = %s and deleted_at is null",
        }
        query = mapa.get(entidade_tipo)
        if not query:
            return None
        row = tx.fetch_one(query, [entidade_id])
        return row["loja_id"] if row else None

    def _update_contract_status_after_generic_approval(self, tx, entidade_id: int, decisao: str) -> None:
        contrato = tx.fetch_one(
            "select status from contratos where id = %s and deleted_at is null for update",
            [entidade_id],
        )
        if not contrato:
            raise DomainError("Contrato não encontrado")
        if contrato["status"] != "enviado":
            raise DomainError("Contrato não está apto para decisão")
        novo_status = "aceito" if decisao == "aprovado" else "recusado"
        tx.execute(
            "update contratos set status = %s, updated_at = now() where id = %s",
            [novo_status, entidade_id],
        )

    def _update_entity_status_after_approval(self, tx, entidade_tipo: str, entidade_id: int, decisao: str) -> None:
        if entidade_tipo == "contrato":
            self._update_contract_status_after_generic_approval(tx, entidade_id, decisao)
            return

        status_map = {
            "caso": ("casos_operacionais", "status"),
            "evento": ("eventos", "status"),
            "reembolso": ("reembolsos", "status"),
        }
        target = status_map.get(entidade_tipo)
        if not target:
            return
        table_name, column_name = target
        tx.execute(
            f"update {table_name} set {column_name} = %s, updated_at = now() where id = %s",
            ["aprovado" if decisao == "aprovado" else "rejeitado", entidade_id],
        )

    def _validate_resource_conflict(
        self,
        tx,
        recurso_id: int,
        regra: str,
        hora_inicio,
        hora_fim,
        vigencia_inicio,
        vigencia_fim,
    ) -> None:
        conflito = tx.fetch_one(
            """
            select id
            from agenda_slots
            where recurso_id = %s
              and status = 'ativo'
              and deleted_at is null
              and (vigencia_fim is null or vigencia_fim >= %s)
              and (%s is null or vigencia_inicio <= %s)
              and regra = %s
              and hora_inicio < %s
              and hora_fim > %s
            limit 1
            for update
            """,
            [recurso_id, vigencia_inicio, vigencia_fim, vigencia_fim, regra, hora_fim, hora_inicio],
        )
        if conflito:
            raise ConflictError("Conflito de agenda para o recurso informado")

    def _find_valid_delegation(self, tx, user_id: int, entidade_tipo: str, valor: Optional[Decimal]):
        delegacao = tx.fetch_one(
            """
            select *
            from delegacoes
            where concedido_para_usuario_id = %s
              and ativo = true
              and inicio_vigencia <= now()
              and (fim_vigencia is null or fim_vigencia >= now())
              and (escopo is null or escopo = %s)
            order by id desc
            limit 1
            """,
            [user_id, entidade_tipo],
        )
        if not delegacao:
            return None
        if valor is not None and delegacao["limite_valor"] is not None and valor > delegacao["limite_valor"]:
            return None
        return delegacao

    def _has_native_permission(self, cargo: str, entidade_tipo: str) -> bool:
        permissao_por_cargo = {
            "admin_principal": {"contrato", "caso", "cobranca", "evento", "reembolso"},
            "veneravel_mestre": {"contrato", "caso", "evento", "reembolso"},
            "primeiro_vigilante": {"contrato", "caso", "evento", "reembolso"},
            "segundo_vigilante": {"caso", "evento"},
            "financeiro": {"cobranca", "reembolso"},
        }
        return entidade_tipo in permissao_por_cargo.get(cargo, set())

    def _infer_evidence_type(self, tipo_mensagem: str) -> str:
        mapa = {
            "texto": "texto",
            "audio": "audio",
            "imagem": "imagem",
            "pdf": "pdf",
            "arquivo": "arquivo",
        }
        return mapa.get(tipo_mensagem, "arquivo")

    def create_contract(
        self,
        loja_id: int,
        templo_id: int,
        regra_recorrencia: str,
        hora_inicio_sessao,
        hora_fim_sessao,
        vigencia_inicio,
        vigencia_fim,
        actor: Actor,
    ) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "secretario"})
        self._ensure_current_actor_can_target_loja(actor, loja_id)

        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                """
                insert into contratos (
                    loja_id, templo_id, status, regra_recorrencia,
                    hora_inicio_sessao, hora_fim_sessao,
                    vigencia_inicio, vigencia_fim,
                    created_by_usuario_id, updated_by_usuario_id
                ) values (%s, %s, 'rascunho', %s, %s, %s, %s, %s, %s, %s)
                returning id
                """,
                [
                    loja_id,
                    templo_id,
                    regra_recorrencia,
                    hora_inicio_sessao,
                    hora_fim_sessao,
                    vigencia_inicio,
                    vigencia_fim,
                    actor.user_id,
                    actor.user_id,
                ],
            )
            contrato_id = contrato["id"]
            self.audit.log(
                tx=tx,
                loja_id=loja_id,
                usuario_id=actor.user_id,
                acao="contrato_criado",
                modulo="contratos",
                entidade_tipo="contrato",
                entidade_id=contrato_id,
                origem="painel",
                detalhes={"templo_id": templo_id},
            )
            return contrato_id

    def submit_contract_for_approval(self, contrato_id: int, actor: Actor) -> None:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "secretario"})
        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                "select * from contratos where id = %s and deleted_at is null for update",
                [contrato_id],
            )
            if not contrato:
                raise DomainError("Contrato não encontrado")
            self._ensure_current_actor_can_target_loja(actor, contrato["loja_id"])
            if contrato["status"] != "rascunho":
                raise DomainError("Somente contratos em rascunho podem ser enviados")
            tx.execute(
                "update contratos set status = 'enviado', updated_at = now(), updated_by_usuario_id = %s where id = %s",
                [actor.user_id, contrato_id],
            )
            self.audit.log(
                tx=tx,
                loja_id=contrato["loja_id"],
                usuario_id=actor.user_id,
                acao="contrato_enviado_para_aprovacao",
                modulo="contratos",
                entidade_tipo="contrato",
                entidade_id=contrato_id,
                origem="painel",
                detalhes={},
            )

    def get_contract(self, contrato_id: int, actor: Actor):
        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                "select * from contratos where id = %s and deleted_at is null",
                [contrato_id],
            )
            if not contrato:
                raise DomainError("Contrato não encontrado")
            self._ensure_current_actor_can_target_loja(actor, contrato["loja_id"])
            return contrato

    def decide_contract(self, contrato_id: int, decisao: str, actor: Actor, observacao: Optional[str] = None) -> None:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "primeiro_vigilante"})
        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                "select * from contratos where id = %s and deleted_at is null for update",
                [contrato_id],
            )
            if not contrato:
                raise DomainError("Contrato não encontrado")
            self._ensure_current_actor_can_target_loja(actor, contrato["loja_id"])
            if contrato["status"] != "enviado":
                raise DomainError("Somente contratos enviados podem ser decididos")
            novo_status = "aceito" if decisao == "aprovado" else "recusado"
            tx.execute(
                "update contratos set status = %s, updated_at = now(), updated_by_usuario_id = %s where id = %s",
                [novo_status, actor.user_id, contrato_id],
            )
            tx.execute(
                """
                insert into aprovacoes (
                    entidade_tipo, entidade_id, aprovado_por_usuario_id,
                    delegacao_id, decisao, observacao
                ) values ('contrato', %s, %s, null, %s, %s)
                """,
                [contrato_id, actor.user_id, decisao, observacao],
            )
            self.audit.log(
                tx=tx,
                loja_id=contrato["loja_id"],
                usuario_id=actor.user_id,
                acao="contrato_aprovado" if decisao == "aprovado" else "contrato_rejeitado",
                modulo="contratos",
                entidade_tipo="contrato",
                entidade_id=contrato_id,
                origem="painel",
                detalhes={"observacao": observacao},
            )

    def activate_contract(self, contrato_id: int, actor: Actor) -> None:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre"})
        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                """
                select *
                from contratos
                where id = %s and deleted_at is null
                for update
                """,
                [contrato_id],
            )
            if not contrato:
                raise DomainError("Contrato não encontrado")
            if contrato["status"] not in {"aceito", "enviado", "aguardando_aceite"}:
                raise DomainError("Contrato não pode ser ativado neste status")
            self._ensure_current_actor_can_target_loja(actor, contrato["loja_id"])
            loja = tx.fetch_one(
                "select * from lojas where id = %s and deleted_at is null for update",
                [contrato["loja_id"]],
            )
            if not loja:
                raise DomainError("Loja não encontrada")
            contrato_ativo = tx.fetch_one(
                """
                select id
                from contratos
                where loja_id = %s
                  and status = 'ativo'
                  and deleted_at is null
                  and id <> %s
                for update
                """,
                [contrato["loja_id"], contrato_id],
            )
            if contrato_ativo:
                raise ConflictError("Loja já possui contrato ativo")
            self._validate_resource_conflict(
                tx=tx,
                recurso_id=contrato["templo_id"],
                regra=contrato["regra_recorrencia"],
                hora_inicio=contrato["hora_inicio_sessao"],
                hora_fim=contrato["hora_fim_sessao"],
                vigencia_inicio=contrato["vigencia_inicio"],
                vigencia_fim=contrato["vigencia_fim"],
            )
            tx.execute(
                """
                insert into agenda_slots (
                    loja_id, contrato_id, recurso_id, regra,
                    hora_inicio, hora_fim, vigencia_inicio, vigencia_fim, status
                ) values (%s, %s, %s, %s, %s, %s, %s, %s, 'ativo')
                """,
                [
                    contrato["loja_id"],
                    contrato_id,
                    contrato["templo_id"],
                    contrato["regra_recorrencia"],
                    contrato["hora_inicio_sessao"],
                    contrato["hora_fim_sessao"],
                    contrato["vigencia_inicio"],
                    contrato["vigencia_fim"],
                ],
            )
            tx.execute(
                "update contratos set status = 'ativo', updated_at = now(), updated_by_usuario_id = %s where id = %s",
                [actor.user_id, contrato_id],
            )
            tx.execute(
                "update lojas set status = 'ativa', updated_at = now() where id = %s",
                [contrato["loja_id"]],
            )
            self.audit.log(
                tx=tx,
                loja_id=contrato["loja_id"],
                usuario_id=actor.user_id,
                acao="contrato_ativado",
                modulo="contratos",
                entidade_tipo="contrato",
                entidade_id=contrato_id,
                origem="painel",
                detalhes={"loja_id": contrato["loja_id"]},
            )

    def validate_schedule_conflict(self, recurso_id: int, regra: str, hora_inicio, hora_fim, vigencia_inicio, vigencia_fim) -> None:
        with self.db.transaction() as tx:
            self._validate_resource_conflict(tx, recurso_id, regra, hora_inicio, hora_fim, vigencia_inicio, vigencia_fim)

    def create_message(
        self,
        loja_id: int,
        tipo: str,
        actor: Actor,
        texto: Optional[str] = None,
        contexto: Optional[str] = None,
        enviado_por_telefone: Optional[str] = None,
        transcricao: Optional[str] = None,
        irmao_id: Optional[int] = None,
        arquivo_url: Optional[str] = None,
        audio_url: Optional[str] = None,
        message_external_id: Optional[str] = None,
    ) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "primeiro_vigilante", "segundo_vigilante", "secretario", "financeiro"})
        self._ensure_current_actor_can_target_loja(actor, loja_id)
        with self.db.transaction() as tx:
            mensagem = tx.fetch_one(
                """
                insert into mensagens (
                    loja_id, irmao_id, message_external_id, tipo, contexto,
                    texto, arquivo_url, audio_url, transcricao, status, enviado_por_telefone
                ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'novo', %s)
                returning id
                """,
                [
                    loja_id,
                    irmao_id,
                    message_external_id,
                    tipo,
                    contexto,
                    texto,
                    arquivo_url,
                    audio_url,
                    transcricao,
                    enviado_por_telefone,
                ],
            )
            self.audit.log(
                tx=tx,
                loja_id=loja_id,
                usuario_id=actor.user_id,
                acao="mensagem_criada",
                modulo="mensagens",
                entidade_tipo="mensagem",
                entidade_id=mensagem["id"],
                origem="painel",
                detalhes={"tipo": tipo, "contexto": contexto},
            )
            return mensagem["id"]

    def list_messages(self, actor: Actor, loja_id: Optional[int] = None, tipo: Optional[str] = None, contexto: Optional[str] = None, status: Optional[str] = None):
        target_loja_id = loja_id if actor.cargo == "admin_principal" and loja_id is not None else actor.loja_id
        self._ensure_current_actor_can_target_loja(actor, target_loja_id)
        query = "select * from mensagens where loja_id = %s"
        params = [target_loja_id]
        if tipo:
            query += " and tipo = %s"
            params.append(tipo)
        if contexto:
            query += " and contexto = %s"
            params.append(contexto)
        if status:
            query += " and status = %s"
            params.append(status)
        query += " order by id desc"
        with self.db.transaction() as tx:
            return tx.fetch_all(query, params)

    def get_message(self, message_id: int, actor: Actor):
        with self.db.transaction() as tx:
            mensagem = tx.fetch_one("select * from mensagens where id = %s", [message_id])
            if not mensagem:
                raise DomainError("Mensagem não encontrada")
            self._ensure_current_actor_can_target_loja(actor, mensagem["loja_id"])
            return mensagem

    def create_case_from_messages(self, loja_id: int, mensagem_ids: Iterable[int], tipo_caso: str, titulo: str, actor: Actor, responsavel_usuario_id: Optional[int] = None) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "primeiro_vigilante", "segundo_vigilante", "secretario", "financeiro"})
        self._ensure_current_actor_can_target_loja(actor, loja_id)
        ids = list(dict.fromkeys(mensagem_ids))
        if not ids:
            raise DomainError("Nenhuma mensagem informada")
        with self.db.transaction() as tx:
            mensagens = tx.fetch_all(
                """
                select *
                from mensagens
                where id = any(%s)
                  and loja_id = %s
                for update
                """,
                [ids, loja_id],
            )
            if len(mensagens) != len(ids):
                raise DomainError("Uma ou mais mensagens não pertencem à loja informada")
            caso = tx.fetch_one(
                """
                insert into casos_operacionais (
                    loja_id, tipo_caso, criado_por_usuario_id, responsavel_usuario_id,
                    origem, status, titulo
                ) values (%s, %s, %s, %s, 'painel', 'novo', %s)
                returning id
                """,
                [loja_id, tipo_caso, actor.user_id, responsavel_usuario_id, titulo],
            )
            caso_id = caso["id"]
            for mensagem in mensagens:
                tx.execute("insert into caso_mensagens (caso_id, mensagem_id) values (%s, %s)", [caso_id, mensagem["id"]])
                tx.execute("update mensagens set status = 'vinculado' where id = %s", [mensagem["id"]])
                if mensagem.get("arquivo_url") or mensagem.get("audio_url") or mensagem.get("texto"):
                    linked_file = None
                    file_url = mensagem.get("arquivo_url") or mensagem.get("audio_url")
                    if file_url:
                        linked_file = tx.fetch_one(
                            "select id from arquivos where loja_id = %s and url_armazenamento = %s and deleted_at is null limit 1",
                            [loja_id, file_url],
                        )
                    tx.execute(
                        """
                        insert into evidencias (
                            caso_id, arquivo_id, tipo, texto_extraido, transcricao, enviado_por_telefone, data_envio
                        ) values (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        [
                            caso_id,
                            linked_file["id"] if linked_file else None,
                            self._infer_evidence_type(mensagem["tipo"]),
                            mensagem.get("texto"),
                            mensagem.get("transcricao"),
                            mensagem.get("enviado_por_telefone"),
                            mensagem["created_at"],
                        ],
                    )
            self.audit.log(
                tx=tx,
                loja_id=loja_id,
                usuario_id=actor.user_id,
                acao="caso_criado_por_mensagens",
                modulo="casos",
                entidade_tipo="caso",
                entidade_id=caso_id,
                origem="painel",
                detalhes={"mensagem_ids": ids},
            )
            return caso_id

    def list_cases(self, actor: Actor, loja_id: Optional[int] = None, tipo_caso: Optional[str] = None, status: Optional[str] = None):
        target_loja_id = loja_id if actor.cargo == "admin_principal" and loja_id is not None else actor.loja_id
        self._ensure_current_actor_can_target_loja(actor, target_loja_id)
        query = "select * from casos_operacionais where loja_id = %s and deleted_at is null"
        params = [target_loja_id]
        if tipo_caso:
            query += " and tipo_caso = %s"
            params.append(tipo_caso)
        if status:
            query += " and status = %s"
            params.append(status)
        query += " order by id desc"
        with self.db.transaction() as tx:
            return tx.fetch_all(query, params)

    def get_case(self, caso_id: int, actor: Actor):
        with self.db.transaction() as tx:
            caso = tx.fetch_one("select * from casos_operacionais where id = %s and deleted_at is null", [caso_id])
            if not caso:
                raise DomainError("Caso não encontrado")
            self._ensure_current_actor_can_target_loja(actor, caso["loja_id"])
            return caso

    def list_case_messages(self, caso_id: int, actor: Actor):
        caso = self.get_case(caso_id, actor)
        with self.db.transaction() as tx:
            return tx.fetch_all(
                """
                select m.*
                from caso_mensagens cm
                join mensagens m on m.id = cm.mensagem_id
                where cm.caso_id = %s and m.loja_id = %s
                order by m.id asc
                """,
                [caso_id, caso["loja_id"]],
            )

    def list_case_evidences(self, caso_id: int, actor: Actor):
        self.get_case(caso_id, actor)
        with self.db.transaction() as tx:
            return tx.fetch_all("select * from evidencias where caso_id = %s order by id asc", [caso_id])

    def approve_entity(self, entidade_tipo: str, entidade_id: int, decisao: str, actor: Actor, observacao: Optional[str] = None, valor: Optional[Decimal] = None) -> None:
        with self.db.transaction() as tx:
            entidade_loja_id = self._resolve_entity_loja_id(tx, entidade_tipo, entidade_id)
            self._ensure_current_actor_can_target_loja(actor, entidade_loja_id)
            delegacao = self._find_valid_delegation(tx=tx, user_id=actor.user_id, entidade_tipo=entidade_tipo, valor=valor)
            if not self._has_native_permission(actor.cargo, entidade_tipo) and not delegacao:
                raise PermissionDenied("Usuário sem permissão para aprovar esta entidade")
            tx.execute(
                """
                insert into aprovacoes (
                    entidade_tipo, entidade_id, aprovado_por_usuario_id,
                    delegacao_id, decisao, observacao
                ) values (%s, %s, %s, %s, %s, %s)
                """,
                [entidade_tipo, entidade_id, actor.user_id, delegacao["id"] if delegacao else None, decisao, observacao],
            )
            self._update_entity_status_after_approval(tx, entidade_tipo, entidade_id, decisao)
            self.audit.log(
                tx=tx,
                loja_id=entidade_loja_id if entidade_loja_id is not None else actor.loja_id,
                usuario_id=actor.user_id,
                acao="entidade_aprovada" if decisao == "aprovado" else "entidade_rejeitada",
                modulo="aprovacoes",
                entidade_tipo=entidade_tipo,
                entidade_id=entidade_id,
                origem="painel",
                detalhes={"observacao": observacao},
            )

    def create_reimbursement_from_case(self, caso_id: int, categoria: str, valor_solicitado: Decimal, actor: Actor, irmao_id: Optional[int] = None) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "primeiro_vigilante", "financeiro", "secretario"})
        with self.db.transaction() as tx:
            caso = tx.fetch_one("select id, loja_id from casos_operacionais where id = %s and deleted_at is null for update", [caso_id])
            if not caso:
                raise DomainError("Caso não encontrado")
            self._ensure_current_actor_can_target_loja(actor, caso["loja_id"])
            reembolso = tx.fetch_one(
                """
                insert into reembolsos (
                    caso_id, loja_id, irmao_id, categoria,
                    valor_solicitado, status
                ) values (%s, %s, %s, %s, %s, 'pendente')
                returning id
                """,
                [caso_id, caso["loja_id"], irmao_id, categoria, valor_solicitado],
            )
            self.audit.log(
                tx=tx,
                loja_id=caso["loja_id"],
                usuario_id=actor.user_id,
                acao="reembolso_criado",
                modulo="financeiro",
                entidade_tipo="reembolso",
                entidade_id=reembolso["id"],
                origem="painel",
                detalhes={"caso_id": caso_id, "categoria": categoria},
            )
            return reembolso["id"]

    def list_reimbursements(self, actor: Actor, loja_id: Optional[int] = None, status: Optional[str] = None):
        target_loja_id = loja_id if actor.cargo == "admin_principal" and loja_id is not None else actor.loja_id
        self._ensure_current_actor_can_target_loja(actor, target_loja_id)
        with self.db.transaction() as tx:
            if status:
                return tx.fetch_all(
                    "select * from reembolsos where loja_id = %s and deleted_at is null and status = %s order by id desc",
                    [target_loja_id, status],
                )
            return tx.fetch_all(
                "select * from reembolsos where loja_id = %s and deleted_at is null order by id desc",
                [target_loja_id],
            )

    def get_reimbursement(self, reembolso_id: int, actor: Actor):
        with self.db.transaction() as tx:
            reembolso = tx.fetch_one("select * from reembolsos where id = %s and deleted_at is null", [reembolso_id])
            if not reembolso:
                raise DomainError("Reembolso não encontrado")
            self._ensure_current_actor_can_target_loja(actor, reembolso["loja_id"])
            return reembolso

    def mark_reimbursement_paid(self, reembolso_id: int, actor: Actor, valor_aprovado: Optional[Decimal] = None, observacao_financeiro: Optional[str] = None, data_pagamento=None) -> None:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "financeiro"})
        with self.db.transaction() as tx:
            reembolso = tx.fetch_one("select * from reembolsos where id = %s and deleted_at is null for update", [reembolso_id])
            if not reembolso:
                raise DomainError("Reembolso não encontrado")
            self._ensure_current_actor_can_target_loja(actor, reembolso["loja_id"])
            if reembolso["status"] not in {"aprovado", "pendente"}:
                raise DomainError("Reembolso não pode ser pago neste status")
            tx.execute(
                """
                update reembolsos
                set status = 'pago',
                    valor_aprovado = coalesce(%s, valor_aprovado, valor_solicitado),
                    aprovado_por_usuario_id = %s,
                    observacao_financeiro = %s,
                    data_pagamento = coalesce(%s, current_date),
                    updated_at = now()
                where id = %s
                """,
                [valor_aprovado, actor.user_id, observacao_financeiro, data_pagamento, reembolso_id],
            )
            self.audit.log(
                tx=tx,
                loja_id=reembolso["loja_id"],
                usuario_id=actor.user_id,
                acao="reembolso_pago",
                modulo="financeiro",
                entidade_tipo="reembolso",
                entidade_id=reembolso_id,
                origem="painel",
                detalhes={"observacao": observacao_financeiro},
            )

    def create_file_record(
        self,
        loja_id: int,
        categoria: str,
        nome_original: str,
        url_armazenamento: str,
        actor: Actor,
        tipo_mime: Optional[str] = None,
        tamanho_bytes: Optional[int] = None,
        sha256: Optional[str] = None,
        caso_id: Optional[int] = None,
        contrato_id: Optional[int] = None,
        irmao_id: Optional[int] = None,
        origem_envio: str = 'site',
        enviado_por_telefone: Optional[str] = None,
    ) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "primeiro_vigilante", "segundo_vigilante", "secretario", "financeiro"})
        self._ensure_current_actor_can_target_loja(actor, loja_id)
        with self.db.transaction() as tx:
            arquivo = tx.fetch_one(
                """
                insert into arquivos (
                    loja_id, irmao_id, contrato_id, caso_id, categoria,
                    nome_original, tipo_mime, tamanho_bytes, sha256,
                    url_armazenamento, origem_envio, status,
                    enviado_por_usuario_id, enviado_por_telefone
                ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'ativo', %s, %s)
                returning id
                """,
                [
                    loja_id,
                    irmao_id,
                    contrato_id,
                    caso_id,
                    categoria,
                    nome_original,
                    tipo_mime,
                    tamanho_bytes,
                    sha256,
                    url_armazenamento,
                    origem_envio,
                    actor.user_id,
                    enviado_por_telefone,
                ],
            )
            self.audit.log(
                tx=tx,
                loja_id=loja_id,
                usuario_id=actor.user_id,
                acao="arquivo_registrado",
                modulo="arquivos",
                entidade_tipo="arquivo",
                entidade_id=arquivo["id"],
                origem="painel",
                detalhes={"categoria": categoria, "caso_id": caso_id},
            )
            return arquivo["id"]

    def list_files(self, actor: Actor, loja_id: Optional[int] = None):
        target_loja_id = loja_id if actor.cargo == "admin_principal" and loja_id is not None else actor.loja_id
        self._ensure_current_actor_can_target_loja(actor, target_loja_id)
        with self.db.transaction() as tx:
            return tx.fetch_all(
                "select * from arquivos where loja_id = %s and deleted_at is null order by id desc",
                [target_loja_id],
            )

    def get_file(self, file_id: int, actor: Actor):
        with self.db.transaction() as tx:
            arquivo = tx.fetch_one("select * from arquivos where id = %s and deleted_at is null", [file_id])
            if not arquivo:
                raise DomainError("Arquivo não encontrado")
            self._ensure_current_actor_can_target_loja(actor, arquivo["loja_id"])
            return arquivo

    def register_file_access(self, file_id: int, actor: Actor, acao: str = 'visualizou') -> None:
        with self.db.transaction() as tx:
            arquivo = tx.fetch_one("select id, loja_id from arquivos where id = %s and deleted_at is null", [file_id])
            if not arquivo:
                raise DomainError("Arquivo não encontrado")
            self._ensure_current_actor_can_target_loja(actor, arquivo["loja_id"])
            tx.execute(
                "insert into acessos_arquivo (arquivo_id, usuario_id, acao, origem) values (%s, %s, %s, 'painel')",
                [file_id, actor.user_id, acao],
            )
            self.audit.log(
                tx=tx,
                loja_id=arquivo["loja_id"],
                usuario_id=actor.user_id,
                acao="arquivo_acessado",
                modulo="arquivos",
                entidade_tipo="arquivo",
                entidade_id=file_id,
                origem="painel",
                detalhes={"acao": acao},
            )

    def generate_billing_for_contract(self, contrato_id: int, competencia: str, valor: Decimal, data_vencimento, actor: Actor) -> int:
        self._ensure_action_allowed(actor, {"admin_principal", "veneravel_mestre", "financeiro"})
        with self.db.transaction() as tx:
            contrato = tx.fetch_one(
                """
                select *
                from contratos
                where id = %s and status = 'ativo' and deleted_at is null
                for update
                """,
                [contrato_id],
            )
            if not contrato:
                raise DomainError("Contrato ativo não encontrado")
            self._ensure_current_actor_can_target_loja(actor, contrato["loja_id"])
            existente = tx.fetch_one(
                """
                select id
                from cobrancas
                where contrato_id = %s
                  and competencia = %s
                  and deleted_at is null
                for update
                """,
                [contrato_id, competencia],
            )
            if existente:
                return existente["id"]
            cobranca = tx.fetch_one(
                """
                insert into cobrancas (
                    loja_id, contrato_id, competencia, valor, data_vencimento, status
                ) values (%s, %s, %s, %s, %s, 'pendente')
                returning id
                """,
                [contrato["loja_id"], contrato_id, competencia, valor, data_vencimento],
            )
            self.audit.log(
                tx=tx,
                loja_id=contrato["loja_id"],
                usuario_id=actor.user_id,
                acao="cobranca_gerada",
                modulo="financeiro",
                entidade_tipo="cobranca",
                entidade_id=cobranca["id"],
                origem="painel",
                detalhes={"competencia": competencia, "contrato_id": contrato_id},
            )
            return cobranca["id"]
