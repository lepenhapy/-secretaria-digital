import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()
from decimal import Decimal
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend_api.dependencies import (
    get_birthday_service,
    get_boleto_processor,
    get_calendar_service,
    get_compras_service,
    get_current_actor,
    get_database,
    get_file_storage,
    get_rateio_service,
    get_registration_service,
    get_relatorios_service,
    get_scheduler,
    get_services,
    get_whatsapp_service,
)
from backend_services.compras_service import ComprasService
from backend_services.rateio_service import RateioService
from backend_services.relatorios_service import RelatoriosService
from backend_services.birthday_service import BirthdayService
from backend_services.boleto_processor import BoletoProcessor
from backend_services.calendar_service import CalendarService
from backend_services.registration_service import RegistrationService
from backend_services.core_transaction_services import (
    Actor,
    ConflictError,
    CoreTransactionServices,
    DomainError,
    PermissionDenied,
)


@asynccontextmanager
async def lifespan(app_: FastAPI):
    # Abre o connection pool
    db = get_database()
    db.open()

    # Inicia o scheduler de tarefas diárias
    scheduler = get_scheduler()
    birthday_svc = get_birthday_service()

    loja_id_default = int(os.getenv('DEFAULT_LOJA_ID', '1'))

    scheduler.add_daily(
        hora='08:00',
        func=lambda: birthday_svc.notificar_hoje(loja_id_default),
        label='Aniversários do dia',
    )
    scheduler.start()
    yield
    scheduler.stop()
    db.close()


