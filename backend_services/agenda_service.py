from __future__ import annotations

import calendar
from datetime import date, timedelta
from typing import Optional


DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
TIPO_LABELS = {
    'sessao': 'Sessão', 'agape': 'Ágape',
    'administrativa': 'Adm.', 'especial': 'Especial', 'evento': 'Evento',
}


def _ocorrencias_no_mes(regra: dict, ano: int, mes: int) -> list[date]:
    """Calcula todas as datas em que uma regra recorrente ocorre num mês."""
    freq = regra['frequencia']
    vig_ini = regra.get('vigencia_inicio')
    vig_fim = regra.get('vigencia_fim')
    datas: list[date] = []

    primeiro = date(ano, mes, 1)
    ultimo   = date(ano, mes, calendar.monthrange(ano, mes)[1])

    if freq == 'semanal':
        dw = regra['dia_semana']  # 0=dom ... 6=sab (python: mon=0, so adjust)
        # Python weekday: Mon=0..Sun=6; nosso: Dom=0,Seg=1..Sab=6
        py_dw = (dw - 1) % 7
        d = primeiro
        while d <= ultimo:
            if d.weekday() == py_dw:
                datas.append(d)
            d += timedelta(days=1)

    elif freq == 'quinzenal':
        dw = regra['dia_semana']
        py_dw = (dw - 1) % 7
        matches = []
        d = primeiro
        while d <= ultimo:
            if d.weekday() == py_dw:
                matches.append(d)
            d += timedelta(days=1)
        # Quinzenal: pega intercalado a partir da vigência
        vi = vig_ini if vig_ini else primeiro
        if isinstance(vi, str):
            vi = date.fromisoformat(vi)
        for i, m in enumerate(matches):
            diff = (m - vi).days
            if diff >= 0 and (diff // 7) % 2 == 0:
                datas.append(m)

    elif freq == 'mensal_dia_semana':
        dw = regra['dia_semana']
        semana = regra.get('semana_mes', 1)
        py_dw = (dw - 1) % 7
        count = 0
        d = primeiro
        while d <= ultimo:
            if d.weekday() == py_dw:
                count += 1
                if count == semana:
                    datas.append(d)
                    break
            d += timedelta(days=1)

    elif freq == 'mensal_dia_numero':
        dia = regra.get('dia_mes', 1)
        try:
            datas.append(date(ano, mes, dia))
        except ValueError:
            pass

    # Filtra por vigência
    result = []
    for d in datas:
        if vig_ini:
            vi = vig_ini if isinstance(vig_ini, date) else date.fromisoformat(str(vig_ini)[:10])
            if d < vi:
                continue
        if vig_fim:
            vf = vig_fim if isinstance(vig_fim, date) else date.fromisoformat(str(vig_fim)[:10])
            if d > vf:
                continue
        result.append(d)
    return result


class AgendaService:
    def __init__(self, db):
        self.db = db

    # ── Sessões recorrentes ────────────────────────────────────────────────────

    def criar_sessao(self, loja_id: int, dados: dict) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO sessoes_recorrentes
                   (loja_id, titulo, descricao, tipo, frequencia, dia_semana,
                    semana_mes, dia_mes, hora_inicio, hora_fim, cor,
                    vigencia_inicio, vigencia_fim)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   RETURNING id""",
                (loja_id, dados['titulo'], dados.get('descricao'),
                 dados.get('tipo','sessao'), dados['frequencia'],
                 dados.get('dia_semana'), dados.get('semana_mes'),
                 dados.get('dia_mes'), dados['hora_inicio'], dados['hora_fim'],
                 dados.get('cor','#2563eb'),
                 dados.get('vigencia_inicio', str(date.today())),
                 dados.get('vigencia_fim')),
            )
            return row['id']

    def listar_sessoes(self, loja_id: int, apenas_ativas: bool = True) -> list:
        cond = "WHERE loja_id=%s" + (" AND ativo=TRUE" if apenas_ativas else "")
        with self.db.transaction() as tx:
            return tx.fetch_all(
                f"SELECT * FROM sessoes_recorrentes {cond} ORDER BY titulo",
                (loja_id,),
            )

    def deletar_sessao(self, sessao_id: int):
        with self.db.transaction() as tx:
            tx.execute("DELETE FROM sessoes_recorrentes WHERE id=%s", (sessao_id,))

    def atualizar_sessao(self, sessao_id: int, dados: dict):
        with self.db.transaction() as tx:
            tx.execute(
                """UPDATE sessoes_recorrentes
                   SET titulo=%s, descricao=%s, tipo=%s, frequencia=%s,
                       dia_semana=%s, semana_mes=%s, dia_mes=%s,
                       hora_inicio=%s, hora_fim=%s, cor=%s,
                       vigencia_inicio=%s, vigencia_fim=%s, ativo=%s
                   WHERE id=%s""",
                (dados['titulo'], dados.get('descricao'), dados.get('tipo','sessao'),
                 dados['frequencia'], dados.get('dia_semana'), dados.get('semana_mes'),
                 dados.get('dia_mes'), dados['hora_inicio'], dados['hora_fim'],
                 dados.get('cor','#2563eb'),
                 dados.get('vigencia_inicio'), dados.get('vigencia_fim'),
                 dados.get('ativo', True), sessao_id),
            )

    # ── Eventos avulsos ────────────────────────────────────────────────────────

    def criar_evento(self, loja_id: int, dados: dict, usuario_id: int) -> int:
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO agenda_eventos
                   (loja_id, titulo, descricao, tipo, data, hora_inicio, hora_fim,
                    local, cor, criado_por)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (loja_id, dados['titulo'], dados.get('descricao'),
                 dados.get('tipo','evento'), dados['data'],
                 dados['hora_inicio'], dados['hora_fim'],
                 dados.get('local'), dados.get('cor','#7c3aed'), usuario_id),
            )
            return row['id']

    def deletar_evento(self, evento_id: int):
        with self.db.transaction() as tx:
            tx.execute("DELETE FROM agenda_eventos WHERE id=%s", (evento_id,))

    # ── Calendário do mês ──────────────────────────────────────────────────────

    def mes(self, loja_id: int, ano: int, mes: int) -> dict:
        """Retorna estrutura do mês com todos os eventos por dia."""
        with self.db.transaction() as tx:
            sessoes = tx.fetch_all(
                "SELECT * FROM sessoes_recorrentes WHERE loja_id=%s AND ativo=TRUE",
                (loja_id,),
            )
            eventos = tx.fetch_all(
                """SELECT * FROM agenda_eventos
                   WHERE loja_id=%s
                     AND EXTRACT(YEAR FROM data)=%s
                     AND EXTRACT(MONTH FROM data)=%s
                   ORDER BY hora_inicio""",
                (loja_id, ano, mes),
            )
            cancelamentos = tx.fetch_all(
                """SELECT id, sessao_id, data, motivo
                   FROM agenda_cancelamentos
                   WHERE loja_id=%s
                     AND EXTRACT(YEAR FROM data)=%s
                     AND EXTRACT(MONTH FROM data)=%s""",
                (loja_id, ano, mes),
            )

        # Mapa de cancelamentos: (sessao_id, dia) → {id, motivo}
        cancelados: dict = {}
        for c in cancelamentos:
            dia = c['data'].day if hasattr(c['data'], 'day') else int(str(c['data'])[8:10])
            cancelados[(c['sessao_id'], dia)] = {'cancelamento_id': c['id'], 'motivo': c['motivo']}

        # Monta mapa dia → lista de eventos
        dias: dict[int, list] = {}

        for sess in sessoes:
            for dt in _ocorrencias_no_mes(sess, ano, mes):
                dia = dt.day
                if dia not in dias:
                    dias[dia] = []
                cancel_info = cancelados.get((sess['id'], dia))
                dias[dia].append({
                    'id': sess['id'],
                    'tipo_fonte': 'recorrente',
                    'titulo': sess['titulo'],
                    'tipo': sess['tipo'],
                    'hora_inicio': str(sess['hora_inicio'])[:5],
                    'hora_fim': str(sess['hora_fim'])[:5],
                    'cor': sess['cor'],
                    'descricao': sess['descricao'],
                    'freq_label': self._freq_label(sess),
                    'cancelado': cancel_info is not None,
                    'cancelamento_id': cancel_info['cancelamento_id'] if cancel_info else None,
                    'cancelamento_motivo': cancel_info['motivo'] if cancel_info else None,
                })

        for ev in eventos:
            dia = ev['data'].day if hasattr(ev['data'], 'day') else int(str(ev['data'])[8:10])
            if dia not in dias:
                dias[dia] = []
            dias[dia].append({
                'id': ev['id'],
                'tipo_fonte': 'avulso',
                'titulo': ev['titulo'],
                'tipo': ev.get('tipo','evento'),
                'hora_inicio': str(ev['hora_inicio'])[:5],
                'hora_fim': str(ev['hora_fim'])[:5],
                'cor': ev['cor'],
                'descricao': ev.get('descricao'),
                'local': ev.get('local'),
            })

        # Ordena cada dia por hora
        for dia in dias:
            dias[dia].sort(key=lambda x: x['hora_inicio'])

        num_dias = calendar.monthrange(ano, mes)[1]
        primeiro_dia_semana = date(ano, mes, 1).weekday()  # Mon=0..Sun=6 → converte p/ Dom=0
        primeiro_ds = (primeiro_dia_semana + 1) % 7

        return {
            'ano': ano,
            'mes': mes,
            'num_dias': num_dias,
            'primeiro_dia_semana': primeiro_ds,
            'dias': {str(k): v for k, v in dias.items()},
        }

    @staticmethod
    def _freq_label(sess: dict) -> str:
        freq = sess['frequencia']
        dw   = sess.get('dia_semana')
        dw_n = DIAS_SEMANA[dw] if dw is not None else ''
        if freq == 'semanal':
            return f'Toda {dw_n}'
        elif freq == 'quinzenal':
            return f'A cada 2 {dw_n}s'
        elif freq == 'mensal_dia_semana':
            sm = sess.get('semana_mes', 1)
            ords = ['1ª','2ª','3ª','4ª','5ª']
            return f'{ords[sm-1]} {dw_n} do mês'
        elif freq == 'mensal_dia_numero':
            return f'Todo dia {sess.get("dia_mes")}'
        return freq
