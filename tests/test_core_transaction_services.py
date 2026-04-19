from decimal import Decimal

import pytest

from backend_services.core_transaction_services import (
    Actor,
    ConflictError,
    CoreTransactionServices,
    DomainError,
    PermissionDenied,
)


class FakeTx:
    def __init__(self, scenario=None):
        self.calls = []
        self.scenario = scenario or {}

    def fetch_one(self, query, params):
        self.calls.append(("fetch_one", query, params))

        if "insert into contratos" in query:
            return {"id": 456}

        if "insert into reembolsos" in query:
            return {"id": 654}

        if self.scenario.get("conflict") and "from agenda_slots" in query:
            return {"id": 99}

        if self.scenario.get("active_contract_exists") and "from contratos" in query and "status = 'ativo'" in query and "id <>" in query:
            return {"id": 2}

        if self.scenario.get("existing_billing") and "from cobrancas" in query:
            return {"id": 55}

        if self.scenario.get("delegation") and "from delegacoes" in query:
            return self.scenario["delegation"]

        if "insert into casos_operacionais" in query:
            return {"id": 777}

        if "insert into cobrancas" in query:
            return {"id": 888}

        if "from casos_operacionais" in query:
            return {"id": 777, "loja_id": 10}

        if "from reembolsos where id = %s and deleted_at is null for update" in query:
            return {
                "id": 654,
                "loja_id": 10,
                "status": self.scenario.get("reimbursement_status", "aprovado"),
                "valor_solicitado": Decimal("150.00"),
            }

        if "from reembolsos where id = %s and deleted_at is null" in query:
            return {
                "id": 654,
                "loja_id": 10,
                "status": "pendente",
                "valor_solicitado": Decimal("150.00"),
            }

        if "from reembolsos" in query:
            return {"loja_id": 10}

        if "select *\n                from contratos\n                where id = %s and deleted_at is null" in query:
            status = self.scenario.get("contract_status", "aceito")
            return {
                "id": 1,
                "loja_id": 10,
                "status": status,
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "select * from contratos where id = %s and deleted_at is null for update" in query:
            status = self.scenario.get("contract_status", "aceito")
            return {
                "id": 1,
                "loja_id": 10,
                "status": status,
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "select * from contratos where id = %s and deleted_at is null" in query:
            return {
                "id": 1,
                "loja_id": 10,
                "status": "enviado",
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "from contratos" in query and "status = 'ativo'" in query and "id <>" in query:
            if self.scenario.get("active_contract_exists"):
                return {"id": 2}
            return None

        if "from contratos" in query and "status = 'ativo'" in query:
            return {
                "id": 1,
                "loja_id": 10,
                "status": "ativo",
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "from contratos where id = %s and deleted_at is null" in query:
            return {
                "id": 1,
                "loja_id": 10,
                "status": self.scenario.get("contract_status", "aceito"),
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "from contratos where id = %s and status = 'ativo'" in query:
            return {
                "id": 1,
                "loja_id": 10,
                "status": "ativo",
                "templo_id": 3,
                "regra_recorrencia": "primeira segunda",
                "hora_inicio_sessao": "20:00",
                "hora_fim_sessao": "22:00",
                "vigencia_inicio": "2026-01-01",
                "vigencia_fim": "2026-12-31",
            }

        if "from lojas" in query:
            return {"id": 10}

        return None

    def fetch_all(self, query, params):
        self.calls.append(("fetch_all", query, params))
        if self.scenario.get("messages") is not None and "from mensagens" in query:
            return self.scenario["messages"]
        return []

    def execute(self, query, params):
        self.calls.append(("execute", query, params))


class FakeDb:
    def __init__(self, scenario=None):
        self.tx = FakeTx(scenario=scenario)

    def transaction(self):
        return self

    def __enter__(self):
        return self.tx

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeAudit:
    def __init__(self):
        self.entries = []

    def log(self, **kwargs):
        self.entries.append(kwargs)


def make_service(scenario=None):
    db = FakeDb(scenario=scenario)
    audit = FakeAudit()
    service = CoreTransactionServices(db=db, audit_service=audit, clock=None)
    actor = Actor(user_id=1, loja_id=10, cargo="admin_principal")
    return db, audit, service, actor


def test_create_contract_success():
    _, audit, service, actor = make_service()

    contract_id = service.create_contract(
        loja_id=10,
        templo_id=3,
        regra_recorrencia="primeira segunda",
        hora_inicio_sessao="20:00",
        hora_fim_sessao="22:00",
        vigencia_inicio="2026-04-01",
        vigencia_fim="2026-12-31",
        actor=actor,
    )

    assert contract_id == 456
    assert len(audit.entries) == 1


def test_submit_contract_success():
    db, audit, service, actor = make_service({"contract_status": "rascunho"})
    service.submit_contract_for_approval(1, actor)

    assert any("status = 'enviado'" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert len(audit.entries) == 1


def test_decide_contract_success():
    db, audit, service, actor = make_service({"contract_status": "enviado"})
    service.decide_contract(1, "aprovado", actor, "ok")

    assert any("insert into aprovacoes" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert any("status = %s" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert len(audit.entries) == 1


def test_activate_contract_runs_without_conflict():
    db, _, service, actor = make_service()
    service.activate_contract(1, actor)

    assert any("update contratos set status = 'ativo'" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert any("insert into agenda_slots" in call[1] for call in db.tx.calls if call[0] == "execute")


def test_activate_contract_raises_on_conflict():
    _, _, service, actor = make_service({"conflict": True})

    with pytest.raises(ConflictError):
        service.activate_contract(1, actor)


def test_activate_contract_raises_on_invalid_status():
    _, _, service, actor = make_service({"contract_status": "rascunho"})

    with pytest.raises(DomainError):
        service.activate_contract(1, actor)


def test_create_reimbursement_from_case_success():
    _, audit, service, actor = make_service()

    reimbursement_id = service.create_reimbursement_from_case(
        caso_id=777,
        categoria="agape",
        valor_solicitado=Decimal("150.00"),
        actor=actor,
    )

    assert reimbursement_id == 654
    assert len(audit.entries) == 1


def test_mark_reimbursement_paid_success():
    db, audit, service, actor = make_service()

    service.mark_reimbursement_paid(
        reembolso_id=654,
        actor=actor,
        valor_aprovado=Decimal("150.00"),
        observacao_financeiro="Pago",
    )

    assert any("update reembolsos" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert len(audit.entries) == 1


def test_mark_reimbursement_paid_invalid_status():
    _, _, service, actor = make_service({"reimbursement_status": "rejeitado"})

    with pytest.raises(DomainError):
        service.mark_reimbursement_paid(
            reembolso_id=654,
            actor=actor,
        )


def test_generate_billing_is_idempotent():
    db, _, service, actor = make_service({"existing_billing": True})

    billing_id = service.generate_billing_for_contract(
        contrato_id=1,
        competencia="2026-04",
        valor=Decimal("100.00"),
        data_vencimento="2026-04-10",
        actor=actor,
    )

    assert billing_id == 55
    assert not any("insert into cobrancas" in call[1] for call in db.tx.calls if call[0] == "fetch_one")


def test_approve_entity_denies_without_permission_or_delegation():
    _, _, service, _ = make_service()
    actor = Actor(user_id=2, loja_id=10, cargo="irmao_operacional")

    with pytest.raises(PermissionDenied):
        service.approve_entity("reembolso", 10, "aprovado", actor)


def test_approve_entity_allows_with_delegation():
    scenario = {
        "delegation": {
            "id": 900,
            "limite_valor": Decimal("300.00"),
        },
    }
    db, audit, service, _ = make_service(scenario)
    actor = Actor(user_id=2, loja_id=10, cargo="irmao_operacional")

    service.approve_entity(
        entidade_tipo="reembolso",
        entidade_id=10,
        decisao="aprovado",
        actor=actor,
        valor=Decimal("200.00"),
    )

    assert any("insert into aprovacoes" in call[1] for call in db.tx.calls if call[0] == "execute")
    assert len(audit.entries) == 1


def test_create_case_from_messages_denies_cross_loja_access():
    messages = [
        {
            "id": 1,
            "loja_id": 99,
            "tipo": "texto",
            "texto": "fora da loja",
            "transcricao": None,
            "enviado_por_telefone": "559999999",
            "created_at": "2026-04-08 10:00:00",
            "arquivo_url": None,
            "audio_url": None,
        }
    ]
    _, _, service, _ = make_service({"messages": messages})
    actor = Actor(user_id=2, loja_id=10, cargo="secretario")

    with pytest.raises(PermissionDenied):
        service.create_case_from_messages(
            loja_id=99,
            mensagem_ids=[1],
            tipo_caso="documento",
            titulo="Caso externo",
            actor=actor,
        )


def test_create_case_from_messages_links_messages_and_evidences():
    messages = [
        {
            "id": 1,
            "loja_id": 10,
            "tipo": "texto",
            "texto": "recibo do ágape",
            "transcricao": None,
            "enviado_por_telefone": "559999999",
            "created_at": "2026-04-08 10:00:00",
            "arquivo_url": None,
            "audio_url": None,
        },
        {
            "id": 2,
            "loja_id": 10,
            "tipo": "imagem",
            "texto": None,
            "transcricao": None,
            "enviado_por_telefone": "559999999",
            "created_at": "2026-04-08 10:01:00",
            "arquivo_url": "https://example/file.jpg",
            "audio_url": None,
        },
    ]
    db, audit, service, actor = make_service({"messages": messages})

    case_id = service.create_case_from_messages(
        loja_id=10,
        mensagem_ids=[1, 2],
        tipo_caso="agape",
        titulo="Reembolso ágape",
        actor=actor,
    )

    assert case_id == 777
    assert sum(1 for call in db.tx.calls if call[0] == "execute" and "insert into caso_mensagens" in call[1]) == 2
    assert sum(1 for call in db.tx.calls if call[0] == "execute" and "insert into evidencias" in call[1]) == 2
    assert len(audit.entries) == 1


def test_generate_billing_denies_wrong_loja_for_non_admin():
    _, _, service, _ = make_service()
    actor = Actor(user_id=2, loja_id=11, cargo="financeiro")

    with pytest.raises(PermissionDenied):
        service.generate_billing_for_contract(
            contrato_id=1,
            competencia="2026-04",
            valor=Decimal("100.00"),
            data_vencimento="2026-04-10",
            actor=actor,
        )
