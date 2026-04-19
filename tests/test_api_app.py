from io import BytesIO

from fastapi.testclient import TestClient

from backend_api.app import app
from backend_api.dependencies import get_current_actor, get_file_storage, get_services
from backend_services.core_transaction_services import Actor, ConflictError, PermissionDenied, DomainError


class FakeStorage:
    def save_file(self, loja_id, original_name, content):
        return {
            "path": f"/tmp/{original_name}",
            "sha256": "abc123",
            "size": len(content),
            "stored_name": original_name,
            "extension": ".txt",
        }

    def exists(self, path):
        return True


class FakeServices:
    def activate_contract(self, contrato_id, actor):
        if contrato_id == 999:
            raise ConflictError("conflito")

    def validate_schedule_conflict(self, **kwargs):
        return None

    def create_message(self, **kwargs):
        return 777

    def list_messages(self, **kwargs):
        return [{"id": 777, "tipo": "texto", "loja_id": 10}]

    def get_message(self, message_id, actor):
        if message_id == 404:
            raise DomainError("Mensagem não encontrada")
        return {"id": message_id, "tipo": "texto", "loja_id": actor.loja_id}

    def create_case_from_messages(self, **kwargs):
        if kwargs["loja_id"] == 999:
            raise PermissionDenied("sem acesso")
        return 123

    def list_cases(self, **kwargs):
        return [{"id": 123, "tipo_caso": "agape", "loja_id": 10}]

    def get_case(self, case_id, actor):
        if case_id == 404:
            raise DomainError("Caso não encontrado")
        return {"id": case_id, "tipo_caso": "agape", "loja_id": actor.loja_id}

    def list_case_messages(self, case_id, actor):
        return [{"id": 1, "texto": "mensagem teste", "loja_id": actor.loja_id}]

    def list_case_evidences(self, case_id, actor):
        return [{"id": 1, "tipo": "texto", "caso_id": case_id}]

    def approve_entity(self, **kwargs):
        return None

    def generate_billing_for_contract(self, **kwargs):
        return 321

    def create_contract(self, **kwargs):
        return 456

    def submit_contract_for_approval(self, contract_id, actor):
        return None

    def decide_contract(self, contract_id, decisao, actor, observacao=None):
        return None

    def get_contract(self, contract_id, actor):
        if contract_id == 404:
            raise DomainError("Contrato não encontrado")
        return {"id": contract_id, "status": "enviado", "loja_id": actor.loja_id}

    def create_reimbursement_from_case(self, **kwargs):
        return 654

    def list_reimbursements(self, **kwargs):
        return [{"id": 654, "status": "pendente", "loja_id": 10}]

    def get_reimbursement(self, reimbursement_id, actor):
        if reimbursement_id == 404:
            raise DomainError("Reembolso não encontrado")
        return {"id": reimbursement_id, "status": "pendente", "loja_id": actor.loja_id}

    def mark_reimbursement_paid(self, reembolso_id, actor, valor_aprovado=None, observacao_financeiro=None, data_pagamento=None):
        if reembolso_id == 999:
            raise DomainError("Reembolso não pode ser pago")
        return None

    def create_file_record(self, **kwargs):
        return 900

    def list_files(self, **kwargs):
        return [{"id": 900, "nome_original": "teste.txt", "loja_id": 10}]

    def get_file(self, file_id, actor):
        if file_id == 404:
            raise DomainError("Arquivo não encontrado")
        return {
            "id": file_id,
            "nome_original": "teste.txt",
            "loja_id": actor.loja_id,
            "url_armazenamento": __file__,
            "tipo_mime": "text/plain",
        }

    def register_file_access(self, file_id, actor, acao='baixou'):
        return None


def override_actor():
    return Actor(user_id=1, loja_id=10, cargo="admin_principal")


def override_services():
    return FakeServices()


def override_storage():
    return FakeStorage()


app.dependency_overrides[get_current_actor] = override_actor
app.dependency_overrides[get_services] = override_services
app.dependency_overrides[get_file_storage] = override_storage
client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_me():
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["user_id"] == 1


