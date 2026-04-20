from __future__ import annotations

from typing import Optional

# Recursos e ações disponíveis no sistema
RECURSOS = {
    "compras":      ["ver", "criar", "aprovar", "ocultar"],
    "irmaos":       ["ver", "criar", "editar"],
    "boletos":      ["ver", "processar"],
    "relatorios":   ["ver", "imprimir"],
    "agenda":       ["ver", "criar", "editar", "excluir"],
    "rateio":       ["ver", "criar", "editar", "excluir"],
    "mensalidades": ["ver", "editar"],
}

# Permissões padrão por cargo (usadas quando não há config customizada)
DEFAULTS: dict[str, dict[str, list[str]]] = {
    "veneravel_mestre": {r: list(a) for r, a in RECURSOS.items()},  # tudo
    "primeiro_vigilante": {
        "compras": ["ver", "criar", "aprovar", "ocultar"],
        "irmaos": ["ver"], "boletos": ["ver"],
        "relatorios": ["ver", "imprimir"], "agenda": ["ver", "criar"],
        "rateio": ["ver"], "mensalidades": ["ver"],
    },
    "segundo_vigilante": {
        "compras": ["ver", "criar"],
        "irmaos": ["ver"], "boletos": ["ver"],
        "relatorios": ["ver"], "agenda": ["ver", "criar"],
        "rateio": ["ver"], "mensalidades": ["ver"],
    },
    "financeiro": {
        "compras": ["ver", "criar", "aprovar", "ocultar"],
        "irmaos": ["ver"], "boletos": ["ver", "processar"],
        "relatorios": ["ver", "imprimir"],
        "rateio": ["ver", "criar", "editar", "excluir"],
        "mensalidades": ["ver", "editar"], "agenda": ["ver"],
    },
    "secretario": {
        "compras": ["ver", "criar"],
        "irmaos": ["ver", "criar", "editar"],
        "boletos": ["ver"], "relatorios": ["ver", "imprimir"],
        "agenda": ["ver", "criar", "editar", "excluir"],
        "rateio": ["ver"], "mensalidades": ["ver"],
    },
    "admin_principal": {r: list(a) for r, a in RECURSOS.items()},
}


class PermissoesService:
    def __init__(self, db):
        self.db = db

    def listar(self, loja_id: int) -> dict:
        """Retorna mapa cargo → recurso → [acoes] para esta loja."""
        with self.db.transaction() as tx:
            rows = tx.fetch_all(
                "SELECT cargo, recurso, acoes FROM cargo_permissoes WHERE loja_id=%s",
                (loja_id,),
            )
        # Começa com defaults e sobrescreve com o que estiver no banco
        result: dict[str, dict[str, list]] = {}
        for cargo, defaults in DEFAULTS.items():
            result[cargo] = {r: list(a) for r, a in defaults.items()}

        for row in rows:
            cargo = row["cargo"]
            if cargo not in result:
                result[cargo] = {}
            result[cargo][row["recurso"]] = list(row["acoes"] or [])

        return result

    def salvar(self, loja_id: int, cargo: str, recurso: str, acoes: list[str]):
        acoes_validas = [a for a in acoes if a in (RECURSOS.get(recurso) or [])]
        with self.db.transaction() as tx:
            tx.execute(
                """INSERT INTO cargo_permissoes (loja_id, cargo, recurso, acoes)
                   VALUES (%s,%s,%s,%s)
                   ON CONFLICT (loja_id, cargo, recurso)
                   DO UPDATE SET acoes = EXCLUDED.acoes""",
                (loja_id, cargo, recurso, acoes_validas),
            )

    def verificar(self, loja_id: int, cargo: str, recurso: str, acao: str) -> bool:
        """Verifica se um cargo tem permissão para acao em recurso."""
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "SELECT acoes FROM cargo_permissoes WHERE loja_id=%s AND cargo=%s AND recurso=%s",
                (loja_id, cargo, recurso),
            )
        if row:
            return acao in (row["acoes"] or [])
        # Fallback para default
        return acao in DEFAULTS.get(cargo, {}).get(recurso, [])

    def listar_recursos(self) -> dict:
        return {r: list(a) for r, a in RECURSOS.items()}
