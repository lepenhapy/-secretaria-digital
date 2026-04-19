"""
Adapter para Evolution API (https://evolution-api.com).
Configure no .env:
  EVOLUTION_API_URL  — ex: http://localhost:8080
  EVOLUTION_API_KEY  — chave de autenticação
  EVOLUTION_INSTANCE — nome da instância criada no Evolution
"""
import base64
import os
from typing import Optional

import requests


class WhatsAppService:
    def __init__(self):
        self.base_url = os.getenv('EVOLUTION_API_URL', 'http://localhost:8080').rstrip('/')
        self.api_key  = os.getenv('EVOLUTION_API_KEY', '')
        self.instance = os.getenv('EVOLUTION_INSTANCE', 'secretaria')

    def _headers(self) -> dict:
        return {'apikey': self.api_key, 'Content-Type': 'application/json'}

    def _url(self, path: str) -> str:
        return f"{self.base_url}/{path}"

    @staticmethod
    def _normalizar_telefone(telefone: str) -> str:
        digitos = ''.join(c for c in telefone if c.isdigit())
        if not digitos.startswith('55'):
            digitos = '55' + digitos
        return digitos + '@s.whatsapp.net'

    # ── Envios ─────────────────────────────────────────────────────────────

    def send_text(self, telefone: str, texto: str) -> dict:
        payload = {
            'number':  self._normalizar_telefone(telefone),
            'options': {'delay': 1000},
            'textMessage': {'text': texto},
        }
        r = requests.post(
            self._url(f'message/sendText/{self.instance}'),
            json=payload, headers=self._headers(), timeout=15,
        )
        r.raise_for_status()
        return r.json()

    def send_document(
        self,
        telefone: str,
        pdf_bytes: bytes,
        filename: str,
        caption: str = '',
    ) -> dict:
        b64 = base64.b64encode(pdf_bytes).decode()
        payload = {
            'number':  self._normalizar_telefone(telefone),
            'options': {'delay': 1000},
            'mediaMessage': {
                'mediatype': 'document',
                'fileName':  filename,
                'caption':   caption,
                'media':     b64,
            },
        }
        r = requests.post(
            self._url(f'message/sendMedia/{self.instance}'),
            json=payload, headers=self._headers(), timeout=30,
        )
        r.raise_for_status()
        return r.json()

    def download_media(self, message_key: str) -> bytes:
        payload = {'key': message_key}
        r = requests.post(
            self._url(f'chat/getBase64FromMediaMessage/{self.instance}'),
            json=payload, headers=self._headers(), timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        return base64.b64decode(data.get('base64', ''))

    # ── Status da instância ────────────────────────────────────────────────

    def status(self) -> dict:
        r = requests.get(
            self._url(f'instance/connectionState/{self.instance}'),
            headers=self._headers(), timeout=10,
        )
        r.raise_for_status()
        return r.json()
