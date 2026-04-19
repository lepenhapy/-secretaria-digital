"""
Integração com Google Calendar.

Setup necessário (uma vez):
  1. console.cloud.google.com → crie um projeto
  2. Ative "Google Calendar API"
  3. Credenciais → OAuth 2.0 → Aplicativo de computador
  4. Baixe o JSON e salve como 'google_credentials.json' na raiz do projeto
  5. Na primeira execução, authorize no navegador — gera 'google_token.json'

Variáveis de ambiente:
  GOOGLE_CREDENTIALS_FILE  — padrão: google_credentials.json
  GOOGLE_TOKEN_FILE        — padrão: google_token.json
  GOOGLE_CALENDAR_ID       — padrão: primary
"""
import os
from datetime import datetime, timedelta
from typing import Optional

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

SCOPES = ['https://www.googleapis.com/auth/calendar']


class CalendarService:
    def __init__(self):
        self._creds_file  = os.getenv('GOOGLE_CREDENTIALS_FILE', 'google_credentials.json')
        self._token_file  = os.getenv('GOOGLE_TOKEN_FILE',       'google_token.json')
        self._calendar_id = os.getenv('GOOGLE_CALENDAR_ID',      'primary')
        self._service     = None

    @property
    def disponivel(self) -> bool:
        return GOOGLE_AVAILABLE and os.path.exists(self._creds_file)

    def _get_service(self):
        if self._service:
            return self._service

        if not GOOGLE_AVAILABLE:
            raise RuntimeError('Biblioteca google não instalada. Execute: pip install google-auth google-auth-oauthlib google-api-python-client')

        creds = None
        if os.path.exists(self._token_file):
            creds = Credentials.from_authorized_user_file(self._token_file, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(self._creds_file, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(self._token_file, 'w') as f:
                f.write(creds.to_json())

        self._service = build('calendar', 'v3', credentials=creds)
        return self._service

    # ── API pública ────────────────────────────────────────────────────────

    def listar_eventos(self, dias: int = 30) -> list:
        service = self._get_service()
        agora  = datetime.utcnow().isoformat() + 'Z'
        limite = (datetime.utcnow() + timedelta(days=dias)).isoformat() + 'Z'
        result = service.events().list(
            calendarId=self._calendar_id,
            timeMin=agora, timeMax=limite,
            singleEvents=True, orderBy='startTime',
        ).execute()
        return result.get('items', [])

    def criar_evento(
        self,
        titulo: str,
        descricao: str,
        inicio: str,     # ISO 8601, ex: '2026-04-25T20:00:00-03:00'
        fim: str,
        convidados: Optional[list[str]] = None,
    ) -> dict:
        service = self._get_service()
        evento = {
            'summary':     titulo,
            'description': descricao,
            'start':       {'dateTime': inicio, 'timeZone': 'America/Sao_Paulo'},
            'end':         {'dateTime': fim,    'timeZone': 'America/Sao_Paulo'},
        }
        if convidados:
            evento['attendees'] = [{'email': e} for e in convidados]

        criado = service.events().insert(
            calendarId=self._calendar_id, body=evento
        ).execute()
        return criado

    def deletar_evento(self, event_id: str) -> None:
        self._get_service().events().delete(
            calendarId=self._calendar_id, eventId=event_id
        ).execute()
