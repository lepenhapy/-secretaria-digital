from __future__ import annotations

import base64
import os
from typing import Optional


class ComprasService:
    def __init__(self, db, file_storage, whatsapp_service=None):
        self.db = db
        self.storage = file_storage
        self.whatsapp = whatsapp_service

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def criar_compra(self, loja_id: int, usuario_id: int, evento: str,
                     valor: float, regra_rateio_id: Optional[int] = None,
                     whatsapp_from: Optional[str] = None) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO compras (loja_id, usuario_id, evento, valor, regra_rateio_id, whatsapp_from)
                   VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""",
                (loja_id, usuario_id, evento, valor, regra_rateio_id, whatsapp_from),
            )
            return row["id"]

    def adicionar_arquivo(self, compra_id: int, tipo: str, caminho: str,
                          nome_original: str, tamanho_bytes: int, sha256: str,
                          conteudo: bytes = None):
        with self.db.transaction() as tx:
            tx.execute(
                """INSERT INTO compras_arquivos
                   (compra_id, tipo, caminho, nome_original, tamanho_bytes, sha256, conteudo)
                   VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (compra_id, tipo, caminho, nome_original, tamanho_bytes, sha256, conteudo),
            )

    def listar_compras(self, loja_id: int, incluir_ocultos: bool = False,
                       status: Optional[str] = None, usuario_id: Optional[int] = None,
                       data_inicio=None, data_fim=None) -> list:
        filters = ["c.loja_id = %s"]
        params: list = [loja_id]
        if not incluir_ocultos:
            filters.append("c.visivel = TRUE")
        if status:
            filters.append("c.status = %s")
            params.append(status)
        if usuario_id:
            filters.append("c.usuario_id = %s")
            params.append(usuario_id)
        if data_inicio:
            filters.append("c.criado_em >= %s")
            params.append(data_inicio)
        if data_fim:
            filters.append("c.criado_em <= %s")
            params.append(data_fim)

        where = " AND ".join(filters)
        with self.db.transaction() as tx:
            rows = tx.fetch_all(
                f"""SELECT c.*,
                           u.nome  AS usuario_nome,
                           u.email AS usuario_email,
                           ap.nome AS aprovado_por_nome,
                           r.nome  AS regra_nome
                    FROM compras c
                    JOIN usuarios u  ON u.id  = c.usuario_id
                    LEFT JOIN usuarios ap ON ap.id = c.aprovado_por
                    LEFT JOIN regras_rateio r ON r.id = c.regra_rateio_id
                    WHERE {where}
                    ORDER BY c.criado_em DESC""",
                params,
            )
            for row in rows:
                row["arquivos"] = tx.fetch_all(
                    "SELECT id, tipo, nome_original, tamanho_bytes, criado_em FROM compras_arquivos WHERE compra_id=%s",
                    (row["id"],),
                )
            return rows

    def obter_compra(self, compra_id: int) -> Optional[dict]:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """SELECT c.*, u.nome AS usuario_nome, u.email AS usuario_email
                   FROM compras c JOIN usuarios u ON u.id = c.usuario_id
                   WHERE c.id = %s""",
                (compra_id,),
            )
            if row:
                row["arquivos"] = tx.fetch_all(
                    "SELECT * FROM compras_arquivos WHERE compra_id=%s ORDER BY criado_em",
                    (compra_id,),
                )
            return row

    def listar_arquivos(self, compra_id: int) -> list:
        with self.db.transaction() as tx:
            return tx.fetch_all(
                "SELECT * FROM compras_arquivos WHERE compra_id=%s ORDER BY criado_em",
                (compra_id,),
            )

    def atualizar_status(self, compra_id: int, status: str,
                         aprovado_por: int, observacao: Optional[str] = None):
        with self.db.transaction() as tx:
            tx.execute(
                """UPDATE compras
                   SET status=%s, aprovado_por=%s, aprovado_em=NOW(), observacao=%s
                   WHERE id=%s""",
                (status, aprovado_por, observacao, compra_id),
            )

    def atualizar_visibilidade(self, compra_id: int, visivel: bool):
        with self.db.transaction() as tx:
            tx.execute("UPDATE compras SET visivel=%s WHERE id=%s", (visivel, compra_id))

    def arquivo_bytes(self, arquivo_id: int) -> Optional[tuple[bytes, str]]:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "SELECT caminho, nome_original, conteudo FROM compras_arquivos WHERE id=%s",
                (arquivo_id,),
            )
        if not row:
            return None
        nome = row["nome_original"] or "arquivo"
        if row.get("caminho") and os.path.exists(row["caminho"]):
            return open(row["caminho"], "rb").read(), nome
        if row.get("conteudo"):
            return bytes(row["conteudo"]), nome
        return None

    # ── Notificações ──────────────────────────────────────────────────────────

    def notificar_nova_compra(self, compra_id: int, loja_id: int):
        if not self.whatsapp:
            return
        try:
            with self.db.transaction() as tx:
                compra = tx.fetch_one(
                    """SELECT c.evento, c.valor, c.criado_em, u.nome AS usuario_nome
                       FROM compras c JOIN usuarios u ON u.id = c.usuario_id
                       WHERE c.id = %s""",
                    (compra_id,),
                )
                destinatarios = tx.fetch_all(
                    """SELECT i.whatsapp FROM notificacoes_destinatarios nd
                       JOIN irmaos i ON i.usuario_id = nd.usuario_id
                       WHERE nd.loja_id=%s AND nd.evento_tipo='nova_compra' AND nd.ativo=TRUE
                         AND i.whatsapp IS NOT NULL""",
                    (loja_id,),
                )
            if not compra:
                return
            msg = (
                f"💰 *Nova compra para reembolso*\n"
                f"Irmão: {compra['usuario_nome']}\n"
                f"Evento: {compra['evento']}\n"
                f"Valor: R$ {float(compra['valor']):.2f}\n"
                f"Data: {compra['criado_em'].strftime('%d/%m/%Y %H:%M')}"
            )
            for dest in destinatarios:
                try:
                    self.whatsapp.send_text(dest["whatsapp"], msg)
                except Exception:
                    pass
        except Exception:
            pass

    # ── WhatsApp webhook: detecta compra enviada via mídia ───────────────────

    def processar_midia_whatsapp(self, loja_id: int, remetente: str,
                                 mimetype: str, base64_data: str,
                                 caption: Optional[str] = None) -> dict:
        # Identifica usuário pelo número
        with self.db.transaction() as tx:
            usuario = tx.fetch_one(
                """SELECT u.id FROM usuarios u
                   JOIN irmaos i ON i.usuario_id = u.id
                   WHERE i.whatsapp = %s AND u.loja_id = %s""",
                (remetente, loja_id),
            )
        if not usuario:
            return {"status": "ignored", "motivo": "remetente não cadastrado"}

        ext_map = {
            "image/jpeg": (".jpg", "foto"),
            "image/png": (".png", "foto"),
            "application/pdf": (".pdf", "cupom"),
        }
        ext, tipo = ext_map.get(mimetype, (".bin", "arquivo"))

        content = base64.b64decode(base64_data)
        meta = self.storage.save_file(loja_id, f"compra{ext}", content)

        evento = caption or "Compra via WhatsApp"
        compra_id = self.criar_compra(
            loja_id=loja_id,
            usuario_id=usuario["id"],
            evento=evento,
            valor=0.0,
            whatsapp_from=remetente,
        )
        self.adicionar_arquivo(
            compra_id=compra_id,
            tipo=tipo,
            caminho=meta["path"],
            nome_original=f"compra{ext}",
            tamanho_bytes=meta["size"],
            sha256=meta["sha256"],
        )
        self.notificar_nova_compra(compra_id, loja_id)
        return {"status": "created", "compra_id": compra_id}
