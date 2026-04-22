from __future__ import annotations

import base64
import hashlib
import re
from datetime import date
from typing import Optional


class WhatsAppBot:
    def __init__(self, db, whatsapp_service, storage):
        self.db = db
        self.wpp = whatsapp_service
        self.storage = storage

    # ── Entry point ───────────────────────────────────────────────────────

    def processar(self, loja_id: int, remetente: str,
                  message_type: str, message: dict, push_name: str = '') -> dict:
        try:
            if message_type in ('conversation', 'extendedTextMessage'):
                texto = (message.get('conversation')
                         or message.get('extendedTextMessage', {}).get('text', '')
                         or '')
                return self._texto(loja_id, remetente, texto.strip(), push_name)

            if message_type in ('imageMessage', 'documentMessage',
                                 'audioMessage', 'videoMessage'):
                return self._midia(loja_id, remetente, message_type, message, push_name)

            return {'status': 'ignored', 'tipo': message_type}
        except Exception as exc:
            return {'status': 'error', 'detail': str(exc)}

    # ── Texto ─────────────────────────────────────────────────────────────

    def _texto(self, loja_id, remetente, texto, push_name) -> dict:
        usuario = self._buscar_usuario(loja_id, remetente)
        nome = usuario['nome'] if usuario else push_name or 'Irmão'
        cmd = texto.lower().strip()

        if not cmd or cmd in ('oi', 'olá', 'ola', 'oii', 'bom dia', 'boa tarde',
                               'boa noite', 'menu', 'inicio', 'início',
                               'ajuda', 'help', '0', 'voltar'):
            self.wpp.send_text(remetente, self._menu(nome))
            return {'status': 'menu_enviado'}

        if cmd in ('1', 'comprovante', 'compra', 'reembolso'):
            self.wpp.send_text(remetente,
                "📎 *Enviar comprovante*\n\n"
                "Mande a foto ou PDF do comprovante.\n"
                "Adicione uma legenda com o evento e valor:\n"
                "_Ex: Ágape Abril — R$ 230,00_\n\n"
                "O sistema registra automaticamente para reembolso! 👍")
            return {'status': 'instrucao_enviada'}

        if cmd in ('2', 'sessao', 'sessões', 'sessoes', 'agenda',
                   'reunião', 'reuniao', 'eventos'):
            return self._responder_agenda(loja_id, remetente)

        if cmd in ('3', 'mensalidade', 'minha mensalidade'):
            return self._responder_mensalidade(loja_id, remetente, usuario)

        self.wpp.send_text(remetente, self._menu(nome))
        return {'status': 'menu_fallback'}

    @staticmethod
    def _menu(nome: str) -> str:
        return (
            f"🏛️ *Secretaria Digital*\nOlá, {nome}!\n\n"
            f"1️⃣  Enviar comprovante / reembolso\n"
            f"2️⃣  Próximas sessões e eventos\n"
            f"3️⃣  Minha mensalidade\n\n"
            f"_Digite o número da opção._"
        )

    # ── Agenda ────────────────────────────────────────────────────────────

    def _responder_agenda(self, loja_id, remetente) -> dict:
        try:
            hoje = date.today().isoformat()
            with self.db.transaction() as tx:
                eventos = tx.fetch_all(
                    """SELECT titulo, tipo, data, hora_inicio, hora_fim
                       FROM agenda_eventos WHERE loja_id=%s AND data >= %s
                       ORDER BY data, hora_inicio LIMIT 5""",
                    (loja_id, hoje),
                )
                sessoes = tx.fetch_all(
                    """SELECT titulo, hora_inicio, hora_fim, frequencia
                       FROM sessoes_recorrentes
                       WHERE loja_id=%s AND ativo=TRUE LIMIT 4""",
                    (loja_id,),
                )
            linhas = ["📅 *Agenda da Loja*\n"]
            if eventos:
                linhas.append("*Próximos eventos:*")
                for e in eventos:
                    try:
                        from datetime import datetime as dt
                        d = dt.strptime(str(e['data'])[:10], '%Y-%m-%d').strftime('%d/%m')
                    except Exception:
                        d = str(e['data'])[:10]
                    hi = str(e['hora_inicio'])[:5]
                    hf = str(e['hora_fim'])[:5]
                    linhas.append(f"• {d} — {e['titulo']} ({hi}–{hf})")
            if sessoes:
                if eventos:
                    linhas.append("")
                linhas.append("*Sessões regulares:*")
                freq_label = {
                    'semanal': 'Semanal', 'quinzenal': 'Quinzenal',
                    'mensal_dia_semana': 'Mensal', 'mensal_dia_numero': 'Mensal',
                }
                for s in sessoes:
                    hi = str(s['hora_inicio'])[:5]
                    hf = str(s['hora_fim'])[:5]
                    freq = freq_label.get(s['frequencia'], s['frequencia'])
                    linhas.append(f"• {s['titulo']} — {hi}–{hf} ({freq})")
            if not eventos and not sessoes:
                linhas.append("Nenhum evento cadastrado no momento.")
            linhas.append("\n_0 para voltar ao menu_")
            self.wpp.send_text(remetente, '\n'.join(linhas))
            return {'status': 'agenda_enviada'}
        except Exception as exc:
            self.wpp.send_text(remetente, "⚠️ Erro ao buscar agenda. Tente novamente.")
            return {'status': 'error', 'detail': str(exc)}

    # ── Mensalidade ───────────────────────────────────────────────────────

    def _responder_mensalidade(self, loja_id, remetente, usuario) -> dict:
        if not usuario:
            self.wpp.send_text(remetente,
                "⚠️ *Número não cadastrado*\n\n"
                "Seu número não está vinculado a nenhum irmão no sistema.\n"
                "Procure a secretaria para vincular seu WhatsApp.")
            return {'status': 'usuario_nao_encontrado'}
        try:
            with self.db.transaction() as tx:
                irmao = tx.fetch_one(
                    "SELECT id FROM irmaos WHERE usuario_id=%s AND loja_id=%s LIMIT 1",
                    (usuario['id'], loja_id),
                )
                regra = None
                if irmao:
                    regra = tx.fetch_one(
                        """SELECT categoria, valor, vigencia_inicio, vigencia_fim
                           FROM regras_mensalidade
                           WHERE irmao_id=%s
                             AND (vigencia_fim IS NULL OR vigencia_fim >= CURRENT_DATE)
                           ORDER BY vigencia_inicio DESC LIMIT 1""",
                        (irmao['id'],),
                    )
            if regra:
                vf = str(regra['vigencia_fim'])[:10] if regra['vigencia_fim'] else 'Indefinido'
                vi = str(regra['vigencia_inicio'])[:10]
                msg = (
                    f"💳 *Sua mensalidade*\n\n"
                    f"Categoria: {regra['categoria']}\n"
                    f"Valor: R$ {float(regra['valor']):.2f}/mês\n"
                    f"Vigência: {vi} → {vf}\n\n"
                    f"_Em caso de dúvidas, contate a secretaria._"
                )
            else:
                msg = ("ℹ️ Nenhuma regra de mensalidade ativa encontrada.\n"
                       "Procure a secretaria para regularizar.")
            self.wpp.send_text(remetente, msg)
            return {'status': 'mensalidade_enviada'}
        except Exception as exc:
            self.wpp.send_text(remetente, "⚠️ Erro ao buscar mensalidade.")
            return {'status': 'error', 'detail': str(exc)}

    # ── Mídia ─────────────────────────────────────────────────────────────

    def _midia(self, loja_id, remetente, message_type, message, push_name) -> dict:
        usuario = self._buscar_usuario(loja_id, remetente)
        if not usuario:
            self.wpp.send_text(remetente,
                "⚠️ *Número não cadastrado*\n\n"
                "Seu número não está vinculado no sistema.\n"
                "Procure a secretaria para vincular seu WhatsApp.")
            return {'status': 'usuario_nao_encontrado'}

        msg_data = message.get(message_type, {})
        mimetype = msg_data.get('mimetype', 'application/octet-stream')
        caption = (msg_data.get('caption') or '').strip()
        b64 = msg_data.get('base64', '')

        if not b64:
            return {'status': 'ignored', 'motivo': 'sem conteúdo base64'}

        content = base64.b64decode(b64)
        sha = hashlib.sha256(content).hexdigest()
        ext_map = {
            'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
            'application/pdf': '.pdf', 'audio/ogg': '.ogg', 'audio/mpeg': '.mp3',
        }
        ext = ext_map.get(mimetype, '.bin')
        nome = msg_data.get('fileName') or f"wpp_{sha[:8]}{ext}"
        descricao = caption or f"Enviado via WhatsApp por {usuario['nome']}"

        try:
            meta = self.storage.save_file(loja_id, nome, content)
            caminho = meta.get('path')
        except Exception:
            caminho = None

        with self.db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO repositorio_arquivos
                   (loja_id, usuario_id, contexto, descricao, caminho,
                    nome_original, mimetype, tamanho_bytes, sha256, conteudo)
                   VALUES (%s,%s,'whatsapp',%s,%s,%s,%s,%s,%s,%s)
                   RETURNING id""",
                (loja_id, usuario['id'], descricao, caminho, nome,
                 mimetype, len(content), sha, content),
            )
            repo_id = row['id'] if row else None

        # Foto / PDF → cria compra para reembolso automaticamente
        if mimetype in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf'):
            valor_match = re.search(r'R\$\s*([\d.,]+)', caption, re.IGNORECASE)
            valor_str = valor_match.group(1).replace(',', '.') if valor_match else ''
            try:
                valor = float(valor_str) if valor_str else 0.0
            except ValueError:
                valor = 0.0

            evento = caption or 'Comprovante via WhatsApp'
            with self.db.transaction() as tx:
                compra = tx.fetch_one(
                    """INSERT INTO compras (loja_id, usuario_id, evento, valor, whatsapp_from)
                       VALUES (%s,%s,%s,%s,%s) RETURNING id""",
                    (loja_id, usuario['id'], evento, valor, remetente),
                )
                compra_id = compra['id']
                tx.execute(
                    """INSERT INTO compras_arquivos
                       (compra_id, tipo, caminho, nome_original,
                        tamanho_bytes, sha256, conteudo)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (compra_id,
                     'foto' if 'image' in mimetype else 'cupom',
                     caminho, nome, len(content), sha, content),
                )

            self.wpp.send_text(remetente,
                f"✅ *Comprovante recebido!*\n\n"
                f"📋 {evento}\n"
                f"💰 Valor: {'R$ ' + f'{valor:.2f}' if valor else '_não informado — informe à secretaria_'}\n"
                f"🔖 Solicitação #{compra_id} registrada como *pendente*.\n\n"
                f"A secretaria será notificada. 👍\n"
                f"_Se o valor estiver incorreto, contate a secretaria._")
            return {'status': 'compra_criada', 'compra_id': compra_id}

        # Outro tipo de arquivo
        self.wpp.send_text(remetente,
            f"✅ *Arquivo recebido!*\n"
            f"_{nome}_ foi salvo no repositório da loja.\n\n"
            f"_0 para voltar ao menu_")
        return {'status': 'arquivo_salvo', 'repo_id': repo_id}

    # ── Helper: busca usuário pelo telefone ───────────────────────────────

    def _buscar_usuario(self, loja_id: int, telefone: str) -> Optional[dict]:
        tel = telefone.split('@')[0]
        tel_sem_ddi = tel[2:] if tel.startswith('55') and len(tel) > 10 else tel
        with self.db.transaction() as tx:
            return tx.fetch_one(
                """SELECT u.id, u.nome
                   FROM usuarios u
                   JOIN irmaos i ON i.usuario_id = u.id
                   WHERE u.loja_id = %s
                     AND (i.whatsapp = %s OR i.whatsapp = %s
                          OR i.telefone = %s OR i.telefone = %s)
                   LIMIT 1""",
                (loja_id, tel, tel_sem_ddi, tel, tel_sem_ddi),
            )
