import secrets

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from backend_services.audit_service import AuditService
from backend_services.auth_service import AuthService
from backend_services.core_transaction_services import CoreTransactionServices
from backend_services.birthday_service import BirthdayService
from backend_services.boleto_processor import BoletoProcessor
from backend_services.calendar_service import CalendarService
from backend_services.email_service import EmailService
from backend_services.file_storage_service import FileStorageService
from backend_services.postgres_adapter import PostgresDatabase, build_postgres_dsn
from backend_services.registration_service import RegistrationService
from backend_services.scheduler import Scheduler
from backend_services.whatsapp_service import WhatsAppService


_db = None
_services = None
_auth_service = None
_file_storage = None
_registration_service = None
_email_service = None
_whatsapp_service = None
_birthday_service = None
_boleto_processor = None
_calendar_service = None
_scheduler = None
_basic_security = HTTPBasic()


def get_database():
    global _db
    if _db is None:
        _db = PostgresDatabase(build_postgres_dsn())
    return _db


def get_services():
    global _services
    if _services is None:
        _services = CoreTransactionServices(
            db=get_database(),
            audit_service=AuditService(),
            clock=None,
        )
    return _services


def get_auth_service():
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService(get_database())
    return _auth_service


def get_file_storage():
    global _file_storage
    if _file_storage is None:
        _file_storage = FileStorageService("C:/Users/Usuario/Desktop/Secretaria Digital/storage_uploads")
    return _file_storage


def get_email_service():
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service


def get_registration_service():
    global _registration_service
    if _registration_service is None:
        _registration_service = RegistrationService(
            db=get_database(),
            email_service=get_email_service(),
        )
    return _registration_service


def get_whatsapp_service():
    global _whatsapp_service
    if _whatsapp_service is None:
        _whatsapp_service = WhatsAppService()
    return _whatsapp_service


def get_birthday_service():
    global _birthday_service
    if _birthday_service is None:
        _birthday_service = BirthdayService(
            db=get_database(),
            whatsapp_service=get_whatsapp_service(),
        )
    return _birthday_service


def get_boleto_processor():
    global _boleto_processor
    if _boleto_processor is None:
        _boleto_processor = BoletoProcessor(
            db=get_database(),
            whatsapp_service=get_whatsapp_service(),
        )
    return _boleto_processor


def get_calendar_service():
    global _calendar_service
    if _calendar_service is None:
        _calendar_service = CalendarService()
    return _calendar_service


def get_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = Scheduler()
    return _scheduler


def get_current_actor(
    credentials: HTTPBasicCredentials = Depends(_basic_security),
    auth_service: AuthService = Depends(get_auth_service),
):
    email = credentials.username.strip()
    password = credentials.password

    if not email or not password:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    actor = auth_service.authenticate_basic(email=email, password=password)
    if actor is None:
        secrets.compare_digest("invalid", "invalid")
        raise HTTPException(status_code=401, detail="invalid_credentials")

    return actor
