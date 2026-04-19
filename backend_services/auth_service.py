from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

from backend_services.core_transaction_services import Actor


_password_hasher = PasswordHasher()


class AuthService:
    def __init__(self, db):
        self.db = db

    def authenticate_basic(self, email: str, password: str) -> Actor | None:
        with self.db.transaction() as tx:
            user = tx.fetch_one(
                """
                select u.id, u.loja_id, u.senha_hash, c.nome as cargo
                from usuarios u
                join cargos c on c.id = u.cargo_id
                where u.email = %s
                  and u.ativo = true
                  and u.deleted_at is null
                limit 1
                """,
                [email],
            )
            if not user:
                return None

            if not self.verify_password(password, user["senha_hash"]):
                return None

            return Actor(
                user_id=user["id"],
                loja_id=user["loja_id"],
                cargo=user["cargo"],
            )

    @staticmethod
    def hash_password(plain_password: str) -> str:
        return _password_hasher.hash(plain_password)

    @staticmethod
    def verify_password(plain_password: str, stored_hash: str) -> bool:
        try:
            return _password_hasher.verify(stored_hash, plain_password)
        except (VerifyMismatchError, VerificationError, ValueError):
            return False
