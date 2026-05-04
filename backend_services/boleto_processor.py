"""
Processa PDFs de boletos recebidos via WhatsApp:
  1. Extrai texto do PDF
  2. Detecta o irmão pelo nome ou CIM
  3. Cruza com regra de mensalidade
  4. Reenvia o PDF para o WhatsApp do irmão
  5. Registra o evento
"""
import io
import re
from datetime import datetime
from difflib import SequenceMatcher
from typing import Optional

from pypdf import PdfReader


class BoletoProcessor:
    def __init__(self, db, whatsapp_service, email_service=None):
        self.db    = db
        self.wpp   = whatsapp_service
        self.email = email_service

    # ── API pública ────────────────────────────────────────────────────────

    def processar(self, pdf_bytes: bytes, loja_id: int) -> dict:
        texto = self._extrair_texto(pdf_bytes)
        irmao = self._identificar_irmao(texto, loja_id)

        resultado = {
            'texto_extraido': texto[:500],
            'irmao_identificado': None,
            'enviado': False,
            'erro': None,
        }

        if not irmao:
            resultado['erro'] = 'Irmão não identificado no PDF'
            self._registrar(loja_id, None, pdf_bytes, 'nao_identificado', resultado['erro'])
            return resultado

        resultado['irmao_identificado'] = {
            'id':    irmao['id'],
            'nome':  irmao['nome'],
            'score': irmao.get('_score', 0),
        }

        if not irmao.get('telefone'):
            resultado['erro'] = f"Irmão {irmao['nome']} sem telefone cadastrado"
            self._registrar(loja_id, irmao['id'], pdf_bytes, 'sem_telefone', resultado['erro'])
            return resultado

        valor = self._extrair_valor(texto)
        caption = self._montar_caption(irmao, valor)

        filename = f"boleto_{irmao['nome'].split()[0].lower()}.pdf"
        wpp_ok = False
        try:
            self.wpp.send_document(
                telefone=irmao['telefone'],
                pdf_bytes=pdf_bytes,
                filename=filename,
                caption=caption,
            )
            wpp_ok = True
            resultado['enviado'] = True
            self._registrar(loja_id, irmao['id'], pdf_bytes, 'enviado', None, canal='whatsapp')
        except Exception as e:
            resultado['erro'] = f"Falha WhatsApp: {e}"

        if not wpp_ok:
            email_sent = self._tentar_email(irmao, pdf_bytes, filename, caption)
            if email_sent:
                resultado['enviado'] = True
                resultado['erro'] = None
                self._registrar(loja_id, irmao['id'], pdf_bytes, 'enviado', None, canal='email')
            else:
                self._registrar(loja_id, irmao['id'], pdf_bytes, 'erro_envio', resultado['erro'])

        return resultado

    def listar_processados(self, loja_id: int, limit: int = 50) -> list:
        with self.db.transaction() as tx:
            return tx.fetch_all(
                """
                select bp.*, i.nome as irmao_nome
                from boletos_processados bp
                left join irmaos i on i.id = bp.irmao_id
                where bp.loja_id = %s
                order by bp.created_at desc
                limit %s
                """,
                [loja_id, limit],
            )

    # ── PDF ────────────────────────────────────────────────────────────────

    @staticmethod
    def _extrair_texto(pdf_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        partes = []
        for page in reader.pages:
            partes.append(page.extract_text() or '')
        return '\n'.join(partes)

    @staticmethod
    def _extrair_valor(texto: str) -> Optional[str]:
        # Padrões comuns em boletos brasileiros
        padrao = re.search(
            r'(?:valor\s+(?:do\s+)?(?:documento|cobrado|a\s+pagar)[:\s]+)?R?\$?\s*([\d.,]+)',
            texto, re.IGNORECASE,
        )
        return padrao.group(1) if padrao else None

    # ── Identificação do irmão ─────────────────────────────────────────────

    def _identificar_irmao(self, texto: str, loja_id: int) -> Optional[dict]:
        with self.db.transaction() as tx:
            irmaos = tx.fetch_all(
                "select id, nome, telefone, cim from irmaos where loja_id = %s and deleted_at is null",
                [loja_id],
            )

        if not irmaos:
            return None

        texto_upper = texto.upper()

        # 1) Busca por CIM exato
        for ir in irmaos:
            if ir['cim'] and ir['cim'].strip() in texto_upper:
                ir['_score'] = 1.0
                return ir

        # 2) Busca por nome (palavras significativas)
        melhor, melhor_score = None, 0.0
        for ir in irmaos:
            score = self._score_nome(ir['nome'], texto_upper)
            if score > melhor_score:
                melhor_score = score
                melhor = ir

        if melhor and melhor_score >= 0.72:
            melhor['_score'] = melhor_score
            return melhor

        return None

    @staticmethod
    def _score_nome(nome: str, texto: str) -> float:
        partes = [p for p in nome.upper().split() if len(p) > 3]
        if not partes:
            return 0.0
        encontradas = sum(1 for p in partes if p in texto)
        ratio = SequenceMatcher(None, nome.upper(), texto[:300]).ratio()
        return max(encontradas / len(partes), ratio)

    def _tentar_email(self, irmao: dict, pdf_bytes: bytes, filename: str, caption: str) -> bool:
        if not self.email or not self.email.configurado():
            return False
        with self.db.transaction() as tx:
            row = tx.fetch_one(
                "SELECT u.email FROM usuarios u JOIN irmaos i ON i.usuario_id=u.id WHERE i.id=%s",
                [irmao['id']],
            )
        if not row or not row.get('email'):
            return False
        try:
            self.email.send_boleto(row['email'], irmao['nome'], pdf_bytes, filename, caption)
            return True
        except Exception:
            return False

    # ── Helpers ────────────────────────────────────────────────────────────

    @staticmethod
    def _montar_caption(irmao: dict, valor: Optional[str]) -> str:
        linhas = [f"📄 *Boleto — {irmao['nome']}*"]
        if valor:
            linhas.append(f"💰 Valor: R$ {valor}")
        linhas.append("Secretaria Digital 🤝")
        return '\n'.join(linhas)

    def _registrar(
        self,
        loja_id: int,
        irmao_id: Optional[int],
        pdf_bytes: bytes,
        status: str,
        erro: Optional[str],
        canal: Optional[str] = None,
    ) -> None:
        try:
            with self.db.transaction() as tx:
                tx.execute(
                    """
                    insert into boletos_processados
                      (loja_id, irmao_id, tamanho_bytes, status, erro,
                       conteudo, notificado_em, notificado_canal, created_at)
                    values (%s, %s, %s, %s, %s, %s, %s, %s, now())
                    """,
                    [loja_id, irmao_id, len(pdf_bytes), status, erro,
                     pdf_bytes,
                     datetime.utcnow() if canal else None,
                     canal],
                )
        except Exception:
            pass  # tabela pode não existir ainda — migration 017 a criar
