import secrets
from decimal import Decimal
from typing import Optional

from backend_services.auth_service import AuthService
from backend_services.core_transaction_services import DomainError
from backend_services.email_service import EmailService


class RegistrationService:
    def __init__(self, db, email_service: EmailService):
        self.db    = db
        self.email = email_service

    # ── Cadastro de usuário ────────────────────────────────────────────────

    def registrar(self, nome: str, nome_usuario: str, email: str, senha: str) -> None:
        with self.db.transaction() as tx:
            if tx.fetch_one(
                "select id from usuarios where email = %s and deleted_at is null",
                [email],
            ):
                raise DomainError("E-mail já cadastrado.")

            cargo = tx.fetch_one("select id from cargos where nome = 'irmao_operacional'", [])
            if not cargo:
                raise DomainError("Cargo padrão não encontrado. Execute as migrations.")

            email_ok = self.email.configurado()
            token = secrets.token_urlsafe(32) if email_ok else None
            tx.execute(
                """
                insert into usuarios
                  (nome, email, senha_hash, cargo_id, ativo, email_confirmado, confirmacao_token)
                values (%s, %s, %s, %s, %s, %s, %s)
                """,
                [nome, email, AuthService.hash_password(senha), cargo["id"],
                 not email_ok, not email_ok, token],
            )

        if email_ok:
            self.email.send_confirmation(to_email=email, nome=nome, token=token)

    def confirmar_email(self, token: str) -> dict:
        with self.db.transaction() as tx:
            user = tx.fetch_one(
                "select id, nome, email from usuarios where confirmacao_token = %s and deleted_at is null",
                [token],
            )
            if not user:
                raise DomainError("Token inválido ou já utilizado.")

            tx.execute(
                """
                update usuarios
                set ativo = true, email_confirmado = true,
                    confirmacao_token = null, updated_at = now()
                where id = %s
                """,
                [user["id"]],
            )
            return {"nome": user["nome"], "email": user["email"]}

    # ── Irmãos ─────────────────────────────────────────────────────────────

    def criar_irmao(
        self,
        loja_id: int,
        nome: str,
        telefone: Optional[str],
        cim: Optional[str],
        potencia: Optional[str],
        data_nascimento: Optional[str],
        nome_esposa: Optional[str],
        data_nascimento_esposa: Optional[str],
        filhos: Optional[list],
        mensalidade_categoria: Optional[str],
        mensalidade_valor: Optional[Decimal],
    ) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """
                insert into irmaos
                  (loja_id, nome, telefone, cim, potencia,
                   data_nascimento, nome_esposa, data_nascimento_esposa)
                values (%s, %s, %s, %s, %s, %s, %s, %s)
                returning id
                """,
                [loja_id, nome, telefone, cim, potencia,
                 data_nascimento or None, nome_esposa, data_nascimento_esposa or None],
            )
            irmao_id = row["id"]

            for filho in (filhos or []):
                tx.execute(
                    "insert into irmaos_filhos (irmao_id, nome, data_nascimento) values (%s, %s, %s)",
                    [irmao_id, filho.get("nome"), filho.get("data_nascimento") or None],
                )

            if mensalidade_categoria and mensalidade_valor is not None:
                tx.execute(
                    """
                    insert into regras_mensalidade
                      (irmao_id, categoria, valor, vigencia_inicio)
                    values (%s, %s, %s, current_date)
                    """,
                    [irmao_id, mensalidade_categoria, mensalidade_valor],
                )

            return irmao_id

    def listar_irmaos(self, loja_id: int) -> list:
        with self.db.transaction() as tx:
            irmaos = tx.fetch_all(
                """
                select i.id, i.nome, i.telefone, i.cim, i.potencia,
                       i.data_nascimento, i.nome_esposa, i.data_nascimento_esposa,
                       i.status, i.created_at, i.cargo_loja,
                       rm.categoria as mensalidade_categoria,
                       rm.valor     as mensalidade_valor
                from irmaos i
                left join regras_mensalidade rm on rm.irmao_id = i.id
                  and rm.vigencia_fim is null
                where i.loja_id = %s and i.deleted_at is null
                order by i.nome
                """,
                [loja_id],
            )
            ids = [r["id"] for r in irmaos]
            filhos_map: dict = {}
            if ids:
                filhos = tx.fetch_all(
                    f"select * from irmaos_filhos where irmao_id = any(%s::bigint[]) order by data_nascimento",
                    [ids],
                )
                for f in filhos:
                    filhos_map.setdefault(f["irmao_id"], []).append(f)

            result = []
            for ir in irmaos:
                d = dict(ir)
                d["filhos"] = filhos_map.get(ir["id"], [])
                result.append(d)
            return result

    def definir_regra_mensalidade(
        self,
        irmao_id: int,
        categoria: str,
        valor: Decimal,
        vigencia_inicio: str,
        vigencia_fim: Optional[str],
        observacao: Optional[str],
    ) -> int:
        with self.db.transaction() as tx:
            # Encerra regra vigente atual
            tx.execute(
                """
                update regras_mensalidade
                set vigencia_fim = current_date, updated_at = now()
                where irmao_id = %s and vigencia_fim is null
                """,
                [irmao_id],
            )
            row = tx.fetch_one(
                """
                insert into regras_mensalidade
                  (irmao_id, categoria, valor, vigencia_inicio, vigencia_fim, observacao)
                values (%s, %s, %s, %s, %s, %s)
                returning id
                """,
                [irmao_id, categoria, valor, vigencia_inicio, vigencia_fim or None, observacao],
            )
            return row["id"]
