import base64
import json
import os
import urllib.error
import urllib.request


class EmailService:
    def __init__(self):
        self.api_key  = os.getenv('BREVO_API_KEY', '')
        self.sender_email = os.getenv('SMTP_FROM_EMAIL', os.getenv('SMTP_USER', ''))
        self.sender_name  = os.getenv('SMTP_FROM_NAME', 'Secretaria Digital')
        self.base_url = os.getenv('BASE_URL', 'http://127.0.0.1:8001')

    def configurado(self) -> bool:
        return bool(self.api_key and self.sender_email)

    def _send(self, to_email: str, to_name: str, subject: str,
              html: str, text: str = '', attachments: list | None = None) -> None:
        payload: dict = {
            'sender': {'name': self.sender_name, 'email': self.sender_email},
            'to':     [{'email': to_email, 'name': to_name}],
            'subject': subject,
            'htmlContent': html,
        }
        if text:
            payload['textContent'] = text
        if attachments:
            payload['attachment'] = attachments

        data = json.dumps(payload).encode()
        req  = urllib.request.Request(
            'https://api.brevo.com/v3/smtp/email',
            data=data,
            headers={
                'api-key':      self.api_key,
                'Content-Type': 'application/json',
            },
        )
        try:
            urllib.request.urlopen(req, timeout=15)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode()
            raise RuntimeError(f'Brevo API error {exc.code}: {body}') from exc

    def send_confirmation(self, to_email: str, nome: str, token: str) -> None:
        link = f"{self.base_url}/confirmar/{token}"
        html = f"""
        <html><body style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="color:#1e293b;margin:0">Secretaria Digital</h2>
            <p style="color:#64748b;font-size:13px;margin:4px 0">Sistema de Gestão da Loja</p>
          </div>
          <p>Olá, <strong>{nome}</strong>.</p>
          <p>Clique no botão abaixo para confirmar seu e-mail e ativar sua conta:</p>
          <div style="text-align:center;margin:28px 0">
            <a href="{link}"
               style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;
                      border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
              Confirmar e-mail
            </a>
          </div>
          <p style="color:#64748b;font-size:12px">
            Ou copie e cole este link no navegador:<br/>
            <a href="{link}" style="color:#2563eb">{link}</a>
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="color:#94a3b8;font-size:11px">
            Se não foi você que solicitou esta conta, ignore este e-mail.
          </p>
        </body></html>
        """
        text = f"Olá {nome},\n\nConfirme sua conta:\n{link}\n\nSe não foi você, ignore."
        self._send(to_email, nome, 'Secretaria Digital — Confirme seu e-mail', html, text)

    def send_simple(self, to_email: str, nome: str, subject: str, body_text: str) -> None:
        html = (
            f'<html><body style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">'
            f'<p>Olá, <strong>{nome}</strong>.</p>'
            f'<div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;'
            f'border-radius:4px;white-space:pre-wrap">{body_text}</div>'
            f'<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>'
            f'<p style="color:#94a3b8;font-size:11px">Secretaria Digital</p>'
            f'</body></html>'
        )
        self._send(to_email, nome, subject, html, body_text)

    def send_reset_password(self, to_email: str, nome: str, token: str) -> None:
        link = f"{self.base_url}?reset={token}"
        html = f"""
        <html><body style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="color:#1e293b;margin:0">Secretaria Digital</h2>
            <p style="color:#64748b;font-size:13px;margin:4px 0">Sistema de Gestão da Loja</p>
          </div>
          <p>Olá, <strong>{nome}</strong>.</p>
          <p>Recebemos um pedido de redefinição de senha para sua conta.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="{link}"
               style="display:inline-block;padding:14px 32px;background:#dc2626;color:#fff;
                      border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
              Redefinir minha senha
            </a>
          </div>
          <p style="color:#64748b;font-size:12px">
            Ou copie e cole este link no navegador:<br/>
            <a href="{link}" style="color:#2563eb">{link}</a>
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="color:#94a3b8;font-size:11px">
            Se não foi você que solicitou, ignore este e-mail. Sua senha não será alterada.
          </p>
        </body></html>
        """
        text = f"Olá {nome},\n\nRedefina sua senha:\n{link}\n\nO link expira em 1 hora.\nSe não foi você, ignore."
        self._send(to_email, nome, 'Secretaria Digital — Redefinição de senha', html, text)

    def send_boleto(self, to_email: str, nome_irmao: str,
                    pdf_bytes: bytes, filename: str, caption: str) -> None:
        html = (
            f'<html><body style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">'
            f'<p>Olá, <strong>{nome_irmao}</strong>.</p>'
            f'<p>{caption}</p>'
            f'<p>O boleto está em anexo neste e-mail.</p>'
            f'<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>'
            f'<p style="color:#94a3b8;font-size:11px">Secretaria Digital</p>'
            f'</body></html>'
        )
        text = f'Olá {nome_irmao},\n\n{caption}\n\nSecretaria Digital'
        attachment = {
            'content': base64.b64encode(pdf_bytes).decode(),
            'name':    filename,
        }
        self._send(to_email, nome_irmao, 'Seu boleto — Secretaria Digital',
                   html, text, [attachment])
