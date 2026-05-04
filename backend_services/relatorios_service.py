from __future__ import annotations

from typing import Optional


class RelatoriosService:
    def __init__(self, db):
        self.db = db

    def _compras_filters(self, loja_id: int, incluir_ocultos: bool,
                         data_inicio, data_fim, status: Optional[str] = None):
        filters = ["c.loja_id = %s", "c.deleted_at IS NULL"]
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
        filters = ["i.loja_id = %s", "i.deleted_at IS NULL"]
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
                f"""SELECT i.nome, i.cim, rm.categoria, rm.valor,
                           rm.vigencia_inicio, rm.vigencia_fim
                    FROM regras_mensalidade rm
                    JOIN irmaos i ON i.id = rm.irmao_id
                    WHERE {where} ORDER BY i.nome""",
                params,
            )

    def agenda(self, loja_id: int, data_inicio=None, data_fim=None) -> list:
        filters = ["loja_id = %s"]
        params: list = [loja_id]
        if data_inicio:
            filters.append("data >= %s")
            params.append(data_inicio)
        if data_fim:
            filters.append("data <= %s")
            params.append(data_fim)
        where = " AND ".join(filters)
        with self.db.transaction() as tx:
            return tx.fetch_all(
                f"SELECT id, titulo, tipo, data, hora_inicio, hora_fim, local FROM agenda_eventos WHERE {where} ORDER BY data, hora_inicio",
                params,
            )

    def financeiro(self, loja_id: int, data_inicio=None, data_fim=None) -> dict:
        with self.db.transaction() as tx:
            # Lançamentos do fluxo de caixa
            lf_filters = ["loja_id = %s"]
            lf_params: list = [loja_id]
            if data_inicio:
                lf_filters.append("data_lancamento >= %s")
                lf_params.append(data_inicio)
            if data_fim:
                lf_filters.append("data_lancamento <= %s")
                lf_params.append(data_fim)
            lf_where = " AND ".join(lf_filters)

            lancamentos = tx.fetch_all(
                f"""SELECT tipo, descricao, valor, categoria, data_lancamento, conciliado
                    FROM lancamentos_financeiros
                    WHERE {lf_where} ORDER BY data_lancamento DESC""",
                lf_params,
            )

            resumo_fluxo = tx.fetch_all(
                f"""SELECT tipo,
                           COALESCE(SUM(valor), 0) AS total,
                           COUNT(*) AS qtd
                    FROM lancamentos_financeiros WHERE {lf_where}
                    GROUP BY tipo""",
                lf_params,
            )

            # Contas a pagar/receber
            cf_filters = ["loja_id = %s"]
            cf_params: list = [loja_id]
            if data_inicio:
                cf_filters.append("vencimento >= %s")
                cf_params.append(data_inicio)
            if data_fim:
                cf_filters.append("vencimento <= %s")
                cf_params.append(data_fim)
            cf_where = " AND ".join(cf_filters)

            contas = tx.fetch_all(
                f"""SELECT tipo, descricao, valor, status, vencimento, categoria
                    FROM contas_financeiras
                    WHERE {cf_where} ORDER BY vencimento""",
                cf_params,
            )

            resumo_contas = tx.fetch_all(
                f"""SELECT tipo, status,
                           COALESCE(SUM(valor), 0) AS total,
                           COUNT(*) AS qtd
                    FROM contas_financeiras WHERE {cf_where}
                    GROUP BY tipo, status""",
                cf_params,
            )

            # Investimentos e dívidas (sem filtro de período — são posições atuais)
            inv = tx.fetch_all(
                "SELECT tipo, descricao, valor, taxa_juros, vencimento FROM investimentos_dividas WHERE loja_id=%s ORDER BY tipo, descricao",
                [loja_id],
            )

            # Orçamento vs realizado no período
            orc_filters = ["o.loja_id = %s"]
            orc_params: list = [loja_id]
            if data_inicio:
                orc_filters.append("o.mes_ano >= %s")
                orc_params.append(data_inicio[:7])
            if data_fim:
                orc_filters.append("o.mes_ano <= %s")
                orc_params.append(data_fim[:7])
            orc_where = " AND ".join(orc_filters)

            orcamento = tx.fetch_all(
                f"""SELECT o.categoria, o.mes_ano,
                           o.valor_orcado,
                           COALESCE(SUM(l.valor), 0) AS valor_realizado
                    FROM orcamento_categorias o
                    LEFT JOIN lancamentos_financeiros l
                      ON l.loja_id = o.loja_id
                      AND l.categoria = o.categoria
                      AND DATE_TRUNC('month', l.data_lancamento) = DATE_TRUNC('month', TO_DATE(o.mes_ano, 'YYYY-MM'))
                      AND l.tipo = 'saida'
                    WHERE {orc_where}
                    GROUP BY o.categoria, o.mes_ano, o.valor_orcado
                    ORDER BY o.mes_ano, o.categoria""",
                orc_params,
            )

        total_entradas = sum(float(r["total"]) for r in resumo_fluxo if r["tipo"] == "entrada")
        total_saidas   = sum(float(r["total"]) for r in resumo_fluxo if r["tipo"] == "saida")

        return {
            "lancamentos": lancamentos,
            "resumo_fluxo": resumo_fluxo,
            "saldo_periodo": total_entradas - total_saidas,
            "total_entradas": total_entradas,
            "total_saidas": total_saidas,
            "contas": contas,
            "resumo_contas": resumo_contas,
            "investimentos": inv,
            "orcamento": orcamento,
        }
