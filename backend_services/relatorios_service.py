from __future__ import annotations

from typing import Optional


class RelatoriosService:
    def __init__(self, db):
        self.db = db

    def _compras_filters(self, loja_id: int, incluir_ocultos: bool,
                         data_inicio, data_fim, status: Optional[str] = None):
        filters = ["c.loja_id = %s"]
        params: list = [loja_id]
        if not incluir_ocultos:
            filters.append("c.visivel = TRUE")
        if status:
            filters.append("c.status = %s")
            params.append(status)
        if data_inicio:
            filters.append("c.criado_em >= %s")
            params.append(data_inicio)
        if data_fim:
            filters.append("c.criado_em <= %s")
            params.append(data_fim)
        return " AND ".join(filters), params

    def tesouraria(self, loja_id: int, data_inicio=None, data_fim=None,
                   incluir_ocultos: bool = False) -> dict:
        where, params = self._compras_filters(loja_id, incluir_ocultos, data_inicio, data_fim)

        with self.db.transaction() as tx:
            compras = tx.fetch_all(
                f"""SELECT c.id, c.evento, c.valor, c.status, c.visivel,
                           c.criado_em, c.aprovado_em, c.observacao,
                           u.nome  AS usuario_nome,
                           ap.nome AS aprovado_por_nome,
                           r.nome  AS regra_nome,
                           c.regra_rateio_id
                    FROM compras c
                    JOIN  usuarios u  ON u.id  = c.usuario_id
                    LEFT JOIN usuarios ap ON ap.id = c.aprovado_por
                    LEFT JOIN regras_rateio r ON r.id = c.regra_rateio_id
                    WHERE {where} ORDER BY c.criado_em DESC""",
                params,
            )

            for compra in compras:
                if compra.get("regra_rateio_id"):
                    compra["rateio"] = tx.fetch_all(
                        """SELECT cc.nome AS centro_nome, ri.percentual,
                                  ROUND(c.valor * ri.percentual / 100, 2) AS valor_rateado
                           FROM compras c
                           JOIN regras_rateio_itens ri ON ri.regra_id = c.regra_rateio_id
                           JOIN centros_custo cc ON cc.id = ri.centro_custo_id
                           WHERE c.id = %s""",
                        (compra["id"],),
                    )
                else:
                    compra["rateio"] = []

            resumo_status = tx.fetch_all(
                f"""SELECT status, COUNT(*) AS qtd,
                           COALESCE(SUM(valor), 0) AS total
                    FROM compras c WHERE {where}
                    GROUP BY status""",
                params,
            )

            # approved only for cost-center breakdown
            where_ap, params_ap = self._compras_filters(
                loja_id, incluir_ocultos, data_inicio, data_fim, status="aprovado"
            )
            resumo_centros = tx.fetch_all(
                f"""SELECT cc.nome AS centro_nome,
                           ROUND(SUM(c.valor * ri.percentual / 100), 2) AS total
                    FROM compras c
                    JOIN regras_rateio_itens ri ON ri.regra_id = c.regra_rateio_id
                    JOIN centros_custo cc ON cc.id = ri.centro_custo_id
                    WHERE {where_ap}
                    GROUP BY cc.nome ORDER BY total DESC""",
                params_ap,
            )

            # ágape: eventos do tipo agape no mesmo período
            ev_filters = ["loja_id = %s", "tipo = 'agape'"]
            ev_params: list = [loja_id]
            if data_inicio:
                ev_filters.append("data >= %s")
                ev_params.append(data_inicio)
            if data_fim:
                ev_filters.append("data <= %s")
                ev_params.append(data_fim)
            ev_where = " AND ".join(ev_filters)
            agape_eventos = tx.fetch_all(
                f"SELECT titulo, data, hora_inicio, hora_fim FROM agenda_eventos WHERE {ev_where} ORDER BY data",
                ev_params,
            )

        return {
            "compras": compras,
            "resumo_status": resumo_status,
            "resumo_centros_custo": resumo_centros,
            "agape_eventos": agape_eventos,
        }

    def mensalidades(self, loja_id: int, data_inicio=None, data_fim=None) -> list:
        filters = ["i.loja_id = %s"]
        params: list = [loja_id]
        if data_inicio:
            filters.append("rm.vigencia_inicio >= %s")
            params.append(data_inicio)
        if data_fim:
            filters.append("rm.vigencia_inicio <= %s")
            params.append(data_fim)
        where = " AND ".join(filters)
        with self.db.transaction() as tx:
            return tx.fetch_all(
                f"""SELECT i.nome, i.cim, rm.categoria, rm.valor_mensal,
                           rm.vigencia_inicio, rm.vigencia_fim
                    FROM regras_mensalidade rm
                    JOIN irmaos i ON i.id = rm.irmao_id
                    WHERE {where} ORDER BY i.nome""",
                params,
            )

    def agenda(self, loja_id: int, data_inicio=None, data_fim=None) -> list:
        filters = ["loja_id = %s", "deleted_at IS NULL"]
        params: list = [loja_id]
        if data_inicio:
            filters.append("data_evento >= %s")
            params.append(data_inicio)
        if data_fim:
            filters.append("data_evento <= %s")
            params.append(data_fim)
        where = " AND ".join(filters)
        with self.db.transaction() as tx:
            return tx.fetch_all(
                f"SELECT * FROM eventos WHERE {where} ORDER BY data_evento, hora_inicio",
                params,
            )
