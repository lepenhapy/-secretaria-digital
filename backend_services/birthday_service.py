"""
Detecta aniversários próximos (irmão, esposa, filhos) e
dispara mensagem de parabéns via WhatsApp.
"""
from datetime import date, timedelta
from typing import Optional


MENSAGEM_IRMAO = (
    "🎉 *Parabéns, Ir.·. {nome}!*\n\n"
    "Em nome da {loja}, desejamos a você um feliz aniversário "
    "repleto de saúde, prosperidade e luz.\n\n"
    "A.·. A.·. A.·. 🔵"
)

MENSAGEM_ESPOSA = (
    "🌹 *Parabéns, Cunhada {nome}!*\n\n"
    "A {loja} deseja a você um feliz aniversário "
    "com muita saúde e alegria. 🎂"
)

MENSAGEM_FILHO = (
    "🎊 *Parabéns, {nome}!*\n\n"
    "A {loja} deseja a você, filho do Ir.·. {pai}, "
    "um feliz aniversário! 🎈"
)


class BirthdayService:
    def __init__(self, db, whatsapp_service):
        self.db  = db
        self.wpp = whatsapp_service

    # ── API pública ────────────────────────────────────────────────────────

    def proximos(self, loja_id: int, dias: int = 30) -> list:
        hoje = date.today()
        fim  = hoje + timedelta(days=dias)
        eventos = []

        with self.db.transaction() as tx:
            irmaos = tx.fetch_all(
                """
                select id, nome, telefone, data_nascimento,
                       nome_esposa, data_nascimento_esposa
                from irmaos
                where loja_id = %s and deleted_at is null
                """,
                [loja_id],
            )
            filhos = tx.fetch_all(
                """
                select f.nome, f.data_nascimento, i.nome as pai_nome, i.telefone as pai_tel
                from irmaos_filhos f
                join irmaos i on i.id = f.irmao_id
                where i.loja_id = %s and i.deleted_at is null
                """,
                [loja_id],
            )
            loja = tx.fetch_one("select nome from lojas where id = %s", [loja_id])

        loja_nome = loja['nome'] if loja else 'Loja'

        for ir in irmaos:
            if ir['data_nascimento']:
                delta = self._dias_para_aniversario(ir['data_nascimento'], hoje)
                if 0 <= delta <= dias:
                    eventos.append({
                        'tipo':       'irmao',
                        'nome':       ir['nome'],
                        'telefone':   ir['telefone'],
                        'data':       ir['data_nascimento'],
                        'dias_falta': delta,
                        'loja_nome':  loja_nome,
                    })
            if ir['data_nascimento_esposa'] and ir['nome_esposa']:
                delta = self._dias_para_aniversario(ir['data_nascimento_esposa'], hoje)
                if 0 <= delta <= dias:
                    eventos.append({
                        'tipo':       'esposa',
                        'nome':       ir['nome_esposa'],
                        'telefone':   ir['telefone'],
                        'data':       ir['data_nascimento_esposa'],
                        'dias_falta': delta,
                        'pai_nome':   ir['nome'],
                        'loja_nome':  loja_nome,
                    })

        for f in filhos:
            if f['data_nascimento']:
                delta = self._dias_para_aniversario(f['data_nascimento'], hoje)
                if 0 <= delta <= dias:
                    eventos.append({
                        'tipo':       'filho',
                        'nome':       f['nome'],
                        'telefone':   f['pai_tel'],
                        'data':       f['data_nascimento'],
                        'dias_falta': delta,
                        'pai_nome':   f['pai_nome'],
                        'loja_nome':  loja_nome,
                    })

        return sorted(eventos, key=lambda x: x['dias_falta'])

    def notificar_hoje(self, loja_id: int) -> list:
        """Dispara mensagens para aniversariantes de hoje. Chamado pelo scheduler."""
        eventos = self.proximos(loja_id, dias=0)
        resultados = []

        for ev in eventos:
            try:
                msg = self._montar_mensagem(ev)
                if ev['telefone']:
                    self.wpp.send_text(ev['telefone'], msg)
                resultados.append({'nome': ev['nome'], 'enviado': True, 'erro': None})
            except Exception as e:
                resultados.append({'nome': ev['nome'], 'enviado': False, 'erro': str(e)})

        return resultados

    # ── Helpers ────────────────────────────────────────────────────────────

    @staticmethod
    def _dias_para_aniversario(data_nasc, hoje: date) -> int:
        try:
            dt = data_nasc if isinstance(data_nasc, date) else date.fromisoformat(str(data_nasc))
            prox = dt.replace(year=hoje.year)
            if prox < hoje:
                prox = prox.replace(year=hoje.year + 1)
            return (prox - hoje).days
        except Exception:
            return 999

    @staticmethod
    def _montar_mensagem(ev: dict) -> str:
        if ev['tipo'] == 'irmao':
            return MENSAGEM_IRMAO.format(nome=ev['nome'], loja=ev['loja_nome'])
        if ev['tipo'] == 'esposa':
            return MENSAGEM_ESPOSA.format(nome=ev['nome'], loja=ev['loja_nome'])
        return MENSAGEM_FILHO.format(nome=ev['nome'], pai=ev.get('pai_nome', ''), loja=ev['loja_nome'])
