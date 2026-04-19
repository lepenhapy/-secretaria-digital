from __future__ import annotations

from typing import Optional


class RateioService:
    def __init__(self, db):
        self.db = db

    # ── Centros de custo ──────────────────────────────────────────────────────

    def criar_centro_custo(self, loja_id: int, nome: str, descricao: Optional[str] = None) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "INSERT INTO centros_custo (loja_id, nome, descricao) VALUES (%s,%s,%s) RETURNING id",
                (loja_id, nome, descricao),
            )
            return row["id"]

    def listar_centros_custo(self, loja_id: int, apenas_ativos: bool = True) -> list:
        cond = "WHERE loja_id=%s" + (" AND ativo=TRUE" if apenas_ativos else "")
        with self.db.transaction() as tx:
            return tx.fetch_all(f"SELECT * FROM centros_custo {cond} ORDER BY nome", (loja_id,))

    def atualizar_centro_custo(self, centro_id: int, nome: str,
                                descricao: Optional[str], ativo: bool):
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE centros_custo SET nome=%s, descricao=%s, ativo=%s WHERE id=%s",
                (nome, descricao, ativo, centro_id),
            )

    def deletar_centro_custo(self, centro_id: int):
        with self.db.transaction() as tx:
            tx.execute("DELETE FROM centros_custo WHERE id=%s", (centro_id,))

    # ── Regras de rateio ──────────────────────────────────────────────────────

    def _validar_itens(self, itens: list):
        if not itens:
            raise ValueError("Regra deve ter ao menos um item.")
        total = sum(float(i["percentual"]) for i in itens)
        if abs(total - 100) > 0.01:
            raise ValueError(f"Percentuais devem somar 100 %. Soma atual: {total:.2f} %")

    def criar_regra(self, loja_id: int, nome: str, descricao: Optional[str],
                    itens: list, criado_por: int) -> int:
        self._validar_itens(itens)
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "INSERT INTO regras_rateio (loja_id, nome, descricao, criado_por) VALUES (%s,%s,%s,%s) RETURNING id",
                (loja_id, nome, descricao, criado_por),
            )
            regra_id = row["id"]
            for item in itens:
                tx.execute(
                    "INSERT INTO regras_rateio_itens (regra_id, centro_custo_id, percentual) VALUES (%s,%s,%s)",
                    (regra_id, item["centro_custo_id"], item["percentual"]),
                )
            return regra_id

    def listar_regras(self, loja_id: int, apenas_ativas: bool = True) -> list:
        cond = "WHERE r.loja_id=%s" + (" AND r.ativo=TRUE" if apenas_ativas else "")
        with self.db.transaction() as tx:
            regras = tx.fetch_all(
                f"""SELECT r.*, u.nome AS criado_por_nome
                    FROM regras_rateio r
                    LEFT JOIN usuarios u ON u.id = r.criado_por
                    {cond} ORDER BY r.nome""",
                (loja_id,),
            )
            for regra in regras:
                regra["itens"] = tx.fetch_all(
                    """SELECT ri.*, cc.nome AS centro_nome
                       FROM regras_rateio_itens ri
                       JOIN centros_custo cc ON cc.id = ri.centro_custo_id
                       WHERE ri.regra_id=%s""",
                    (regra["id"],),
                )
            return regras

    def obter_regra(self, regra_id: int) -> Optional[dict]:
        with self.db.transaction() as tx:
            regra = tx.fetch_one("SELECT * FROM regras_rateio WHERE id=%s", (regra_id,))
            if regra:
                regra["itens"] = tx.fetch_all(
                    """SELECT ri.*, cc.nome AS centro_nome
                       FROM regras_rateio_itens ri
                       JOIN centros_custo cc ON cc.id = ri.centro_custo_id
                       WHERE ri.regra_id=%s""",
                    (regra_id,),
                )
            return regra

    def atualizar_regra(self, regra_id: int, nome: str, descricao: Optional[str],
                        ativo: bool, itens: Optional[list] = None):
        if itens is not None:
            self._validar_itens(itens)
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE regras_rateio SET nome=%s, descricao=%s, ativo=%s WHERE id=%s",
                (nome, descricao, ativo, regra_id),
            )
            if itens is not None:
                tx.execute("DELETE FROM regras_rateio_itens WHERE regra_id=%s", (regra_id,))
                for item in itens:
                    tx.execute(
                        "INSERT INTO regras_rateio_itens (regra_id, centro_custo_id, percentual) VALUES (%s,%s,%s)",
                        (regra_id, item["centro_custo_id"], item["percentual"]),
                    )

    def deletar_regra(self, regra_id: int):
        with self.db.transaction() as tx:
            tx.execute("DELETE FROM regras_rateio WHERE id=%s", (regra_id,))

    def calcular_rateio(self, valor: float, regra_id: int) -> list:
        regra = self.obter_regra(regra_id)
        if not regra:
            return []
        return [
            {
                "centro_custo_id": item["centro_custo_id"],
                "centro_nome": item["centro_nome"],
                "percentual": float(item["percentual"]),
                "valor": round(float(valor) * float(item["percentual"]) / 100, 2),
            }
            for item in regra["itens"]
        ]