app = FastAPI(title="Secretaria Digital", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend_painel")
if os.path.isdir(_frontend_dir):
    app.mount("/painel", StaticFiles(directory=_frontend_dir, html=True), name="frontend")


@app.get("/", response_class=HTMLResponse)
def root_redirect():
    return '<meta http-equiv="refresh" content="0; url=/painel/index.html">'


class CreateContractInput(BaseModel):
    loja_id: int
    templo_id: int
    regra_recorrencia: str
    hora_inicio_sessao: str
    hora_fim_sessao: str
    vigencia_inicio: str
    vigencia_fim: str | None = None


class ContractDecisionInput(BaseModel):
    decisao: str
    observacao: str | None = None


class ActivateContractInput(BaseModel):
    contrato_id: int


class ValidateScheduleConflictInput(BaseModel):
    recurso_id: int
    regra: str
    hora_inicio: str
    hora_fim: str
    vigencia_inicio: str
    vigencia_fim: str | None = None


class CreateMessageInput(BaseModel):
    loja_id: int
    tipo: str
    texto: str | None = None
    contexto: str | None = None
    enviado_por_telefone: str | None = None
    transcricao: str | None = None
    irmao_id: int | None = None
    arquivo_url: str | None = None
    audio_url: str | None = None
    message_external_id: str | None = None


class CreateCaseInput(BaseModel):
    loja_id_alvo: int
    mensagem_ids: list[int]
    tipo_caso: str
    titulo: str
    responsavel_usuario_id: int | None = None


class CreateReimbursementInput(BaseModel):
    caso_id: int
    categoria: str
    valor_solicitado: Decimal
    irmao_id: int | None = None


class PayReimbursementInput(BaseModel):
    valor_aprovado: Decimal | None = None
    observacao_financeiro: str | None = None
    data_pagamento: str | None = None


class ApproveEntityInput(BaseModel):
    entidade_tipo: str
    entidade_id: int
    decisao: str
    observacao: str | None = None
    valor: Decimal | None = None


class GenerateBillingInput(BaseModel):
    contrato_id: int
    competencia: str
    valor: Decimal
    data_vencimento: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/login")
def login(actor: Actor = Depends(get_current_actor)):
    return {
        "status": "authenticated",
        "user_id": actor.user_id,
        "loja_id": actor.loja_id,
        "cargo": actor.cargo,
    }


@app.get("/auth/me")
def me(actor: Actor = Depends(get_current_actor), db=Depends(get_database)):
    with db.transaction() as tx:
        user = tx.fetch_one(
            "select nome, email from usuarios where id = %s",
            [actor.user_id],
        )
    return {
        "user_id": actor.user_id,
        "loja_id": actor.loja_id,
        "cargo": actor.cargo,
        "nome":  user["nome"]  if user else None,
        "email": user["email"] if user else None,
    }


@app.post("/contracts")
def create_contract(payload: CreateContractInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        contrato_id = services.create_contract(
            loja_id=payload.loja_id,
            templo_id=payload.templo_id,
            regra_recorrencia=payload.regra_recorrencia,
            hora_inicio_sessao=payload.hora_inicio_sessao,
            hora_fim_sessao=payload.hora_fim_sessao,
            vigencia_inicio=payload.vigencia_inicio,
            vigencia_fim=payload.vigencia_fim,
            actor=actor,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "contract_id": contrato_id}


@app.get("/contracts/{contract_id}")
def get_contract(contract_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.get_contract(contract_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/contracts/{contract_id}/submit")
def submit_contract(contract_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.submit_contract_for_approval(contract_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "submitted"}


@app.post("/contracts/{contract_id}/decision")
def decide_contract(contract_id: int, payload: ContractDecisionInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.decide_contract(contract_id, payload.decisao, actor, payload.observacao)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": payload.decisao}


@app.post("/contracts/activate")
def activate_contract(payload: ActivateContractInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.activate_contract(payload.contrato_id, actor)
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "activated"}


@app.post("/schedule/validate-conflict")
def validate_schedule_conflict(payload: ValidateScheduleConflictInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.validate_schedule_conflict(
            recurso_id=payload.recurso_id,
            regra=payload.regra,
            hora_inicio=payload.hora_inicio,
            hora_fim=payload.hora_fim,
            vigencia_inicio=payload.vigencia_inicio,
            vigencia_fim=payload.vigencia_fim,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "available"}


@app.post("/messages")
def create_message(payload: CreateMessageInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        message_id = services.create_message(
            loja_id=payload.loja_id,
            tipo=payload.tipo,
            actor=actor,
            texto=payload.texto,
            contexto=payload.contexto,
            enviado_por_telefone=payload.enviado_por_telefone,
            transcricao=payload.transcricao,
            irmao_id=payload.irmao_id,
            arquivo_url=payload.arquivo_url,
            audio_url=payload.audio_url,
            message_external_id=payload.message_external_id,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "message_id": message_id}


@app.get("/messages")
def list_messages(
    loja_id: Optional[int] = Query(default=None),
    tipo: Optional[str] = Query(default=None),
    contexto: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    services: CoreTransactionServices = Depends(get_services),
):
    try:
        return services.list_messages(actor=actor, loja_id=loja_id, tipo=tipo, contexto=contexto, status=status)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@app.get("/messages/{message_id}")
def get_message(message_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.get_message(message_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/cases/from-messages")
def create_case_from_messages(payload: CreateCaseInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        case_id = services.create_case_from_messages(
            loja_id=payload.loja_id_alvo,
            mensagem_ids=payload.mensagem_ids,
            tipo_caso=payload.tipo_caso,
            titulo=payload.titulo,
            actor=actor,
            responsavel_usuario_id=payload.responsavel_usuario_id,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "case_id": case_id}


@app.get("/cases")
def list_cases(
    loja_id: Optional[int] = Query(default=None),
    tipo_caso: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    services: CoreTransactionServices = Depends(get_services),
):
    try:
        return services.list_cases(actor=actor, loja_id=loja_id, tipo_caso=tipo_caso, status=status)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@app.get("/cases/{case_id}")
def get_case(case_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.get_case(case_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/cases/{case_id}/messages")
def list_case_messages(case_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.list_case_messages(case_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/cases/{case_id}/evidences")
def list_case_evidences(case_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.list_case_evidences(case_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/reimbursements")
def create_reimbursement(payload: CreateReimbursementInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        reimbursement_id = services.create_reimbursement_from_case(
            caso_id=payload.caso_id,
            categoria=payload.categoria,
            valor_solicitado=payload.valor_solicitado,
            actor=actor,
            irmao_id=payload.irmao_id,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "reimbursement_id": reimbursement_id}


@app.get("/reimbursements")
def list_reimbursements(loja_id: Optional[int] = Query(default=None), status: Optional[str] = Query(default=None), actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.list_reimbursements(actor=actor, loja_id=loja_id, status=status)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@app.get("/reimbursements/{reimbursement_id}")
def get_reimbursement(reimbursement_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.get_reimbursement(reimbursement_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/reimbursements/{reimbursement_id}/pay")
def pay_reimbursement(reimbursement_id: int, payload: PayReimbursementInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.mark_reimbursement_paid(
            reembolso_id=reimbursement_id,
            actor=actor,
            valor_aprovado=payload.valor_aprovado,
            observacao_financeiro=payload.observacao_financeiro,
            data_pagamento=payload.data_pagamento,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "paid"}


@app.post("/files/upload")
async def upload_file(
    loja_id: int = Form(...),
    categoria: str = Form(...),
    caso_id: Optional[int] = Form(default=None),
    contrato_id: Optional[int] = Form(default=None),
    irmao_id: Optional[int] = Form(default=None),
    file: UploadFile = File(...),
    actor: Actor = Depends(get_current_actor),
    services: CoreTransactionServices = Depends(get_services),
    storage=Depends(get_file_storage),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Arquivo vazio")
    saved = storage.save_file(loja_id=loja_id, original_name=file.filename, content=content)
    try:
        file_id = services.create_file_record(
            loja_id=loja_id,
            categoria=categoria,
            nome_original=file.filename,
            tipo_mime=file.content_type,
            tamanho_bytes=saved["size"],
            sha256=saved["sha256"],
            url_armazenamento=saved["path"],
            actor=actor,
            caso_id=caso_id,
            contrato_id=contrato_id,
            irmao_id=irmao_id,
        )
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "file_id": file_id}


@app.get("/files")
def list_files(loja_id: Optional[int] = Query(default=None), actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.list_files(actor=actor, loja_id=loja_id)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@app.get("/files/{file_id}")
def get_file(file_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        return services.get_file(file_id, actor)
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/files/{file_id}/download")
def download_file(file_id: int, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services), storage=Depends(get_file_storage)):
    try:
        arquivo = services.get_file(file_id, actor)
        services.register_file_access(file_id, actor, acao='baixou')
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if not storage.exists(arquivo["url_armazenamento"]):
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado")

    return FileResponse(path=arquivo["url_armazenamento"], filename=arquivo["nome_original"], media_type=arquivo.get("tipo_mime") or 'application/octet-stream')


@app.post("/approvals")
def approve_entity(payload: ApproveEntityInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        services.approve_entity(
            entidade_tipo=payload.entidade_tipo,
            entidade_id=payload.entidade_id,
            decisao=payload.decisao,
            actor=actor,
            observacao=payload.observacao,
            valor=payload.valor,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": payload.decisao}


@app.post("/billings")
def generate_billing(payload: GenerateBillingInput, actor: Actor = Depends(get_current_actor), services: CoreTransactionServices = Depends(get_services)):
    try:
        billing_id = services.generate_billing_for_contract(
            contrato_id=payload.contrato_id,
            competencia=payload.competencia,
            valor=payload.valor,
            data_vencimento=payload.data_vencimento,
            actor=actor,
        )
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PermissionDenied as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "billing_id": billing_id}


# ═══════════════════════════════════════════════════════════
#  CADASTRO / CONFIRMAÇÃO DE E-MAIL
# ═══════════════════════════════════════════════════════════

class RegisterInput(BaseModel):
    nome: str
    nome_usuario: str
    email: str
    senha: str


@app.post("/registrar", status_code=201)
def registrar(payload: RegisterInput, reg: RegistrationService = Depends(get_registration_service)):
    try:
        reg.registrar(
            nome=payload.nome,
            nome_usuario=payload.nome_usuario,
            email=payload.email,
            senha=payload.senha,
        )
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar e-mail de confirmação: {exc}") from exc
    return {"status": "confirmation_sent"}


@app.get("/confirmar/{token}")
def confirmar_email(token: str, reg: RegistrationService = Depends(get_registration_service)):
    try:
        user = reg.confirmar_email(token)
    except DomainError as exc:
        return HTMLResponse(
            content=f"<h2>Link inválido ou já utilizado.</h2><p>{exc}</p>",
            status_code=400,
        )
    return HTMLResponse(content=f"""
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family:Arial,sans-serif;max-width:480px;margin:80px auto;text-align:center'>
      <h2>✅ E-mail confirmado!</h2>
      <p>Olá, <strong>{user['nome']}</strong>. Sua conta está ativa.</p>
      <p>Você já pode fazer login no sistema.</p>
      <a href='javascript:window.close()' style='color:#2563eb'>Fechar</a>
    </body></html>
    """)


# ═══════════════════════════════════════════════════════════
#  IRMÃOS
# ═══════════════════════════════════════════════════════════

class FilhoInput(BaseModel):
    nome: str
    data_nascimento: Optional[str] = None


class CreateIrmaoInput(BaseModel):
    loja_id: int
    nome: str
    telefone: Optional[str] = None
    cim: Optional[str] = None
    potencia: Optional[str] = None
    data_nascimento: Optional[str] = None
    nome_esposa: Optional[str] = None
    data_nascimento_esposa: Optional[str] = None
    filhos: list[FilhoInput] = []
    mensalidade_categoria: Optional[str] = None
    mensalidade_valor: Optional[Decimal] = None


class SetMensalidadeInput(BaseModel):
    categoria: str
    valor: Decimal
    vigencia_inicio: str
    vigencia_fim: Optional[str] = None
    observacao: Optional[str] = None


@app.post("/irmaos", status_code=201)
def criar_irmao(
    payload: CreateIrmaoInput,
    actor: Actor = Depends(get_current_actor),
    reg: RegistrationService = Depends(get_registration_service),
):
    try:
        irmao_id = reg.criar_irmao(
            loja_id=payload.loja_id,
            nome=payload.nome,
            telefone=payload.telefone,
            cim=payload.cim,
            potencia=payload.potencia,
            data_nascimento=payload.data_nascimento,
            nome_esposa=payload.nome_esposa,
            data_nascimento_esposa=payload.data_nascimento_esposa,
            filhos=[f.model_dump() for f in payload.filhos],
            mensalidade_categoria=payload.mensalidade_categoria,
            mensalidade_valor=payload.mensalidade_valor,
        )
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "irmao_id": irmao_id}


@app.get("/irmaos")
def listar_irmaos(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    reg: RegistrationService = Depends(get_registration_service),
):
    try:
        return reg.listar_irmaos(loja_id=loja_id)
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/irmaos/{irmao_id}/mensalidade", status_code=201)
def definir_mensalidade(
    irmao_id: int,
    payload: SetMensalidadeInput,
    actor: Actor = Depends(get_current_actor),
    reg: RegistrationService = Depends(get_registration_service),
):
    try:
        regra_id = reg.definir_regra_mensalidade(
            irmao_id=irmao_id,
            categoria=payload.categoria,
            valor=payload.valor,
            vigencia_inicio=payload.vigencia_inicio,
            vigencia_fim=payload.vigencia_fim,
            observacao=payload.observacao,
        )
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "created", "regra_id": regra_id}


# ═══════════════════════════════════════════════════════════
#  BOLETOS VIA WHATSAPP
# ═══════════════════════════════════════════════════════════

@app.post("/boletos/webhook")
async def boleto_webhook(request_body: dict, processor: BoletoProcessor = Depends(get_boleto_processor)):
    """Webhook da Evolution API — recebe PDF de boleto e processa automaticamente."""
    try:
        import base64
        data    = request_body.get('data', {})
        msg     = data.get('message', {})
        doc     = msg.get('documentMessage', {})
        loja_id = int(os.getenv('DEFAULT_LOJA_ID', '1'))

        if not doc:
            return {"status": "ignored", "motivo": "não é documento"}

        if doc.get('mimetype') != 'application/pdf':
            return {"status": "ignored", "motivo": "não é PDF"}

        key     = data.get('key', {})
        raw_b64 = doc.get('base64', '')
        if not raw_b64:
            return {"status": "ignored", "motivo": "PDF sem conteúdo base64"}

        pdf_bytes = base64.b64decode(raw_b64)
        resultado = processor.processar(pdf_bytes, loja_id)
        return {"status": "processed", "resultado": resultado}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@app.post("/boletos/upload")
async def boleto_upload(
    loja_id: int = Form(...),
    arquivo: UploadFile = File(...),
    actor: Actor = Depends(get_current_actor),
    processor: BoletoProcessor = Depends(get_boleto_processor),
):
    """Upload manual de PDF de boleto pelo painel."""
    pdf_bytes = await arquivo.read()
    try:
        resultado = processor.processar(pdf_bytes, loja_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return resultado


@app.get("/boletos")
def listar_boletos(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    processor: BoletoProcessor = Depends(get_boleto_processor),
):
    return processor.listar_processados(loja_id)


# ═══════════════════════════════════════════════════════════
#  ANIVERSÁRIOS
# ═══════════════════════════════════════════════════════════

@app.get("/aniversarios")
def aniversarios(
    loja_id: int = Query(...),
    dias: int = Query(default=30),
    actor: Actor = Depends(get_current_actor),
    svc: BirthdayService = Depends(get_birthday_service),
):
    return svc.proximos(loja_id=loja_id, dias=dias)


@app.post("/aniversarios/notificar-hoje")
def notificar_aniversarios_hoje(
    loja_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: BirthdayService = Depends(get_birthday_service),
):
    resultados = svc.notificar_hoje(loja_id=loja_id)
    return {"notificados": len(resultados), "detalhes": resultados}


# ═══════════════════════════════════════════════════════════
#  AGENDA (GOOGLE CALENDAR)
# ═══════════════════════════════════════════════════════════

class CreateEventInput(BaseModel):
    titulo: str
    descricao: str
    inicio: str
    fim: str
    convidados: list[str] = []


@app.get("/agenda")
def listar_agenda(
    dias: int = Query(default=30),
    actor: Actor = Depends(get_current_actor),
    cal: CalendarService = Depends(get_calendar_service),
):
    if not cal.disponivel:
        raise HTTPException(status_code=503, detail="Google Calendar não configurado. Veja .env.example.")
    return cal.listar_eventos(dias=dias)


@app.post("/agenda", status_code=201)
def criar_evento(
    payload: CreateEventInput,
    actor: Actor = Depends(get_current_actor),
    cal: CalendarService = Depends(get_calendar_service),
):
    if not cal.disponivel:
        raise HTTPException(status_code=503, detail="Google Calendar não configurado. Veja .env.example.")
    try:
        evento = cal.criar_evento(
            titulo=payload.titulo,
            descricao=payload.descricao,
            inicio=payload.inicio,
            fim=payload.fim,
            convidados=payload.convidados,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"status": "created", "event_id": evento.get("id"), "link": evento.get("htmlLink")}


@app.delete("/agenda/{event_id}")
def deletar_evento(
    event_id: str,
    actor: Actor = Depends(get_current_actor),
    cal: CalendarService = Depends(get_calendar_service),
):
    if not cal.disponivel:
        raise HTTPException(status_code=503, detail="Google Calendar não configurado.")
    cal.deletar_evento(event_id)
    return {"status": "deleted"}


# ═══════════════════════════════════════════════════════════
#  CENTROS DE CUSTO
# ═══════════════════════════════════════════════════════════

class CentroCustoInput(BaseModel):
    loja_id: int
    nome: str
    descricao: Optional[str] = None

class CentroCustoUpdateInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

@app.post("/centros-custo", status_code=201)
def criar_centro_custo(
    payload: CentroCustoInput,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    cid = svc.criar_centro_custo(payload.loja_id, payload.nome, payload.descricao)
    return {"id": cid}

@app.get("/centros-custo")
def listar_centros_custo(
    loja_id: int = Query(...),
    apenas_ativos: bool = Query(default=True),
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    return svc.listar_centros_custo(loja_id, apenas_ativos)

@app.put("/centros-custo/{centro_id}")
def atualizar_centro_custo(
    centro_id: int,
    payload: CentroCustoUpdateInput,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    svc.atualizar_centro_custo(centro_id, payload.nome, payload.descricao, payload.ativo)
    return {"status": "updated"}

@app.delete("/centros-custo/{centro_id}")
def deletar_centro_custo(
    centro_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    svc.deletar_centro_custo(centro_id)
    return {"status": "deleted"}


# ═══════════════════════════════════════════════════════════
#  REGRAS DE RATEIO
# ═══════════════════════════════════════════════════════════

class RateioItemInput(BaseModel):
    centro_custo_id: int
    percentual: float

class RegraRateioInput(BaseModel):
    loja_id: int
    nome: str
    descricao: Optional[str] = None
    itens: list[RateioItemInput]

class RegraRateioUpdateInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True
    itens: Optional[list[RateioItemInput]] = None

@app.post("/regras-rateio", status_code=201)
def criar_regra_rateio(
    payload: RegraRateioInput,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    try:
        rid = svc.criar_regra(
            payload.loja_id, payload.nome, payload.descricao,
            [i.model_dump() for i in payload.itens], actor.user_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": rid}

@app.get("/regras-rateio")
def listar_regras_rateio(
    loja_id: int = Query(...),
    apenas_ativas: bool = Query(default=True),
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    return svc.listar_regras(loja_id, apenas_ativas)

@app.put("/regras-rateio/{regra_id}")
def atualizar_regra_rateio(
    regra_id: int,
    payload: RegraRateioUpdateInput,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    try:
        itens = [i.model_dump() for i in payload.itens] if payload.itens is not None else None
        svc.atualizar_regra(regra_id, payload.nome, payload.descricao, payload.ativo, itens)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "updated"}

@app.delete("/regras-rateio/{regra_id}")
def deletar_regra_rateio(
    regra_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: RateioService = Depends(get_rateio_service),
):
    svc.deletar_regra(regra_id)
    return {"status": "deleted"}


# ═══════════════════════════════════════════════════════════
#  COMPRAS / REEMBOLSOS
# ═══════════════════════════════════════════════════════════

class CompraInput(BaseModel):
    loja_id: int
    evento: str
    valor: float
    regra_rateio_id: Optional[int] = None

class CompraStatusInput(BaseModel):
    status: str
    observacao: Optional[str] = None

class CompraVisibilidadeInput(BaseModel):
    visivel: bool

class NotifDestinatarioInput(BaseModel):
    loja_id: int
    evento_tipo: str
    usuario_id: int
    ativo: bool = True

@app.post("/compras", status_code=201)
async def criar_compra(
    loja_id: int = Form(...),
    evento: str = Form(...),
    valor: float = Form(...),
    regra_rateio_id: Optional[int] = Form(default=None),
    arquivos: list[UploadFile] = File(default=[]),
    actor: Actor = Depends(get_current_actor),
    svc: ComprasService = Depends(get_compras_service),
):
    compra_id = svc.criar_compra(loja_id, actor.user_id, evento, valor, regra_rateio_id)
    for arq in arquivos:
        content = await arq.read()
        mime = arq.content_type or ""
        tipo = "foto" if mime.startswith("image/") else ("cupom" if "pdf" in mime else "arquivo")
        import hashlib, uuid
        sha = hashlib.sha256(content).hexdigest()
        import os as _os
        from pathlib import Path
        base = _os.getenv("STORAGE_DIR", str(Path(__file__).parent.parent / "storage_uploads"))
        Path(base).mkdir(parents=True, exist_ok=True)
        ext = Path(arq.filename or "arquivo").suffix or ".bin"
        fname = f"{uuid.uuid4().hex}{ext}"
        fpath = str(Path(base) / str(loja_id) / fname)
        Path(fpath).parent.mkdir(parents=True, exist_ok=True)
        Path(fpath).write_bytes(content)
        svc.adicionar_arquivo(compra_id, tipo, fpath, arq.filename, len(content), sha)
    svc.notificar_nova_compra(compra_id, loja_id)
    return {"id": compra_id}

@app.get("/compras")
def listar_compras(
    loja_id: int = Query(...),
    incluir_ocultos: bool = Query(default=False),
    status: Optional[str] = Query(default=None),
    data_inicio: Optional[str] = Query(default=None),
    data_fim: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    svc: ComprasService = Depends(get_compras_service),
):
    return svc.listar_compras(loja_id, incluir_ocultos, status,
                               data_inicio=data_inicio, data_fim=data_fim)

@app.patch("/compras/{compra_id}/status")
def atualizar_status_compra(
    compra_id: int,
    payload: CompraStatusInput,
    actor: Actor = Depends(get_current_actor),
    svc: ComprasService = Depends(get_compras_service),
):
    if payload.status not in ("aprovado", "rejeitado", "pendente"):
        raise HTTPException(status_code=400, detail="Status inválido.")
    svc.atualizar_status(compra_id, payload.status, actor.user_id, payload.observacao)
    return {"status": "updated"}

@app.patch("/compras/{compra_id}/visibilidade")
def atualizar_visibilidade_compra(
    compra_id: int,
    payload: CompraVisibilidadeInput,
    actor: Actor = Depends(get_current_actor),
    svc: ComprasService = Depends(get_compras_service),
):
    svc.atualizar_visibilidade(compra_id, payload.visivel)
    return {"status": "updated"}

@app.get("/compras/{compra_id}/arquivo/{arquivo_id}")
def download_arquivo_compra(
    compra_id: int,
    arquivo_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: ComprasService = Depends(get_compras_service),
):
    result = svc.arquivo_bytes(arquivo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    data, nome = result
    import io
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{nome}"'},
    )

# ── Notificações destinatários ────────────────────────────────────────────

@app.get("/notificacoes/destinatarios")
def listar_destinatarios(
    loja_id: int = Query(...),
    evento_tipo: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    from backend_services.postgres_adapter import PostgresDatabase
    filters = ["nd.loja_id = %s"]
    params: list = [loja_id]
    if evento_tipo:
        filters.append("nd.evento_tipo = %s")
        params.append(evento_tipo)
    where = " AND ".join(filters)
    with db.transaction() as tx:
        return tx.fetch_all(
            f"""SELECT nd.*, u.nome AS usuario_nome, u.email
                FROM notificacoes_destinatarios nd
                JOIN usuarios u ON u.id = nd.usuario_id
                WHERE {where} ORDER BY nd.evento_tipo, u.nome""",
            params,
        )

@app.post("/notificacoes/destinatarios", status_code=201)
def salvar_destinatario(
    payload: NotifDestinatarioInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            """INSERT INTO notificacoes_destinatarios (loja_id, evento_tipo, usuario_id, ativo)
               VALUES (%s,%s,%s,%s)
               ON CONFLICT (loja_id, evento_tipo, usuario_id)
               DO UPDATE SET ativo = EXCLUDED.ativo""",
            (payload.loja_id, payload.evento_tipo, payload.usuario_id, payload.ativo),
        )
    return {"status": "saved"}


# ═══════════════════════════════════════════════════════════
#  RELATÓRIOS
# ═══════════════════════════════════════════════════════════

@app.get("/relatorios/tesouraria")
def relatorio_tesouraria(
    loja_id: int = Query(...),
    data_inicio: Optional[str] = Query(default=None),
    data_fim: Optional[str] = Query(default=None),
    incluir_ocultos: bool = Query(default=False),
    actor: Actor = Depends(get_current_actor),
    svc: RelatoriosService = Depends(get_relatorios_service),
):
    return svc.tesouraria(loja_id, data_inicio, data_fim, incluir_ocultos)

@app.get("/relatorios/mensalidades")
def relatorio_mensalidades(
    loja_id: int = Query(...),
    data_inicio: Optional[str] = Query(default=None),
    data_fim: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    svc: RelatoriosService = Depends(get_relatorios_service),
):
    return svc.mensalidades(loja_id, data_inicio, data_fim)

@app.get("/relatorios/agenda")
def relatorio_agenda(
    loja_id: int = Query(...),
    data_inicio: Optional[str] = Query(default=None),
    data_fim: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    svc: RelatoriosService = Depends(get_relatorios_service),
):
    return svc.agenda(loja_id, data_inicio, data_fim)


# ── WhatsApp: status da instância ─────────────────────────────────────────

@app.get("/whatsapp/status")
def whatsapp_status(
    actor: Actor = Depends(get_current_actor),
    wpp=Depends(get_whatsapp_service),
):
    try:
        return wpp.status()
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}
