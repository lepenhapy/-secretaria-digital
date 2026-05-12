from __future__ import annotations
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


class BebidasService:
    def __init__(self, db):
        self.db = db

    # ── Utilitários ────────────────────────────────────────────────────────

    def _q(self, v) -> Decimal:
        return Decimal(str(v)).quantize(Decimal('0.01'), ROUND_HALF_UP)

    def _saldo(self, tx, loja_id: int, irmao_id: int) -> Decimal:
        row = tx.fetch_one(
            "SELECT saldo FROM bebidas_saldos WHERE loja_id=%s AND irmao_id=%s",
            [loja_id, irmao_id],
        )
        return Decimal(str(row['saldo'])) if row else Decimal('0')

    def _ajustar_saldo(self, tx, loja_id: int, irmao_id: int, delta: Decimal):
        tx.execute(
            """INSERT INTO bebidas_saldos (loja_id, irmao_id, saldo, updated_at)
               VALUES (%s, %s, %s, NOW())
               ON CONFLICT (loja_id, irmao_id)
               DO UPDATE SET saldo = bebidas_saldos.saldo + EXCLUDED.saldo,
                             updated_at = NOW()""",
            [loja_id, irmao_id, delta],
        )

    # ── Algoritmo de rateio ────────────────────────────────────────────────

    def calcular_rateio(self, custo_total: Decimal, participantes: list) -> list:
        """
        participantes: [{'part_id': int, 'irmao_id': int|None, 'saldo': Decimal}]
        Retorna: [{'part_id', 'irmao_id', 'valor_base', 'credito_aplicado', 'valor_final'}]

        Externos (irmao_id=None) nunca têm crédito, pagam a cota base cheia.
        """
        n = len(participantes)
        if n == 0:
            return []

        custo = Decimal(str(custo_total))
        base  = custo / n

        resultado = []
        total_credito = Decimal('0')

        for p in participantes:
            saldo   = Decimal(str(p['saldo'])) if p.get('irmao_id') else Decimal('0')
            credito = min(max(saldo, Decimal('0')), base)
            total_credito += credito
            resultado.append({
                'part_id':          p['part_id'],
                'irmao_id':         p.get('irmao_id'),
                'valor_base':       base,
                'credito_aplicado': credito,
                'valor_final':      base - credito,
            })

        # Redistribuir gap de créditos entre quem ainda deve
        if total_credito > 0:
            devedores = [r for r in resultado if r['valor_final'] > 0]
            if devedores:
                extra = total_credito / len(devedores)
                for r in devedores:
                    r['valor_final'] += extra

        # Arredondar + ajustar último para fechar exato
        for r in resultado:
            r['valor_base']       = self._q(r['valor_base'])
            r['credito_aplicado'] = self._q(r['credito_aplicado'])
            r['valor_final']      = self._q(r['valor_final'])

        total_calc = sum(r['valor_final'] for r in resultado)
        diff = self._q(custo) - total_calc
        if diff != 0:
            for r in reversed(resultado):
                if r['valor_final'] > 0:
                    r['valor_final'] += diff
                    break

        return resultado

    # ── Sessão ─────────────────────────────────────────────────────────────

    def criar_sessao(self, loja_id: int, titulo: str, custo_total: Decimal,
                     criado_por: int, agape_id: Optional[int] = None) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO bebidas_sessao
                     (loja_id, agape_id, titulo, custo_total, criado_por)
                   VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                [loja_id, agape_id, titulo, custo_total, criado_por],
            )
            return row['id']

    def listar_sessoes(self, loja_id: int) -> list:
        with self.db.transaction() as tx:
            rows = tx.fetch_all(
                """SELECT s.id, s.titulo, s.custo_total, s.status, s.criado_em,
                          i.nome AS criado_por_nome, i.chave_pix,
                          COUNT(bp.id)                              AS n_participantes,
                          COUNT(bp.id) FILTER (WHERE bp.pago)      AS n_pagos,
                          COALESCE(SUM(bp.valor_final)
                            FILTER (WHERE NOT bp.pago), 0)         AS pendente
                   FROM bebidas_sessao s
                   LEFT JOIN irmaos i              ON i.id = s.criado_por
                   LEFT JOIN bebidas_participantes bp ON bp.sessao_id = s.id
                   WHERE s.loja_id=%s AND s.deleted_at IS NULL
                   GROUP BY s.id, i.nome, i.chave_pix
                   ORDER BY s.criado_em DESC LIMIT 30""",
                [loja_id],
            )
            return [dict(r) for r in rows]

    def get_sessao(self, sessao_id: int, loja_id: int) -> Optional[dict]:
        with self.db.transaction() as tx:
            s = tx.fetch_one(
                """SELECT s.*, i.nome AS criado_por_nome, i.chave_pix,
                          i.telefone AS criado_por_tel, i.whatsapp AS criado_por_wa
                   FROM bebidas_sessao s
                   LEFT JOIN irmaos i ON i.id = s.criado_por
                   WHERE s.id=%s AND s.loja_id=%s AND s.deleted_at IS NULL""",
                [sessao_id, loja_id],
            )
            if not s:
                return None
            participantes = tx.fetch_all(
                """SELECT bp.id AS part_id, bp.irmao_id, bp.pago, bp.pago_em,
                          bp.valor_base, bp.credito_aplicado, bp.valor_final,
                          COALESCE(i.nome, bp.externo_nome)         AS nome,
                          COALESCE(i.telefone, bp.externo_telefone) AS telefone,
                          i.whatsapp, i.chave_pix,
                          COALESCE(bs.saldo, 0)                     AS saldo_atual,
                          (bp.irmao_id IS NULL)                     AS is_externo
                   FROM bebidas_participantes bp
                   LEFT JOIN irmaos i ON i.id = bp.irmao_id
                   LEFT JOIN bebidas_saldos bs
                     ON bs.irmao_id = bp.irmao_id AND bs.loja_id = %s
                   WHERE bp.sessao_id=%s
                   ORDER BY nome""",
                [loja_id, sessao_id],
            )
            return {'sessao': dict(s), 'participantes': [dict(p) for p in participantes]}

    def atualizar_custo(self, sessao_id: int, loja_id: int, custo_total: Decimal):
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE bebidas_sessao SET custo_total=%s WHERE id=%s AND loja_id=%s",
                [custo_total, sessao_id, loja_id],
            )

    def excluir_sessao(self, sessao_id: int, loja_id: int):
        with self.db.transaction() as tx:
            tx.execute(
                "UPDATE bebidas_sessao SET deleted_at=NOW() WHERE id=%s AND loja_id=%s",
                [sessao_id, loja_id],
            )

    # ── Participantes (irmãos) ─────────────────────────────────────────────

    def toggle_participante(self, sessao_id: int, irmao_id: int, loja_id: int) -> bool:
        """Adiciona ou remove irmão da sessão. Retorna True se adicionado."""
        with self.db.transaction() as tx:
            existe = tx.fetch_one(
                "SELECT id FROM bebidas_participantes WHERE sessao_id=%s AND irmao_id=%s",
                [sessao_id, irmao_id],
            )
            if existe:
                tx.execute(
                    "DELETE FROM bebidas_participantes WHERE sessao_id=%s AND irmao_id=%s",
                    [sessao_id, irmao_id],
                )
                return False
            else:
                tx.execute(
                    "INSERT INTO bebidas_participantes (sessao_id, irmao_id) VALUES (%s, %s)",
                    [sessao_id, irmao_id],
                )
                return True

    # ── Participantes externos ─────────────────────────────────────────────

    def adicionar_externo(self, sessao_id: int, nome: str,
                          telefone: Optional[str]) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO bebidas_participantes (sessao_id, externo_nome, externo_telefone)
                   VALUES (%s, %s, %s) RETURNING id""",
                [sessao_id, nome, telefone],
            )
            return row['id']

    def remover_externo(self, sessao_id: int, part_id: int):
        with self.db.transaction() as tx:
            tx.execute(
                """DELETE FROM bebidas_participantes
                   WHERE id=%s AND sessao_id=%s AND irmao_id IS NULL""",
                [part_id, sessao_id],
            )

    # ── Recálculo ──────────────────────────────────────────────────────────

    def recalcular(self, sessao_id: int, loja_id: int) -> list:
        with self.db.transaction() as tx:
            s = tx.fetch_one(
                "SELECT custo_total FROM bebidas_sessao WHERE id=%s AND loja_id=%s",
                [sessao_id, loja_id],
            )
            if not s:
                raise ValueError("Sessão não encontrada")

            participantes = tx.fetch_all(
                """SELECT bp.id AS part_id, bp.irmao_id, bp.pago,
                          bp.valor_final AS valor_pago_atual,
                          COALESCE(bs.saldo, 0) AS saldo
                   FROM bebidas_participantes bp
                   LEFT JOIN bebidas_saldos bs
                     ON bs.irmao_id = bp.irmao_id AND bs.loja_id = %s
                   WHERE bp.sessao_id=%s""",
                [loja_id, sessao_id],
            )

            nao_pagos = [p for p in participantes if not p['pago']]
            pagos     = [p for p in participantes if p['pago']]

            total_pago = sum(
                Decimal(str(p['valor_pago_atual'] or 0)) for p in pagos
            )
            custo_restante = Decimal(str(s['custo_total'])) - total_pago

            if not nao_pagos:
                return []

            rateio = self.calcular_rateio(
                custo_restante,
                [{'part_id': p['part_id'], 'irmao_id': p['irmao_id'],
                  'saldo': p['saldo']} for p in nao_pagos],
            )

            for r in rateio:
                tx.execute(
                    """UPDATE bebidas_participantes
                       SET valor_base=%s, credito_aplicado=%s, valor_final=%s
                       WHERE id=%s AND pago=FALSE""",
                    [r['valor_base'], r['credito_aplicado'], r['valor_final'],
                     r['part_id']],
                )

            return rateio

    # ── Pagamento (irmão) ──────────────────────────────────────────────────

    def confirmar_pagamento(self, sessao_id: int, irmao_id: int,
                             pago_por: Optional[int], loja_id: int) -> dict:
        with self.db.transaction() as tx:
            p = tx.fetch_one(
                """SELECT bp.id AS part_id, bp.pago, bp.valor_final, bp.credito_aplicado
                   FROM bebidas_participantes bp
                   WHERE bp.sessao_id=%s AND bp.irmao_id=%s""",
                [sessao_id, irmao_id],
            )
            if not p:
                raise ValueError("Participante não encontrado")
            if p['pago']:
                raise ValueError("Já marcado como pago")
            if p['valor_final'] is None:
                raise ValueError("Recalcule o rateio antes de confirmar o pagamento")

            return self._confirmar_part(tx, p, pago_por, loja_id, sessao_id,
                                        irmao_id_para_credito=irmao_id)

    def desfazer_pagamento(self, sessao_id: int, irmao_id: int, loja_id: int):
        with self.db.transaction() as tx:
            p = tx.fetch_one(
                "SELECT id AS part_id, pago, credito_aplicado FROM bebidas_participantes WHERE sessao_id=%s AND irmao_id=%s",
                [sessao_id, irmao_id],
            )
            if not p or not p['pago']:
                raise ValueError("Pagamento não encontrado")
            self._desfazer_part(tx, p, loja_id, irmao_id_para_credito=irmao_id)

    # ── Pagamento (externo — usa part_id) ─────────────────────────────────

    def confirmar_pagamento_ext(self, part_id: int,
                                pago_por: Optional[int], loja_id: int) -> dict:
        with self.db.transaction() as tx:
            p = tx.fetch_one(
                """SELECT id AS part_id, sessao_id, pago, valor_final, credito_aplicado
                   FROM bebidas_participantes WHERE id=%s AND irmao_id IS NULL""",
                [part_id],
            )
            if not p:
                raise ValueError("Convidado não encontrado")
            if p['pago']:
                raise ValueError("Já marcado como pago")
            if p['valor_final'] is None:
                raise ValueError("Recalcule o rateio antes de confirmar o pagamento")

            return self._confirmar_part(tx, p, pago_por, loja_id,
                                        p['sessao_id'], irmao_id_para_credito=None)

    def desfazer_pagamento_ext(self, part_id: int, loja_id: int):
        with self.db.transaction() as tx:
            p = tx.fetch_one(
                "SELECT id AS part_id, pago, credito_aplicado FROM bebidas_participantes WHERE id=%s AND irmao_id IS NULL",
                [part_id],
            )
            if not p or not p['pago']:
                raise ValueError("Pagamento não encontrado")
            self._desfazer_part(tx, p, loja_id, irmao_id_para_credito=None)

    # ── Helpers internos ───────────────────────────────────────────────────

    def _confirmar_part(self, tx, p, pago_por, loja_id, sessao_id,
                        irmao_id_para_credito):
        valor   = Decimal(str(p['valor_final']))
        credito = Decimal(str(p['credito_aplicado'] or 0))

        tx.execute(
            """UPDATE bebidas_participantes
               SET pago=TRUE, pago_em=NOW(), pago_por=%s
               WHERE id=%s""",
            [pago_por, p['part_id']],
        )

        if credito > 0 and irmao_id_para_credito:
            self._ajustar_saldo(tx, loja_id, irmao_id_para_credito, -credito)

        tx.execute(
            """INSERT INTO bebidas_lancamentos
                 (loja_id, sessao_id, irmao_id, tipo, valor, descricao)
               VALUES (%s, %s, %s, 'pagamento', %s, 'Pagamento confirmado')""",
            [loja_id, sessao_id, irmao_id_para_credito, valor],
        )
        return {'ok': True, 'valor': float(valor)}

    def _desfazer_part(self, tx, p, loja_id, irmao_id_para_credito):
        credito = Decimal(str(p['credito_aplicado'] or 0))
        tx.execute(
            "UPDATE bebidas_participantes SET pago=FALSE, pago_em=NULL, pago_por=NULL WHERE id=%s",
            [p['part_id']],
        )
        if credito > 0 and irmao_id_para_credito:
            self._ajustar_saldo(tx, loja_id, irmao_id_para_credito, credito)

    # ── Saldos ─────────────────────────────────────────────────────────────

    def get_saldo(self, loja_id: int, irmao_id: int) -> dict:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "SELECT saldo, updated_at FROM bebidas_saldos WHERE loja_id=%s AND irmao_id=%s",
                [loja_id, irmao_id],
            )
            historico = tx.fetch_all(
                """SELECT bl.tipo, bl.valor, bl.descricao, bl.criado_em,
                          bs.titulo AS sessao
                   FROM bebidas_lancamentos bl
                   LEFT JOIN bebidas_sessao bs ON bs.id = bl.sessao_id
                   WHERE bl.loja_id=%s AND bl.irmao_id=%s
                   ORDER BY bl.criado_em DESC LIMIT 20""",
                [loja_id, irmao_id],
            )
            return {
                'saldo':    float(row['saldo']) if row else 0.0,
                'historico': [dict(h) for h in historico],
            }