def test_create_contract_success():
    response = client.post("/contracts", json={"loja_id": 10, "templo_id": 3, "regra_recorrencia": "primeira segunda", "hora_inicio_sessao": "20:00", "hora_fim_sessao": "22:00", "vigencia_inicio": "2026-04-01", "vigencia_fim": "2026-12-31"})
    assert response.status_code == 200
    assert response.json()["contract_id"] == 456


def test_get_contract_success():
    response = client.get("/contracts/1")
    assert response.status_code == 200
    assert response.json()["status"] == "enviado"


def test_submit_contract_success():
    response = client.post("/contracts/1/submit")
    assert response.status_code == 200
    assert response.json()["status"] == "submitted"


def test_decide_contract_success():
    response = client.post("/contracts/1/decision", json={"decisao": "aprovado", "observacao": "ok"})
    assert response.status_code == 200
    assert response.json()["status"] == "aprovado"


def test_activate_contract_success():
    response = client.post("/contracts/activate", json={"contrato_id": 1})
    assert response.status_code == 200
    assert response.json()["status"] == "activated"


def test_activate_contract_conflict():
    response = client.post("/contracts/activate", json={"contrato_id": 999})
    assert response.status_code == 409


def test_create_message_success():
    response = client.post("/messages", json={"loja_id": 10, "tipo": "texto", "texto": "gastei 100 no agape", "contexto": "agape"})
    assert response.status_code == 200
    assert response.json()["message_id"] == 777


def test_list_messages_success():
    response = client.get("/messages")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 777


def test_get_message_success():
    response = client.get("/messages/777")
    assert response.status_code == 200
    assert response.json()["id"] == 777


def test_create_case_success():
    response = client.post("/cases/from-messages", json={"loja_id_alvo": 10, "mensagem_ids": [1, 2], "tipo_caso": "agape", "titulo": "Caso teste"})
    assert response.status_code == 200
    assert response.json()["case_id"] == 123


def test_create_case_permission_denied():
    response = client.post("/cases/from-messages", json={"loja_id_alvo": 999, "mensagem_ids": [1], "tipo_caso": "documento", "titulo": "Negado"})
    assert response.status_code == 403


def test_list_cases_success():
    response = client.get("/cases")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 123


def test_get_case_success():
    response = client.get("/cases/123")
    assert response.status_code == 200
    assert response.json()["id"] == 123


def test_list_case_messages_success():
    response = client.get("/cases/123/messages")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 1


def test_list_case_evidences_success():
    response = client.get("/cases/123/evidences")
    assert response.status_code == 200
    assert response.json()[0]["caso_id"] == 123


def test_create_reimbursement_success():
    response = client.post("/reimbursements", json={"caso_id": 123, "categoria": "agape", "valor_solicitado": "150.00", "irmao_id": 7})
    assert response.status_code == 200
    assert response.json()["reimbursement_id"] == 654


def test_list_reimbursements_success():
    response = client.get("/reimbursements")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 654


def test_get_reimbursement_success():
    response = client.get("/reimbursements/654")
    assert response.status_code == 200
    assert response.json()["status"] == "pendente"


def test_mark_reimbursement_paid_success():
    response = client.post("/reimbursements/654/pay", json={"valor_aprovado": "150.00", "observacao_financeiro": "Pago"})
    assert response.status_code == 200
    assert response.json()["status"] == "paid"


def test_upload_file_success():
    response = client.post("/files/upload", data={"loja_id": "10", "categoria": "documento", "caso_id": "123"}, files={"file": ("teste.txt", BytesIO(b"conteudo"), "text/plain")})
    assert response.status_code == 200
    assert response.json()["file_id"] == 900


def test_list_files_success():
    response = client.get("/files")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 900


def test_get_file_success():
    response = client.get("/files/900")
    assert response.status_code == 200
    assert response.json()["nome_original"] == "teste.txt"


def test_download_file_success():
    response = client.get("/files/900/download")
    assert response.status_code == 200
