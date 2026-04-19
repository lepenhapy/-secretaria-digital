from backend_services.auth_service import AuthService


class FakeTx:
    def __init__(self, password_hash):
        self.password_hash = password_hash

    def fetch_one(self, query, params):
        return {
            "id": 1,
            "loja_id": 10,
            "senha_hash": self.password_hash,
            "cargo": "admin_principal",
        }


class FakeDb:
    def __init__(self, password_hash):
        self.tx = FakeTx(password_hash)

    def transaction(self):
        return self

    def __enter__(self):
        return self.tx

    def __exit__(self, exc_type, exc, tb):
        return False


def test_authenticate_basic_with_argon2_hash():
    password_hash = AuthService.hash_password("senha-forte")
    service = AuthService(FakeDb(password_hash))

    actor = service.authenticate_basic("admin@example.com", "senha-forte")

    assert actor is not None
    assert actor.user_id == 1
    assert actor.cargo == "admin_principal"


def test_authenticate_basic_rejects_wrong_password():
    password_hash = AuthService.hash_password("senha-forte")
    service = AuthService(FakeDb(password_hash))

    actor = service.authenticate_basic("admin@example.com", "senha-errada")

    assert actor is None
