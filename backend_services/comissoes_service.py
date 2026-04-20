from __future__ import annotations

from typing import Optional


class ComissoesService:
    def __init__(self, db, whatsapp_service=None):
        self.db = db
        self.whatsapp = whatsapp_service

    # ── Comissões ─────────────────────────────────────────────────────────────

    def criar_comissao(self, loja_id: int, nome: str, descricao: Optional[str] = None) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "INSERT INTO comissoes (loja_id, nome, descricao) VALUES (%s,%s,%s) RETURNING id",
                (loja_id, nome, descricao),
            )
            return row["id"]

    def listar_comissoes(self, loja_id: int, apenas_ativas: bool = True) -> list:
        cond = "WHERE c.loja_id=%s" + (" AND c.ativo=TRUE" if apenas_ativas else "")
        with self.db.transaction() as tx:
            comissoes = tx.fetch_all(
                f"""SELECT c.*,
                           COUNT(cm.id) FILTER (WHERE cm.ativo=TRUE) AS total_membros
                    FROM comissoes c
                    LEFT JOIN comissoes_membros cm ON cm.comissao_id = c.id
                    {cond} GROUP BY c.id ORDER BY c.nome""",
                (loja_id,),
            )
            for com in comissoes:
                com["membros"] = tx.fetch_all(
                    """SELECT cm.*, i.nome AS irmao_nome, i.cim,
                              cg.nome AS cargo_sistema
                       FROM comissoes_membros cm
                       JOIN irmaos i ON i.id = cm.irmao_id
                       LEFT JOIN usuarios u ON u.id = i.usuario_id
                       LEFT JOIN cargos cg ON cg.id = u.cargo_id
                       WHERE cm.comissao_id=%s AND cm.ativo=TRUE
                       ORDER BY i.nome""",
                    (com["id"],),
                )
            return comissoes

    def atualizar_comissao(self, comissao_id: int, nome: str,
                           descricao: Optional[str], ativo: bool):
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE comissoes SET nome=%s, descricao=%s, ativo=%s WHERE id=%s",
                (nome, descricao, ativo, comissao_id),
            )

    def deletar_comissao(self, comissao_id: int):
        with self.db.transaction() as tx:
            tx.execute("DELETE FROM comissoes WHERE id=%s", (comissao_id,))

    # ── Membros ────────────────────────────────────────────────────────────────

    def adicionar_membro(self, comissao_id: int, irmao_id: int,
                         funcao: Optional[str] = None,
                         data_inicio: Optional[str] = None,
                         data_fim: Optional[str] = None):
        with self.db.transaction() as tx:
            tx.execute(
                """INSERT INTO comissoes_membros (comissao_id, irmao_id, funcao, data_inicio, data_fim)
                   VALUES (%s,%s,%s,%s,%s)
                   ON CONFLICT (comissao_id, irmao_id) DO UPDATE
                   SET funcao=EXCLUDED.funcao, data_inicio=EXCLUDED.data_inicio,
                       data_fim=EXCLUDED.data_fim, ativo=TRUE""",
                (comissao_id, irmao_id, funcao, data_inicio, data_fim),
            )

    def remover_membro(self, comissao_id: int, irmao_id: int):
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE comissoes_membros SET ativo=FALSE WHERE comissao_id=%s AND irmao_id=%s",
                (comissao_id, irmao_id),
            )

    # ── Cargo do irmão no sistema ──────────────────────────────────────────────

    def atribuir_cargo(self, irmao_id: int, cargo: str, loja_id: int):
        """Atualiza o cargo do usuário vinculado ao irmão."""
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "SELECT usuario_id FROM irmaos WHERE id=%s AND loja_id=%s",
                (irmao_id, loja_id),
            )
            if not row or not row["usuario_id"]:
                raise ValueError("Irmão não possui conta de usuário vinculada.")
            cargo_nome = cargo if cargo else 'irmao_operacional'
            cargo_row = tx.fetch_one("SELECT id FROM cargos WHERE nome=%s", (cargo_nome,))
            if not cargo_row:
                raise ValueError(f"Cargo '{cargo_nome}' não encontrado.")
            tx.execute(
                "UPDATE usuarios SET cargo_id=%s WHERE id=%s",
                (cargo_row["id"], row["usuario_id"]),
            )

    def listar_irmaos_com_cargos(self, loja_id: int) -> list:
        with self.db.transaction() as tx:
            return tx.fetch_all(
                """SELECT i.id, i.nome, i.cim, cg.nome AS cargo_sistema,
                          u.email, u.id AS usuario_id
                   FROM irmaos i
                   LEFT JOIN usuarios u ON u.id = i.usuario_id
                   LEFT JOIN cargos cg ON cg.id = u.cargo_id
                   WHERE i.loja_id=%s
                   ORDER BY i.nome""",
                (loja_id,),
            )

    def comissoes_do_irmao(self, irmao_id: int) -> list:
        with self.db.transaction() as tx:
            return tx.fetch_all(
                """SELECT c.nome AS comissao_nome, cm.funcao, cm.data_inicio, cm.data_fim
                   FROM comissoes_membros cm
                   JOIN comissoes c ON c.id = cm.comissao_id
                   WHERE cm.irmao_id=%s AND cm.ativo=TRUE ORDER BY c.nome""",
                (irmao_id,),
            )
