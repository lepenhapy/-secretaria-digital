import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class EmailService:
    def __init__(self):
        self.host     = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.port     = int(os.getenv('SMTP_PORT', '587'))
        self.user     = os.getenv('SMTP_USER', '')
        self.password = os.getenv('SMTP_PASS', '')
        self.from_    = os.getenv('SMTP_FROM', self.user)
        self.base_url = os.getenv('BASE_URL', 'http://127.0.0.1:8001')

    def configurado(self) -> bool:
        return bool(self.user and self.password)

    def send_confirmation(self, to_email: str, nome: str, token: str) -> None:
        link = f"{self.base_url}/confirmar/{token}"

        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Secretaria Digital — Confirme seu e-mail'
        msg['From']    = self.from_
        msg['To']      = to_email

        text = (
            f"Olá {nome},\n\n"
            f"Confirme sua conta clicando no link:\n{link}\n\n"
            "Se não foi você, ignore este e-mail."
        )
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

        msg.attach(MIMEText(text, 'plain', 'utf-8'))
        msg.attach(MIMEText(html, 'html', 'utf-8'))

        with smtplib.SMTP(self.host, self.port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            if self.user and self.password:
                server.login(self.user, self.password)
            server.sendmail(self.from_, to_email, msg.as_string())

    def send_simple(self, to_email: str, nome: str, subject: str, body_text: str) -> None:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = self.from_
        msg['To']      = to_email
        html = (f'<html><body style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">'
                f'<p>Olá, <strong>{nome}</strong>.</p>'
                f'<div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;'
                f'border-radius:4px;white-space:pre-wrap">{body_text}</div>'
                f'<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>'
                f'<p style="color:#94a3b8;font-size:11px">Secretaria Digital</p>'
                f'</body></html>')
        msg.attach(MIMEText(body_text, 'plain', 'utf-8'))
        msg.attach(MIMEText(html, 'html', 'utf-8'))
        with smtplib.SMTP(self.host, self.port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            if self.user and self.password:
                server.login(self.user, self.password)
            server.sendmail(self.from_, to_email, msg.as_string())

    def send_boleto(self, to_email: str, nome_irmao: str,
                    pdf_bytes: bytes, filename: str, caption: str) -> None:
        from email.mime.application import MIMEApplication
        msg = MIMEMultipart()
        msg['Subject'] = 'Seu boleto — Secretaria Digital'
        msg['From']    = self.from_
        msg['To']      = to_email
        texto = f"Olá {nome_irmao},\n\n{caption}\n\nSecretaria Digital"
        msg.attach(MIMEText(texto, 'plain', 'utf-8'))
        pdf_part = MIMEApplication(pdf_bytes, _subtype='pdf')
        pdf_part.add_header('Content-Disposition', 'attachment', filename=filename)
        msg.attach(pdf_part)
        with smtplib.SMTP(self.host, self.port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            if self.user and self.password:
                server.login(self.user, self.password)
            server.sendmail(self.from_, to_email, msg.as_string())
