import os
import re as _re
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

from fastapi import Request

from backend_api.dependencies import (
    get_agenda_service,
    get_birthday_service,
    get_boleto_processor,
    get_calendar_service,
    get_comissoes_service,
    get_compras_service,
    get_current_actor,
    get_database,
    get_file_storage,
    get_permissoes_service,
    get_rateio_service,
    get_registration_service,
    get_relatorios_service,
    get_scheduler,
    get_services,
    get_whatsapp_bot,
    get_whatsapp_service,
)
from backend_services.whatsapp_bot import WhatsAppBot
from backend_services.whatsapp_service import WhatsAppService
from backend_services.agenda_service import AgendaService
from backend_services.comissoes_service import ComissoesService
from backend_services.compras_service import ComprasService
from backend_services.permissoes_service import PermissoesService
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


def _ensure_schema(db) -> None:
    """Aplica DDL incremental na inicialização — idempotente."""
    stmts = [
        # ── 001: tabelas base de identidade ──────────────────────────────────
        """CREATE TABLE IF NOT EXISTS cargos (
            id BIGSERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL UNIQUE,
            nivel_hierarquico INTEGER NOT NULL DEFAULT 0 CHECK (nivel_hierarquico >= 0),
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS lojas (
            id BIGSERIAL PRIMARY KEY,
            nome VARCHAR(150) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','ativa','inativa','bloqueada')),
            plano VARCHAR(50),
            telefone_whatsapp VARCHAR(30),
            cidade VARCHAR(120),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        """CREATE TABLE IF NOT EXISTS usuarios (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT REFERENCES lojas(id),
            cargo_id BIGINT NOT NULL REFERENCES cargos(id),
            nome VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        """CREATE TABLE IF NOT EXISTS delegacoes (
            id BIGSERIAL PRIMARY KEY,
            concedido_por_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
            concedido_para_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
            permissao VARCHAR(100) NOT NULL,
            escopo VARCHAR(100),
            limite_valor NUMERIC(12,2) CHECK (limite_valor IS NULL OR limite_valor >= 0),
            inicio_vigencia TIMESTAMP NOT NULL,
            fim_vigencia TIMESTAMP,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CHECK (fim_vigencia IS NULL OR fim_vigencia >= inicio_vigencia))""",
        """CREATE TABLE IF NOT EXISTS irmaos (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            nome VARCHAR(150) NOT NULL,
            telefone VARCHAR(30),
            status VARCHAR(30) NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo','inativo','bloqueado')),
            observacoes TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (observacoes IS NULL OR length(observacoes) <= 5000))""",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_loja_id ON usuarios(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_irmaos_loja_id ON irmaos(loja_id)",
        # ── 015: seed cargos iniciais ─────────────────────────────────────────
        """INSERT INTO cargos (nome, nivel_hierarquico) VALUES
           ('admin_principal', 100), ('veneravel_mestre', 90),
           ('primeiro_vigilante', 80), ('segundo_vigilante', 70),
           ('financeiro', 60), ('secretario', 60), ('chanceler', 60),
           ('arquiteto', 60), ('almoxarife', 60), ('irmao_operacional', 10)
           ON CONFLICT (nome) DO NOTHING""",
        # ── 018: compras, rateio ──────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS centros_custo (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            nome VARCHAR(100) NOT NULL, descricao TEXT,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS regras_rateio (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            nome VARCHAR(100) NOT NULL, descricao TEXT,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_por INT REFERENCES usuarios(id),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS regras_rateio_itens (
            id SERIAL PRIMARY KEY,
            regra_id INT NOT NULL REFERENCES regras_rateio(id) ON DELETE CASCADE,
            centro_custo_id INT NOT NULL REFERENCES centros_custo(id),
            percentual NUMERIC(6,3) NOT NULL CHECK (percentual > 0 AND percentual <= 100))""",
        """CREATE TABLE IF NOT EXISTS compras (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            usuario_id INT NOT NULL REFERENCES usuarios(id),
            evento VARCHAR(200) NOT NULL,
            valor NUMERIC(12,2) NOT NULL,
            regra_rateio_id INT REFERENCES regras_rateio(id),
            status VARCHAR(20) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','aprovado','rejeitado')),
            aprovado_por INT REFERENCES usuarios(id),
            aprovado_em TIMESTAMPTZ, observacao TEXT,
            visivel BOOLEAN NOT NULL DEFAULT TRUE,
            whatsapp_from VARCHAR(50),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS compras_arquivos (
            id SERIAL PRIMARY KEY,
            compra_id INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
            tipo VARCHAR(20) NOT NULL DEFAULT 'arquivo'
                CHECK (tipo IN ('foto','cupom','arquivo')),
            caminho VARCHAR(500) NOT NULL, nome_original VARCHAR(200),
            tamanho_bytes INT, sha256 VARCHAR(64),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS notificacoes_destinatarios (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            evento_tipo VARCHAR(50) NOT NULL,
            usuario_id INT NOT NULL REFERENCES usuarios(id),
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            UNIQUE (loja_id, evento_tipo, usuario_id))""",
        "CREATE INDEX IF NOT EXISTS idx_compras_loja_id ON compras(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_compras_usuario_id ON compras(usuario_id)",
        "CREATE INDEX IF NOT EXISTS idx_compras_status ON compras(status)",
        "CREATE INDEX IF NOT EXISTS idx_compras_criado_em ON compras(criado_em)",
        # ── 020: repositorio_arquivos ─────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS repositorio_arquivos (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            usuario_id INT REFERENCES usuarios(id),
            contexto VARCHAR(50) NOT NULL DEFAULT 'geral',
            contexto_id INT, descricao TEXT,
            caminho VARCHAR(500) NOT NULL, nome_original VARCHAR(200),
            mimetype VARCHAR(100), tamanho_bytes INT, sha256 VARCHAR(64),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        "CREATE INDEX IF NOT EXISTS idx_repos_loja_id ON repositorio_arquivos(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_repos_usuario_id ON repositorio_arquivos(usuario_id)",
        "CREATE INDEX IF NOT EXISTS idx_repos_criado_em ON repositorio_arquivos(criado_em DESC)",
        # ── 021: sessoes_recorrentes, agenda_eventos ──────────────────────────
        """CREATE TABLE IF NOT EXISTS sessoes_recorrentes (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            titulo VARCHAR(200) NOT NULL, descricao TEXT,
            tipo VARCHAR(30) NOT NULL DEFAULT 'sessao'
                CHECK (tipo IN ('sessao','agape','administrativa','especial')),
            frequencia VARCHAR(30) NOT NULL
                CHECK (frequencia IN ('semanal','quinzenal','mensal_dia_semana','mensal_dia_numero')),
            dia_semana SMALLINT CHECK (dia_semana BETWEEN 0 AND 6),
            semana_mes SMALLINT CHECK (semana_mes BETWEEN 1 AND 5),
            dia_mes SMALLINT CHECK (dia_mes BETWEEN 1 AND 31),
            hora_inicio TIME NOT NULL, hora_fim TIME NOT NULL,
            cor VARCHAR(7) NOT NULL DEFAULT '#2563eb',
            vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
            vigencia_fim DATE, ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS agenda_eventos (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            titulo VARCHAR(200) NOT NULL, descricao TEXT,
            tipo VARCHAR(30) NOT NULL DEFAULT 'evento',
            data DATE NOT NULL, hora_inicio TIME NOT NULL, hora_fim TIME NOT NULL,
            local VARCHAR(200), cor VARCHAR(7) NOT NULL DEFAULT '#7c3aed',
            criado_por INT REFERENCES usuarios(id),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        "CREATE INDEX IF NOT EXISTS idx_sess_rec_loja ON sessoes_recorrentes(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_agenda_ev_loja ON agenda_eventos(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_agenda_ev_data ON agenda_eventos(data)",
        # ── 002: recursos ────────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS recursos (
            id BIGSERIAL PRIMARY KEY, nome VARCHAR(150) NOT NULL,
            tipo VARCHAR(50) NOT NULL DEFAULT 'outro',
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 010: auditoria_eventos ────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS auditoria_eventos (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT REFERENCES lojas(id),
            usuario_id BIGINT REFERENCES usuarios(id),
            cargo_snapshot VARCHAR(100),
            acao VARCHAR(100) NOT NULL,
            modulo VARCHAR(50) NOT NULL,
            entidade_tipo VARCHAR(50),
            entidade_id BIGINT,
            detalhes_json JSONB,
            origem VARCHAR(30) NOT NULL DEFAULT 'painel',
            exigiu_reautenticacao BOOLEAN NOT NULL DEFAULT FALSE,
            ocorreu_em TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 003: contratos (depende de recursos) ─────────────────────────────
        """CREATE TABLE IF NOT EXISTS contratos (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            templo_id BIGINT REFERENCES recursos(id),
            status VARCHAR(30) NOT NULL DEFAULT 'rascunho',
            arquivo_url TEXT,
            vigencia_inicio DATE,
            vigencia_fim DATE,
            regra_recorrencia VARCHAR(150),
            hora_inicio_sessao TIME,
            hora_fim_sessao TIME,
            created_by_usuario_id BIGINT REFERENCES usuarios(id),
            updated_by_usuario_id BIGINT REFERENCES usuarios(id),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 004: agenda_slots (depende de contratos, recursos) ────────────────
        """CREATE TABLE IF NOT EXISTS agenda_slots (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            contrato_id BIGINT REFERENCES contratos(id),
            recurso_id BIGINT NOT NULL REFERENCES recursos(id),
            regra VARCHAR(150) NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fim TIME NOT NULL,
            vigencia_inicio DATE NOT NULL,
            vigencia_fim DATE,
            status VARCHAR(30) NOT NULL DEFAULT 'ativo',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 005: mensagens ────────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS mensagens (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT REFERENCES lojas(id),
            irmao_id BIGINT REFERENCES irmaos(id),
            message_external_id VARCHAR(255),
            tipo VARCHAR(30) NOT NULL DEFAULT 'texto',
            contexto VARCHAR(50),
            texto TEXT,
            arquivo_url TEXT,
            audio_url TEXT,
            transcricao TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'novo',
            enviado_por_telefone VARCHAR(30),
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 006: casos_operacionais ───────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS casos_operacionais (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            tipo_caso VARCHAR(50) NOT NULL DEFAULT 'documento',
            subtipo VARCHAR(50),
            criado_por_irmao_id BIGINT REFERENCES irmaos(id),
            criado_por_usuario_id BIGINT REFERENCES usuarios(id),
            responsavel_usuario_id BIGINT REFERENCES usuarios(id),
            origem VARCHAR(30) NOT NULL DEFAULT 'painel',
            status VARCHAR(30) NOT NULL DEFAULT 'novo',
            titulo VARCHAR(200) NOT NULL,
            descricao_resumida TEXT,
            valor_informado NUMERIC(12,2),
            valor_confirmado NUMERIC(12,2),
            data_referencia DATE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 007: arquivos, evidencias, acessos_arquivo ────────────────────────
        """CREATE TABLE IF NOT EXISTS arquivos (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            irmao_id BIGINT REFERENCES irmaos(id),
            contrato_id BIGINT REFERENCES contratos(id),
            caso_id BIGINT REFERENCES casos_operacionais(id),
            categoria VARCHAR(50) NOT NULL DEFAULT 'geral',
            nome_original VARCHAR(255) NOT NULL,
            tipo_mime VARCHAR(120),
            tamanho_bytes BIGINT,
            sha256 VARCHAR(64),
            url_armazenamento TEXT NOT NULL DEFAULT '',
            origem_envio VARCHAR(30) NOT NULL DEFAULT 'admin',
            status VARCHAR(30) NOT NULL DEFAULT 'ativo',
            enviado_por_usuario_id BIGINT REFERENCES usuarios(id),
            enviado_por_telefone VARCHAR(30),
            data_envio TIMESTAMP NOT NULL DEFAULT NOW(),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        """CREATE TABLE IF NOT EXISTS evidencias (
            id BIGSERIAL PRIMARY KEY,
            caso_id BIGINT NOT NULL REFERENCES casos_operacionais(id),
            arquivo_id BIGINT REFERENCES arquivos(id),
            tipo VARCHAR(30) NOT NULL DEFAULT 'arquivo',
            texto_extraido TEXT,
            transcricao TEXT,
            enviado_por_telefone VARCHAR(30),
            data_envio TIMESTAMP NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS acessos_arquivo (
            id BIGSERIAL PRIMARY KEY,
            arquivo_id BIGINT NOT NULL REFERENCES arquivos(id),
            usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
            acao VARCHAR(30) NOT NULL DEFAULT 'visualizou',
            origem VARCHAR(30) NOT NULL DEFAULT 'painel',
            data_hora TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 008: cobrancas ────────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS cobrancas (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            contrato_id BIGINT REFERENCES contratos(id),
            competencia VARCHAR(7) NOT NULL,
            valor NUMERIC(12,2) NOT NULL DEFAULT 0,
            data_vencimento DATE NOT NULL DEFAULT CURRENT_DATE,
            boleto_url TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'pendente',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 009: aprovacoes ───────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS aprovacoes (
            id BIGSERIAL PRIMARY KEY,
            entidade_tipo VARCHAR(50) NOT NULL,
            entidade_id BIGINT NOT NULL,
            etapa VARCHAR(50),
            aprovado_por_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
            delegacao_id BIGINT REFERENCES delegacoes(id),
            decisao VARCHAR(20) NOT NULL DEFAULT 'aprovado',
            observacao TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 011: sessoes_whatsapp ─────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS sessoes_whatsapp (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT REFERENCES lojas(id),
            irmao_id BIGINT REFERENCES irmaos(id),
            usuario_id BIGINT REFERENCES usuarios(id),
            telefone VARCHAR(30) NOT NULL,
            contexto_ativo VARCHAR(50) NOT NULL DEFAULT 'inicio',
            perfil_snapshot VARCHAR(100),
            iniciado_em TIMESTAMP NOT NULL DEFAULT NOW(),
            expira_em TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
            encerrado_em TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 012: eventos ──────────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS eventos (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            criado_por_usuario_id BIGINT REFERENCES usuarios(id),
            contrato_id BIGINT REFERENCES contratos(id),
            templo_id BIGINT REFERENCES recursos(id),
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            tipo VARCHAR(30) NOT NULL DEFAULT 'evento',
            status VARCHAR(30) NOT NULL DEFAULT 'pendente',
            data_evento DATE NOT NULL DEFAULT CURRENT_DATE,
            hora_inicio TIME NOT NULL DEFAULT '08:00',
            hora_fim TIME NOT NULL DEFAULT '10:00',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 013: caso_mensagens ───────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS caso_mensagens (
            id BIGSERIAL PRIMARY KEY,
            caso_id BIGINT NOT NULL REFERENCES casos_operacionais(id),
            mensagem_id BIGINT NOT NULL REFERENCES mensagens(id),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE (caso_id, mensagem_id),
            UNIQUE (mensagem_id))""",
        # ── 014: reembolsos ───────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS reembolsos (
            id BIGSERIAL PRIMARY KEY,
            caso_id BIGINT NOT NULL REFERENCES casos_operacionais(id),
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            irmao_id BIGINT REFERENCES irmaos(id),
            aprovado_por_usuario_id BIGINT REFERENCES usuarios(id),
            categoria VARCHAR(50) NOT NULL DEFAULT 'outros',
            valor_solicitado NUMERIC(12,2) NOT NULL DEFAULT 0,
            valor_aprovado NUMERIC(12,2),
            status VARCHAR(30) NOT NULL DEFAULT 'pendente',
            data_pagamento DATE,
            observacao_financeiro TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP)""",
        # ── 016: colunas em irmaos e usuarios ────────────────────────────────
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS cim VARCHAR(30)",
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS data_nascimento DATE",
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS nome_esposa VARCHAR(150)",
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS data_nascimento_esposa DATE",
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS potencia VARCHAR(100)",
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS confirmacao_token TEXT",
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_confirmado BOOLEAN NOT NULL DEFAULT TRUE",
        # ── 016: irmaos_filhos, regras_mensalidade ────────────────────────────
        """CREATE TABLE IF NOT EXISTS irmaos_filhos (
            id BIGSERIAL PRIMARY KEY,
            irmao_id BIGINT NOT NULL REFERENCES irmaos(id) ON DELETE CASCADE,
            nome VARCHAR(150) NOT NULL,
            data_nascimento DATE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS regras_mensalidade (
            id BIGSERIAL PRIMARY KEY,
            irmao_id BIGINT NOT NULL REFERENCES irmaos(id) ON DELETE CASCADE,
            categoria VARCHAR(30) NOT NULL DEFAULT 'regular',
            valor NUMERIC(10,2) NOT NULL DEFAULT 0,
            vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
            vigencia_fim DATE,
            observacao TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 017: boletos_processados ──────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS boletos_processados (
            id BIGSERIAL PRIMARY KEY,
            loja_id BIGINT NOT NULL REFERENCES lojas(id),
            irmao_id BIGINT REFERENCES irmaos(id),
            tamanho_bytes INTEGER,
            status VARCHAR(30) NOT NULL DEFAULT 'enviado',
            erro TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW())""",
        # ── 019: cargo_permissoes, comissoes, comissoes_membros ───────────────
        """CREATE TABLE IF NOT EXISTS cargo_permissoes (
            id SERIAL PRIMARY KEY,
            loja_id INT NOT NULL,
            cargo VARCHAR(50) NOT NULL,
            recurso VARCHAR(50) NOT NULL,
            acoes TEXT[] NOT NULL DEFAULT '{}',
            UNIQUE (loja_id, cargo, recurso))""",
        """CREATE TABLE IF NOT EXISTS comissoes (
            id SERIAL PRIMARY KEY,
            loja_id INT NOT NULL,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS comissoes_membros (
            id SERIAL PRIMARY KEY,
            comissao_id INT NOT NULL REFERENCES comissoes(id) ON DELETE CASCADE,
            irmao_id INT NOT NULL REFERENCES irmaos(id) ON DELETE CASCADE,
            funcao VARCHAR(100),
            data_inicio DATE,
            data_fim DATE,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            UNIQUE (comissao_id, irmao_id))""",
        # ── 022: irmaos.usuario_id ────────────────────────────────────────────
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL",
        # ── 023: repositorio_arquivos.conteudo ────────────────────────────────
        "ALTER TABLE repositorio_arquivos ADD COLUMN IF NOT EXISTS conteudo BYTEA",
        # ── 024: categorias_mensalidade, inventario_loja, notificacoes_inbox ──
        """CREATE TABLE IF NOT EXISTS categorias_mensalidade (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            nome TEXT NOT NULL, descricao TEXT,
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(loja_id, nome))""",
        """CREATE TABLE IF NOT EXISTS inventario_loja (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            nome TEXT NOT NULL, descricao TEXT,
            quantidade INT NOT NULL DEFAULT 1,
            condicao TEXT NOT NULL DEFAULT 'bom',
            precisa_comprar BOOLEAN NOT NULL DEFAULT FALSE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        """CREATE TABLE IF NOT EXISTS notificacoes_inbox (
            id SERIAL PRIMARY KEY, loja_id INT NOT NULL,
            usuario_id INT NOT NULL, titulo TEXT NOT NULL,
            mensagem TEXT, lido BOOLEAN NOT NULL DEFAULT FALSE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
        # ── 025: irmaos.cargo_loja / whatsapp ────────────────────────────────
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS cargo_loja TEXT",
        "ALTER TABLE irmaos ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(30)",
        # ── 026: compras_arquivos.conteudo ────────────────────────────────────
        "ALTER TABLE compras_arquivos ADD COLUMN IF NOT EXISTS conteudo BYTEA",
        # ── cargos extras ─────────────────────────────────────────────────────
        """INSERT INTO cargos (nome, nivel_hierarquico) VALUES
           ('mestre_banquete', 55), ('obreiro', 20), ('irmao_loja', 15), ('orador', 60)
           ON CONFLICT (nome) DO NOTHING""",
        # ── 027: tarefas ──────────────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS tarefas (
            id SERIAL PRIMARY KEY,
            loja_id INT NOT NULL,
            criado_por_usuario_id INT REFERENCES usuarios(id),
            responsavel_usuario_id INT REFERENCES usuarios(id),
            irmao_id INT REFERENCES irmaos(id),
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
            prioridade VARCHAR(20) NOT NULL DEFAULT 'normal'
                CHECK (prioridade IN ('baixa','normal','alta','urgente')),
            vencimento DATE,
            google_task_id VARCHAR(200),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ)""",
        "CREATE INDEX IF NOT EXISTS idx_tarefas_loja_id ON tarefas(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status)",
        "CREATE INDEX IF NOT EXISTS idx_tarefas_vencimento ON tarefas(vencimento)",
        # ── 028: hierarquia complexo/loja ─────────────────────────────────────
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'loja' CHECK (tipo IN ('loja','complexo'))",
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS complexo_id BIGINT REFERENCES lojas(id)",
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS numero VARCHAR(20)",
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS potencia VARCHAR(100)",
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS endereco TEXT",
        "CREATE INDEX IF NOT EXISTS idx_lojas_complexo_id ON lojas(complexo_id)",
        # ── 029: multi-tenant SaaS ────────────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(150) NOT NULL,
            tipo VARCHAR(20) NOT NULL DEFAULT 'externo'
                CHECK (tipo IN ('interno','externo')),
            plano VARCHAR(50),
            valor_mensalidade NUMERIC(10,2),
            vencimento_dia INT DEFAULT 10
                CHECK (vencimento_dia BETWEEN 1 AND 28),
            dias_tolerancia INT DEFAULT 5,
            status VARCHAR(20) NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo','bloqueado','cancelado','teste')),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            cancelado_em TIMESTAMPTZ)""",
        "ALTER TABLE lojas ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id)",
        """CREATE TABLE IF NOT EXISTS assinaturas_saas (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id),
            competencia VARCHAR(7) NOT NULL,
            valor NUMERIC(10,2) NOT NULL,
            vencimento DATE NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','pago','vencido','cancelado')),
            pago_em TIMESTAMPTZ,
            forma_pagamento VARCHAR(30),
            observacao TEXT,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(tenant_id, competencia))""",
        "CREATE INDEX IF NOT EXISTS idx_assinaturas_tenant_id ON assinaturas_saas(tenant_id)",
        "CREATE INDEX IF NOT EXISTS idx_lojas_tenant_id ON lojas(tenant_id)",
        # ── 030: pagamentos_mensalidade ───────────────────────────────────────
        """CREATE TABLE IF NOT EXISTS pagamentos_mensalidade (
            id SERIAL PRIMARY KEY,
            loja_id INT NOT NULL,
            irmao_id INT NOT NULL REFERENCES irmaos(id),
            competencia VARCHAR(7) NOT NULL,
            valor NUMERIC(10,2) NOT NULL DEFAULT 0,
            pago_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            forma_pagamento VARCHAR(30),
            observacao TEXT,
            registrado_por INT REFERENCES usuarios(id),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(irmao_id, competencia))""",
        "CREATE INDEX IF NOT EXISTS idx_pag_mens_loja ON pagamentos_mensalidade(loja_id)",
        "CREATE INDEX IF NOT EXISTS idx_pag_mens_comp ON pagamentos_mensalidade(competencia)",
    ]
    # Uma única conexão com autocommit — muito mais rápido do que uma transação por statement
    import psycopg as _psycopg
    with _psycopg.connect(db.dsn, autocommit=True) as conn:
        for s in stmts:
            try:
                conn.execute(s)
            except Exception as exc:
                print(f"[schema] aviso ({s[:60]!r}): {exc}")


@asynccontextmanager
async def lifespan(app_: FastAPI):
    import asyncio

    db = get_database()

    async def _init_db_background():
        loop = asyncio.get_running_loop()
        try:
            await loop.run_in_executor(None, db.open)
            await loop.run_in_executor(None, _ensure_schema, db)
            print("[startup] banco inicializado com sucesso")
        except Exception as exc:
            print(f"[startup] erro DB: {exc}")

    # Inicia DB em segundo plano — app responde imediatamente
    asyncio.create_task(_init_db_background())

    # Inicia o scheduler de tarefas diárias
    try:
        scheduler = get_scheduler()
        birthday_svc = get_birthday_service()
        loja_id_default = int(os.getenv('DEFAULT_LOJA_ID', '1'))
        scheduler.add_daily(
            hora='08:00',
            func=lambda: birthday_svc.notificar_hoje(loja_id_default),
            label='Aniversários do dia',
        )
        scheduler.start()
    except Exception as exc:
        print(f"[startup] aviso no scheduler: {exc}")
        scheduler = None

    yield

    if scheduler:
        try:
            scheduler.stop()
        except Exception:
            pass
    try:
        db.close()
    except Exception:
        pass


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
    return {"status": "ok", "versao": "agenda-local-v3"}


@app.get("/health/db")
def health_db(db=Depends(get_database)):
    try:
        with db.transaction() as tx:
            tx.fetch_one("SELECT 1 AS ok", [])
        return {"status": "ok", "db": "conectado"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Banco indisponível: {exc}")


class SetupAdminInput(BaseModel):
    nome: str
    email: str
    senha: str


@app.post("/setup/admin", status_code=201)
def setup_admin(payload: SetupAdminInput, db=Depends(get_database)):
    """Cria o primeiro administrador. Bloqueado se já existir qualquer usuário."""
    with db.transaction() as tx:
        total = tx.fetch_one("SELECT COUNT(*) AS n FROM usuarios WHERE deleted_at IS NULL", [])
        if total and total["n"] > 0:
            raise HTTPException(status_code=403, detail="Sistema já inicializado. Use o login normal.")
        cargo = tx.fetch_one("SELECT id FROM cargos WHERE nome = 'admin_principal'", [])
        if not cargo:
            raise HTTPException(status_code=503, detail="Banco ainda inicializando. Aguarde 30s e tente novamente.")
        from backend_services.auth_service import AuthService as _Auth
        tx.execute(
            """INSERT INTO usuarios (nome, email, senha_hash, cargo_id, ativo, email_confirmado)
               VALUES (%s, %s, %s, %s, TRUE, TRUE)""",
            [payload.nome, payload.email, _Auth.hash_password(payload.senha), cargo["id"]],
        )
    return {"status": "admin_criado", "email": payload.email}


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
        loja = None
        if actor.loja_id:
            loja = tx.fetch_one(
                "SELECT nome, tipo, numero, complexo_id FROM lojas WHERE id=%s AND deleted_at IS NULL",
                (actor.loja_id,),
            )
    return {
        "user_id":   actor.user_id,
        "loja_id":   actor.loja_id,
        "cargo":     actor.cargo,
        "nome":      user["nome"]  if user else None,
        "email":     user["email"] if user else None,
        "loja_nome": loja["nome"]  if loja else None,
        "loja_tipo": loja["tipo"]  if loja else None,
        "loja_numero": loja["numero"] if loja else None,
        "loja_complexo_id": loja["complexo_id"] if loja else None,
        "tenant_id":     actor.tenant_id,
        "tenant_status": actor.tenant_status,
    }


# ═══════════════════════════════════════════════════════════
#  LOJAS & COMPLEXOS
# ═══════════════════════════════════════════════════════════

class LojaInput(BaseModel):
    nome: str
    numero: Optional[str] = None
    tipo: str = "loja"
    complexo_id: Optional[int] = None
    tenant_id: Optional[int] = None
    status: str = "ativa"
    cidade: Optional[str] = None
    potencia: Optional[str] = None
    endereco: Optional[str] = None
    telefone_whatsapp: Optional[str] = None

class LojaUpdateInput(BaseModel):
    nome: Optional[str] = None
    numero: Optional[str] = None
    tipo: Optional[str] = None
    complexo_id: Optional[int] = None
    tenant_id: Optional[int] = None
    status: Optional[str] = None
    cidade: Optional[str] = None
    potencia: Optional[str] = None
    endereco: Optional[str] = None
    telefone_whatsapp: Optional[str] = None
    limpar_complexo: bool = False
    limpar_tenant: bool = False

class VincularLojaInput(BaseModel):
    loja_id: Optional[int] = None
    cargo: Optional[str] = None


@app.get("/lojas")
def listar_lojas(
    tipo: Optional[str] = Query(None),
    complexo_id: Optional[int] = Query(None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        conds, params = ["l.deleted_at IS NULL"], []
        if actor.cargo != "admin_principal" and actor.loja_id:
            loja = tx.fetch_one(
                "SELECT tipo, complexo_id FROM lojas WHERE id=%s AND deleted_at IS NULL",
                (actor.loja_id,),
            )
            if loja:
                cid = actor.loja_id if loja["tipo"] == "complexo" else loja["complexo_id"]
                if cid:
                    conds.append("(l.id=%s OR l.complexo_id=%s)"); params.extend([cid, cid])
        if tipo:
            conds.append("l.tipo=%s"); params.append(tipo)
        if complexo_id:
            conds.append("(l.id=%s OR l.complexo_id=%s)"); params.extend([complexo_id, complexo_id])
        where = " AND ".join(conds)
        rows = tx.fetch_all(
            f"""SELECT l.id, l.nome, l.numero, l.tipo, l.status, l.cidade,
                       l.potencia, l.endereco, l.telefone_whatsapp, l.complexo_id,
                       l.tenant_id, l.created_at,
                       lc.nome AS complexo_nome,
                       t.nome  AS tenant_nome,
                       t.status AS tenant_status,
                       COUNT(DISTINCT i.id) AS total_irmaos
                FROM lojas l
                LEFT JOIN lojas lc ON lc.id = l.complexo_id
                LEFT JOIN tenants t ON t.id = l.tenant_id
                LEFT JOIN irmaos i ON i.loja_id = l.id AND i.deleted_at IS NULL
                WHERE {where}
                GROUP BY l.id, lc.nome, t.nome, t.status
                ORDER BY l.tipo DESC, l.nome""",
            params,
        )
    return [dict(r) for r in rows]


@app.post("/lojas", status_code=201)
def criar_loja(
    payload: LojaInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Apenas admin pode criar lojas.")
    if payload.tipo not in ("loja", "complexo"):
        raise HTTPException(status_code=422, detail="tipo deve ser 'loja' ou 'complexo'.")
    with db.transaction() as tx:
        row = tx.fetch_one(
            """INSERT INTO lojas
               (nome, numero, tipo, complexo_id, tenant_id, status, cidade, potencia, endereco, telefone_whatsapp)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (payload.nome, payload.numero, payload.tipo, payload.complexo_id,
             payload.tenant_id, payload.status, payload.cidade, payload.potencia,
             payload.endereco, payload.telefone_whatsapp),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar loja.")
    return {"id": row["id"], "status": "created"}


@app.put("/lojas/{loja_id}")
def atualizar_loja(
    loja_id: int,
    payload: LojaUpdateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Apenas admin pode editar lojas.")
    with db.transaction() as tx:
        if not tx.fetch_one("SELECT id FROM lojas WHERE id=%s AND deleted_at IS NULL", (loja_id,)):
            raise HTTPException(status_code=404, detail="Loja não encontrada.")
        sets, params = [], []
        if payload.nome      is not None: sets.append("nome=%s");              params.append(payload.nome)
        if payload.numero    is not None: sets.append("numero=%s");            params.append(payload.numero)
        if payload.tipo      is not None: sets.append("tipo=%s");              params.append(payload.tipo)
        if payload.status    is not None: sets.append("status=%s");            params.append(payload.status)
        if payload.cidade    is not None: sets.append("cidade=%s");            params.append(payload.cidade)
        if payload.potencia  is not None: sets.append("potencia=%s");          params.append(payload.potencia)
        if payload.endereco  is not None: sets.append("endereco=%s");          params.append(payload.endereco)
        if payload.telefone_whatsapp is not None:
            sets.append("telefone_whatsapp=%s"); params.append(payload.telefone_whatsapp)
        if payload.limpar_complexo:
            sets.append("complexo_id=NULL")
        elif payload.complexo_id is not None:
            sets.append("complexo_id=%s"); params.append(payload.complexo_id)
        if payload.limpar_tenant:
            sets.append("tenant_id=NULL")
        elif payload.tenant_id is not None:
            sets.append("tenant_id=%s"); params.append(payload.tenant_id)
        if sets:
            sets.append("updated_at=NOW()")
            params.append(loja_id)
            tx.execute(f"UPDATE lojas SET {', '.join(sets)} WHERE id=%s", params)
    return {"status": "updated"}


@app.delete("/lojas/{loja_id}", status_code=204)
def deletar_loja(
    loja_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Apenas admin pode excluir lojas.")
    with db.transaction() as tx:
        if not tx.fetch_one("SELECT id FROM lojas WHERE id=%s AND deleted_at IS NULL", (loja_id,)):
            raise HTTPException(status_code=404, detail="Loja não encontrada.")
        tx.execute("UPDATE lojas SET deleted_at=NOW() WHERE id=%s", (loja_id,))


@app.put("/usuarios/{usuario_id}/loja")
def vincular_usuario_loja(
    usuario_id: int,
    payload: VincularLojaInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Apenas admin pode vincular usuários a lojas.")
    with db.transaction() as tx:
        if not tx.fetch_one("SELECT id FROM usuarios WHERE id=%s AND deleted_at IS NULL", (usuario_id,)):
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        sets, params = [], []
        if payload.loja_id is not None:
            sets.append("loja_id=%s"); params.append(payload.loja_id if payload.loja_id > 0 else None)
        if payload.cargo:
            cargo_row = tx.fetch_one("SELECT id FROM cargos WHERE nome=%s", (payload.cargo,))
            if not cargo_row:
                raise HTTPException(status_code=404, detail=f"Cargo '{payload.cargo}' não encontrado.")
            sets.append("cargo_id=%s"); params.append(cargo_row["id"])
        if sets:
            sets.append("updated_at=NOW()")
            params.append(usuario_id)
            tx.execute(f"UPDATE usuarios SET {', '.join(sets)} WHERE id=%s", params)
    return {"status": "updated"}


@app.get("/complexo/dashboard")
def complexo_dashboard(
    cid: Optional[int] = Query(None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        if cid and actor.cargo == "admin_principal":
            complexo_id = cid
        elif actor.loja_id:
            loja = tx.fetch_one(
                "SELECT tipo, complexo_id FROM lojas WHERE id=%s AND deleted_at IS NULL",
                (actor.loja_id,),
            )
            if loja and loja["tipo"] == "complexo":
                complexo_id = actor.loja_id
            elif loja and loja["complexo_id"]:
                complexo_id = loja["complexo_id"]
            else:
                raise HTTPException(status_code=403, detail="Loja não vinculada a um complexo.")
        elif actor.cargo == "admin_principal":
            first = tx.fetch_one(
                "SELECT id FROM lojas WHERE tipo='complexo' AND deleted_at IS NULL ORDER BY created_at LIMIT 1",
                [],
            )
            complexo_id = first["id"] if first else None
        else:
            raise HTTPException(status_code=403, detail="Sem acesso ao dashboard do complexo.")

        if not complexo_id:
            return {"complexo": None, "lojas": [], "proximas_sessoes": [], "stats": {}}

        lojas = tx.fetch_all(
            """SELECT l.id, l.nome, l.numero, l.tipo, l.status, l.cidade, l.potencia,
                      COUNT(DISTINCT i.id) AS total_irmaos
               FROM lojas l
               LEFT JOIN irmaos i ON i.loja_id = l.id AND i.deleted_at IS NULL
               WHERE (l.id=%s OR l.complexo_id=%s) AND l.deleted_at IS NULL
               GROUP BY l.id ORDER BY l.tipo DESC, l.nome""",
            (complexo_id, complexo_id),
        )
        loja_ids = [l["id"] for l in lojas]

        proximas: list = []
        if loja_ids:
            proximas = tx.fetch_all(
                """SELECT ae.id, ae.titulo, ae.data::text AS data,
                          ae.hora_inicio::text AS hora_inicio,
                          l.nome AS loja_nome, l.numero AS loja_numero
                   FROM agenda_eventos ae
                   JOIN lojas l ON l.id = ae.loja_id
                   WHERE ae.loja_id = ANY(%s)
                     AND ae.data >= CURRENT_DATE
                     AND ae.data <= CURRENT_DATE + INTERVAL '60 days'
                   ORDER BY ae.data, ae.hora_inicio LIMIT 30""",
                (loja_ids,),
            )

        complexo = tx.fetch_one(
            "SELECT id, nome, numero, status, cidade FROM lojas WHERE id=%s",
            (complexo_id,),
        )
        stats = {
            "total_lojas_filhas": len([l for l in lojas if l["id"] != complexo_id]),
            "total_irmaos": sum(l["total_irmaos"] for l in lojas),
            "proximas_sessoes": len(proximas),
        }

    return {
        "complexo": dict(complexo) if complexo else None,
        "lojas": [dict(l) for l in lojas],
        "proximas_sessoes": [dict(s) for s in proximas],
        "stats": stats,
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


@app.get("/contracts")
def list_contracts(actor: Actor = Depends(get_current_actor), db=Depends(get_database)):
    with db.transaction() as tx:
        if actor.cargo == 'admin_principal':
            filtro, params = "", []
        else:
            filtro, params = "AND c.loja_id = %s", [actor.loja_id]
        rows = tx.fetch_all(
            f"""
            SELECT c.id, c.loja_id,
                   COALESCE(l.nome, 'Loja ' || c.loja_id) AS loja_nome,
                   c.vigencia_inicio, c.vigencia_fim, c.status, c.arquivo_url,
                   EXISTS(
                       SELECT 1 FROM cobrancas cb
                       WHERE cb.loja_id = c.loja_id
                         AND cb.status = 'pendente'
                         AND cb.data_vencimento < CURRENT_DATE
                         AND cb.deleted_at IS NULL
                   ) AS inadimplente
            FROM contratos c
            LEFT JOIN lojas l ON l.id = c.loja_id
            WHERE c.deleted_at IS NULL {filtro}
            ORDER BY l.nome, c.vigencia_inicio DESC
            """,
            params,
        )
    return [dict(r) for r in rows]


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
        raise HTTPException(status_code=500, detail=f"Erro ao criar conta: {exc}") from exc
    email_cfg = get_registration_service().email.configurado()
    if email_cfg:
        return {"status": "confirmation_sent"}
    return {"status": "active", "aviso": "E-mail não configurado. Conta ativa imediatamente."}


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
#  GESTÃO DE USUÁRIOS (admin)
# ═══════════════════════════════════════════════════════════

@app.get("/usuarios")
def listar_usuarios(
    loja_id: Optional[int] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        cond = "WHERE u.deleted_at IS NULL"
        params: list = []
        if loja_id:
            cond += " AND u.loja_id=%s"; params.append(loja_id)
        return tx.fetch_all(
            f"""SELECT u.id, u.nome, u.email, u.ativo, u.email_confirmado,
                       u.loja_id, c.nome AS cargo, u.created_at
                FROM usuarios u
                JOIN cargos c ON c.id = u.cargo_id
                {cond} ORDER BY u.nome""",
            params,
        )


@app.put("/usuarios/{usuario_id}/ativar")
def ativar_usuario(
    usuario_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            "UPDATE usuarios SET ativo=TRUE, email_confirmado=TRUE, confirmacao_token=NULL WHERE id=%s",
            (usuario_id,),
        )
    return {"status": "activated"}


@app.delete("/usuarios/{usuario_id}", status_code=204)
def excluir_usuario(
    usuario_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            "UPDATE usuarios SET deleted_at=NOW(), ativo=FALSE WHERE id=%s",
            (usuario_id,),
        )


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
    cargo_loja: Optional[str] = None


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
    db=Depends(get_database),
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
    if payload.cargo_loja:
        with db.transaction() as tx:
            tx.execute("UPDATE irmaos SET cargo_loja=%s WHERE id=%s", (payload.cargo_loja, irmao_id))
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
#  MENSALIDADES — STATUS E PAGAMENTOS
# ═══════════════════════════════════════════════════════════

class DefinirMensalidadeInput(BaseModel):
    categoria: str = "regular"
    valor: Decimal
    vigencia_inicio: str
    vigencia_fim: Optional[str] = None
    observacao: Optional[str] = None


@app.post("/irmaos/{irmao_id}/mensalidade", status_code=201)
def definir_mensalidade(
    irmao_id: int,
    payload: DefinirMensalidadeInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        irmao = tx.fetch_one(
            "SELECT loja_id FROM irmaos WHERE id=%s AND deleted_at IS NULL",
            (irmao_id,),
        )
        if not irmao:
            raise HTTPException(status_code=404, detail="Irmão não encontrado.")
        if actor.cargo not in ("admin_principal", "financeiro", "secretario", "veneravel_mestre") \
                and irmao["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem permissão.")
        tx.execute(
            """INSERT INTO regras_mensalidade
               (irmao_id, categoria, valor, vigencia_inicio, vigencia_fim, observacao)
               VALUES (%s,%s,%s,%s,%s,%s)""",
            (irmao_id, payload.categoria, payload.valor,
             payload.vigencia_inicio, payload.vigencia_fim or None,
             payload.observacao or None),
        )
    return {"status": "created"}


class PagarMensalidadeInput(BaseModel):
    loja_id: int
    irmao_id: int
    competencia: str          # YYYY-MM
    valor: Optional[Decimal] = None
    forma_pagamento: Optional[str] = None
    observacao: Optional[str] = None


@app.get("/mensalidades/status")
def status_mensalidades(
    loja_id: int = Query(...),
    competencia: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    import datetime as _dt
    comp = competencia or _dt.date.today().strftime("%Y-%m")
    with db.transaction() as tx:
        rows = tx.fetch_all(
            """SELECT i.id, i.nome, i.cim, i.cargo_loja,
                      rm.categoria, rm.valor,
                      pm.id       AS pagamento_id,
                      pm.pago_em,
                      pm.forma_pagamento,
                      pm.valor    AS valor_pago
               FROM irmaos i
               LEFT JOIN regras_mensalidade rm
                      ON rm.irmao_id = i.id
                     AND rm.vigencia_inicio <= CURRENT_DATE
                     AND (rm.vigencia_fim IS NULL OR rm.vigencia_fim >= CURRENT_DATE)
               LEFT JOIN pagamentos_mensalidade pm
                      ON pm.irmao_id = i.id AND pm.competencia = %s
               WHERE i.loja_id = %s
                 AND i.deleted_at IS NULL
                 AND i.status = 'ativo'
               ORDER BY i.nome""",
            (comp, loja_id),
        )
    return [dict(r) for r in rows]


@app.post("/mensalidades/pagar", status_code=201)
def registrar_pagamento(
    payload: PagarMensalidadeInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if not _re.match(r"^\d{4}-\d{2}$", payload.competencia):
        raise HTTPException(status_code=422, detail="competencia deve ser YYYY-MM.")
    with db.transaction() as tx:
        irmao = tx.fetch_one(
            "SELECT id, loja_id FROM irmaos WHERE id=%s AND deleted_at IS NULL",
            (payload.irmao_id,),
        )
        if not irmao:
            raise HTTPException(status_code=404, detail="Irmão não encontrado.")
        if actor.cargo != "admin_principal" and irmao["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem acesso a este irmão.")
        # Resolve valor: usa o informado ou busca da regra vigente
        valor = payload.valor
        if valor is None:
            regra = tx.fetch_one(
                """SELECT valor FROM regras_mensalidade
                   WHERE irmao_id=%s AND vigencia_inicio <= CURRENT_DATE
                     AND (vigencia_fim IS NULL OR vigencia_fim >= CURRENT_DATE)
                   ORDER BY vigencia_inicio DESC LIMIT 1""",
                (payload.irmao_id,),
            )
            valor = regra["valor"] if regra else Decimal("0")
        existente = tx.fetch_one(
            "SELECT id FROM pagamentos_mensalidade WHERE irmao_id=%s AND competencia=%s",
            (payload.irmao_id, payload.competencia),
        )
        if existente:
            raise HTTPException(status_code=409, detail="Pagamento já registrado para esta competência.")
        row = tx.fetch_one(
            """INSERT INTO pagamentos_mensalidade
               (loja_id, irmao_id, competencia, valor, forma_pagamento, observacao, registrado_por)
               VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (payload.loja_id, payload.irmao_id, payload.competencia,
             valor, payload.forma_pagamento, payload.observacao, actor.user_id),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao registrar pagamento.")
    return {"id": row["id"], "status": "created"}


@app.delete("/mensalidades/pagar/{pagamento_id}", status_code=204)
def cancelar_pagamento(
    pagamento_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        p = tx.fetch_one(
            "SELECT id, loja_id FROM pagamentos_mensalidade WHERE id=%s",
            (pagamento_id,),
        )
        if not p:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado.")
        if actor.cargo != "admin_principal" and p["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem acesso a este pagamento.")
        tx.execute("DELETE FROM pagamentos_mensalidade WHERE id=%s", (pagamento_id,))


@app.get("/mensalidades/historico/{irmao_id}")
def historico_pagamentos(
    irmao_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        irmao = tx.fetch_one("SELECT loja_id FROM irmaos WHERE id=%s AND deleted_at IS NULL", (irmao_id,))
        if not irmao:
            raise HTTPException(status_code=404, detail="Irmão não encontrado.")
        if actor.cargo != "admin_principal" and irmao["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem acesso.")
        rows = tx.fetch_all(
            """SELECT * FROM pagamentos_mensalidade WHERE irmao_id=%s ORDER BY competencia DESC""",
            (irmao_id,),
        )
    return [dict(r) for r in rows]


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


# ═══════════════════════════════════════════════════════════
#  AGENDA LOCAL (SESSÕES RECORRENTES + EVENTOS AVULSOS)
# ═══════════════════════════════════════════════════════════

class SessaoInput(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str = "sessao"
    frequencia: str
    dia_semana: Optional[int] = None
    semana_mes: Optional[int] = None
    dia_mes: Optional[int] = None
    hora_inicio: str
    hora_fim: str
    cor: str = "#2563eb"
    vigencia_inicio: Optional[str] = None
    vigencia_fim: Optional[str] = None
    ativo: bool = True


class EventoLocalInput(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str = "evento"
    data: str
    hora_inicio: str
    hora_fim: str
    local: Optional[str] = None
    cor: str = "#7c3aed"


@app.get("/agenda/mes")
def agenda_mes(
    loja_id: int = Query(...),
    ano: int = Query(...),
    mes: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
):
    return svc.mes(loja_id, ano, mes)


@app.get("/agenda/sessoes")
def listar_sessoes(
    loja_id: int = Query(...),
    apenas_ativas: bool = Query(default=True),
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
):
    return svc.listar_sessoes(loja_id, apenas_ativas)


@app.post("/agenda/sessoes", status_code=201)
def criar_sessao(
    loja_id: int = Query(...),
    payload: SessaoInput = ...,
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
    db=Depends(get_database),
):
    sid = svc.criar_sessao(loja_id, payload.model_dump())
    if payload.tipo == 'agape':
        _notificar_agape(db, loja_id, payload.titulo, None)
    return {"id": sid}


@app.put("/agenda/sessoes/{sessao_id}")
def atualizar_sessao(
    sessao_id: int,
    payload: SessaoInput,
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
):
    svc.atualizar_sessao(sessao_id, payload.model_dump())
    return {"status": "updated"}


@app.delete("/agenda/sessoes/{sessao_id}")
def deletar_sessao(
    sessao_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
):
    svc.deletar_sessao(sessao_id)
    return {"status": "deleted"}


@app.post("/agenda/eventos-locais", status_code=201)
def criar_evento_local(
    loja_id: int = Query(...),
    payload: EventoLocalInput = ...,
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
    db=Depends(get_database),
):
    eid = svc.criar_evento(loja_id, payload.model_dump(), actor.user_id)
    if payload.tipo == 'agape':
        _notificar_agape(db, loja_id, payload.titulo, payload.data)
    return {"id": eid}


@app.delete("/agenda/eventos-locais/{evento_id}")
def deletar_evento_local(
    evento_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: AgendaService = Depends(get_agenda_service),
):
    svc.deletar_evento(evento_id)
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
        try:
            Path(fpath).write_bytes(content)
        except Exception:
            fpath = None
        svc.adicionar_arquivo(compra_id, tipo, fpath, arq.filename, len(content), sha, content)
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


@app.delete("/compras/{compra_id}/arquivo/{arquivo_id}", status_code=204)
def excluir_arquivo_compra(
    compra_id: int,
    arquivo_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        row = tx.fetch_one(
            "SELECT caminho FROM compras_arquivos WHERE id=%s AND compra_id=%s",
            (arquivo_id, compra_id),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
        tx.execute("DELETE FROM compras_arquivos WHERE id=%s", (arquivo_id,))
    if row.get("caminho"):
        import pathlib
        p = pathlib.Path(row["caminho"])
        if p.exists():
            p.unlink(missing_ok=True)


@app.delete("/compras/{compra_id}", status_code=204)
def excluir_compra(
    compra_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.cargo not in ("admin_principal", "veneravel_mestre"):
        raise HTTPException(status_code=403, detail="Sem permissão para excluir compras.")
    with db.transaction() as tx:
        compra = tx.fetch_one("SELECT id, loja_id FROM compras WHERE id=%s AND deleted_at IS NULL", (compra_id,))
        if not compra:
            raise HTTPException(status_code=404, detail="Compra não encontrada.")
        if actor.loja_id is not None and compra["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem permissão para excluir esta compra.")
        arquivos = tx.fetch_all(
            "SELECT caminho FROM compras_arquivos WHERE compra_id=%s", (compra_id,)
        )
        tx.execute("DELETE FROM compras_arquivos WHERE compra_id=%s", (compra_id,))
        tx.execute("UPDATE compras SET deleted_at=NOW() WHERE id=%s", (compra_id,))
    import pathlib
    for arq in arquivos:
        if arq.get("caminho"):
            try:
                pathlib.Path(arq["caminho"]).unlink(missing_ok=True)
            except Exception:
                pass

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


# ═══════════════════════════════════════════════════════════
#  PERMISSÕES POR CARGO
# ═══════════════════════════════════════════════════════════

class SalvarPermissaoInput(BaseModel):
    cargo: str
    recurso: str
    acoes: list[str]

@app.get("/permissoes")
def listar_permissoes(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    svc: PermissoesService = Depends(get_permissoes_service),
):
    return {
        "permissoes": svc.listar(loja_id),
        "recursos":   svc.listar_recursos(),
    }

@app.put("/permissoes")
def salvar_permissao(
    loja_id: int = Query(...),
    payload: SalvarPermissaoInput = ...,
    actor: Actor = Depends(get_current_actor),
    svc: PermissoesService = Depends(get_permissoes_service),
):
    svc.salvar(loja_id, payload.cargo, payload.recurso, payload.acoes)
    return {"status": "saved"}


# ═══════════════════════════════════════════════════════════
#  COMISSÕES
# ═══════════════════════════════════════════════════════════

class ComissaoInput(BaseModel):
    loja_id: int
    nome: str
    descricao: Optional[str] = None

class ComissaoUpdateInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class MembroInput(BaseModel):
    irmao_id: int
    funcao: Optional[str] = None
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None

class AtribuirCargoInput(BaseModel):
    irmao_id: int
    cargo: str

@app.post("/comissoes", status_code=201)
def criar_comissao(
    payload: ComissaoInput,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    cid = svc.criar_comissao(payload.loja_id, payload.nome, payload.descricao)
    return {"id": cid}

@app.get("/comissoes")
def listar_comissoes(
    loja_id: int = Query(...),
    apenas_ativas: bool = Query(default=True),
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    return svc.listar_comissoes(loja_id, apenas_ativas)

@app.put("/comissoes/{comissao_id}")
def atualizar_comissao(
    comissao_id: int,
    payload: ComissaoUpdateInput,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    svc.atualizar_comissao(comissao_id, payload.nome, payload.descricao, payload.ativo)
    return {"status": "updated"}

@app.delete("/comissoes/{comissao_id}")
def deletar_comissao(
    comissao_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    svc.deletar_comissao(comissao_id)
    return {"status": "deleted"}

@app.post("/comissoes/{comissao_id}/membros", status_code=201)
def adicionar_membro(
    comissao_id: int,
    payload: MembroInput,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    svc.adicionar_membro(comissao_id, payload.irmao_id, payload.funcao,
                         payload.data_inicio, payload.data_fim)
    return {"status": "added"}

@app.delete("/comissoes/{comissao_id}/membros/{irmao_id}")
def remover_membro(
    comissao_id: int,
    irmao_id: int,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    svc.remover_membro(comissao_id, irmao_id)
    return {"status": "removed"}

@app.get("/irmaos/cargos")
def listar_irmaos_cargos(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    return svc.listar_irmaos_com_cargos(loja_id)

@app.put("/irmaos/cargos")
def atribuir_cargo_irmao(
    loja_id: int = Query(...),
    payload: AtribuirCargoInput = ...,
    actor: Actor = Depends(get_current_actor),
    svc: ComissoesService = Depends(get_comissoes_service),
):
    try:
        svc.atribuir_cargo(payload.irmao_id, payload.cargo, loja_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "updated"}


@app.get("/irmaos/{irmao_id}")
def obter_irmao(
    irmao_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        irmao = tx.fetch_one(
            """SELECT i.*, cg.nome AS cargo, u.email AS usuario_email
               FROM irmaos i
               LEFT JOIN usuarios u ON u.id = i.usuario_id
               LEFT JOIN cargos cg ON cg.id = u.cargo_id
               WHERE i.id = %s""",
            (irmao_id,),
        )
        if not irmao:
            raise HTTPException(status_code=404, detail="Irmão não encontrado.")
        filhos = tx.fetch_all(
            "SELECT * FROM irmaos_filhos WHERE irmao_id = %s ORDER BY nome",
            (irmao_id,),
        )
        mensalidade = tx.fetch_one(
            """SELECT * FROM regras_mensalidade WHERE irmao_id = %s
               ORDER BY vigencia_inicio DESC LIMIT 1""",
            (irmao_id,),
        )
        comissoes = tx.fetch_all(
            """SELECT c.id, c.nome, cm.funcao, cm.data_inicio, cm.data_fim
               FROM comissoes_membros cm
               JOIN comissoes c ON c.id = cm.comissao_id
               WHERE cm.irmao_id = %s AND cm.ativo = TRUE AND c.ativo = TRUE
               ORDER BY c.nome""",
            (irmao_id,),
        )
    return {
        **dict(irmao),
        "filhos": list(filhos),
        "mensalidade": dict(mensalidade) if mensalidade else None,
        "comissoes": list(comissoes),
    }


@app.put("/irmaos/{irmao_id}")
def atualizar_irmao(
    irmao_id: int,
    payload: CreateIrmaoInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            """UPDATE irmaos SET nome=%s, telefone=%s, cim=%s, potencia=%s,
               data_nascimento=%s, nome_esposa=%s, data_nascimento_esposa=%s,
               cargo_loja=%s
               WHERE id=%s""",
            (payload.nome, payload.telefone, payload.cim, payload.potencia,
             payload.data_nascimento, payload.nome_esposa, payload.data_nascimento_esposa,
             payload.cargo_loja or None, irmao_id),
        )
        if payload.filhos:
            tx.execute("DELETE FROM irmaos_filhos WHERE irmao_id=%s", (irmao_id,))
            for f in payload.filhos:
                tx.execute(
                    "INSERT INTO irmaos_filhos (irmao_id, nome, data_nascimento) VALUES (%s,%s,%s)",
                    (irmao_id, f.nome, f.data_nascimento),
                )
    return {"status": "updated"}


@app.delete("/irmaos/{irmao_id}", status_code=204)
def excluir_irmao(
    irmao_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        if actor.loja_id is not None:
            row = tx.fetch_one(
                "SELECT id FROM irmaos WHERE id=%s AND loja_id=%s AND deleted_at IS NULL",
                (irmao_id, actor.loja_id),
            )
        else:
            row = tx.fetch_one(
                "SELECT id FROM irmaos WHERE id=%s AND deleted_at IS NULL",
                (irmao_id,),
            )
        if not row:
            raise HTTPException(status_code=404, detail="Irmão não encontrado.")
        tx.execute("UPDATE irmaos SET deleted_at=NOW() WHERE id=%s", (irmao_id,))


# ═══════════════════════════════════════════════════════════
#  REPOSITÓRIO DE ARQUIVOS
# ═══════════════════════════════════════════════════════════

@app.get("/repositorio")
def listar_repositorio(
    loja_id: int = Query(...),
    contexto: Optional[str] = Query(default=None),
    data_inicio: Optional[str] = Query(default=None),
    data_fim: Optional[str] = Query(default=None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    filters_comp = ["c.loja_id = %s"]
    filters_repo = ["r.loja_id = %s"]
    params_comp: list = [loja_id]
    params_repo: list = [loja_id]

    if data_inicio:
        filters_comp.append("ca.criado_em >= %s"); params_comp.append(data_inicio)
        filters_repo.append("r.criado_em >= %s");  params_repo.append(data_inicio)
    if data_fim:
        filters_comp.append("ca.criado_em <= %s"); params_comp.append(data_fim)
        filters_repo.append("r.criado_em <= %s");  params_repo.append(data_fim)

    wc = " AND ".join(filters_comp)
    wr = " AND ".join(filters_repo)

    with db.transaction() as tx:
        compras_arqs = tx.fetch_all(
            f"""SELECT ca.id, 'compra' AS contexto, c.id AS contexto_id,
                       c.evento AS descricao, u.nome AS enviado_por,
                       ca.tipo, ca.nome_original, ca.tamanho_bytes, ca.criado_em,
                       ca.caminho IS NOT NULL AS disponivel
                FROM compras_arquivos ca
                JOIN compras c ON c.id = ca.compra_id
                JOIN usuarios u ON u.id = c.usuario_id
                WHERE {wc}
                {'AND ca.tipo = %s' if contexto else ''}
                ORDER BY ca.criado_em DESC""",
            params_comp + ([contexto] if contexto else []),
        )
        repo_arqs = tx.fetch_all(
            f"""SELECT r.id, r.contexto, r.contexto_id,
                       r.descricao, u.nome AS enviado_por,
                       COALESCE(r.mimetype, 'arquivo') AS tipo,
                       r.nome_original, r.tamanho_bytes, r.criado_em,
                       (r.caminho IS NOT NULL OR r.conteudo IS NOT NULL) AS disponivel
                FROM repositorio_arquivos r
                LEFT JOIN usuarios u ON u.id = r.usuario_id
                WHERE {wr}
                ORDER BY r.criado_em DESC""",
            params_repo,
        )

    # Merge and sort
    todos = list(compras_arqs) + list(repo_arqs)
    todos.sort(key=lambda x: x["criado_em"] or "", reverse=True)

    # Build download URLs
    for item in todos:
        if item["disponivel"]:
            if item["contexto"] == "compra":
                item["download_url"] = f"/compras/{item['contexto_id']}/arquivo/{item['id']}"
            else:
                item["download_url"] = f"/repositorio/{item['id']}/download"
        else:
            item["download_url"] = None

    return todos


@app.get("/repositorio/{arquivo_id}/download")
def download_repositorio(
    arquivo_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    import io
    from fastapi.responses import StreamingResponse
    with db.transaction() as tx:
        row = tx.fetch_one(
            "SELECT caminho, nome_original, mimetype, conteudo FROM repositorio_arquivos WHERE id=%s",
            (arquivo_id,),
        )
    if not row:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    mime = row["mimetype"] or "application/octet-stream"
    nome = row["nome_original"] or "arquivo"
    if row["caminho"] and os.path.exists(row["caminho"]):
        data = open(row["caminho"], "rb").read()
    elif row["conteudo"]:
        data = bytes(row["conteudo"])
    else:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return StreamingResponse(
        io.BytesIO(data), media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{nome}"'},
    )


def _extrair_texto(content: bytes, filename: str, mimetype: str) -> str:
    """Extrai texto do arquivo para análise semântica."""
    nome_lower = (filename or '').lower()
    mime_lower = (mimetype or '').lower()
    try:
        if 'text' in mime_lower or nome_lower.endswith('.txt') or nome_lower.endswith('.csv'):
            return content.decode('utf-8', errors='ignore')[:3000]
        if 'pdf' in mime_lower or nome_lower.endswith('.pdf'):
            import io as _io
            import pypdf
            reader = pypdf.PdfReader(_io.BytesIO(content))
            texto = ' '.join(p.extract_text() or '' for p in reader.pages[:5])
            return texto[:3000]
    except Exception:
        pass
    return ''

_PALAVRAS_COMPROVANTE = [
    'total', 'valor', 'subtotal', 'nota fiscal', 'nf-e', 'cnpj',
    'pagamento', 'comprovante', 'recibo', 'cupom', 'venda', 'r$',
    'produto', 'item', 'quantidade', 'preço',
]

def _sugere_reembolso(texto: str) -> bool:
    t = texto.lower()
    hits = sum(1 for p in _PALAVRAS_COMPROVANTE if p in t)
    return hits >= 3


@app.post("/repositorio/upload", status_code=201)
async def upload_repositorio(
    loja_id: int = Form(...),
    descricao: str = Form(...),
    contexto: str = Form(default="geral"),
    arquivos: list[UploadFile] = File(...),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    import hashlib, uuid
    from pathlib import Path
    base = os.getenv("STORAGE_DIR", str(Path(__file__).parent.parent / "storage_uploads"))
    salvos = []
    for arq in arquivos:
        content = await arq.read()
        sha = hashlib.sha256(content).hexdigest()
        ext = Path(arq.filename or "arquivo").suffix or ".bin"
        fname = f"{uuid.uuid4().hex}{ext}"
        fdir = Path(base) / str(loja_id) / "repositorio"
        fdir.mkdir(parents=True, exist_ok=True)
        fpath = str(fdir / fname)
        try:
            Path(fpath).write_bytes(content)
        except Exception:
            fpath = None
        with db.transaction() as tx:
            row = tx.fetch_one(
                """INSERT INTO repositorio_arquivos
                   (loja_id, usuario_id, contexto, descricao, caminho, nome_original,
                    mimetype, tamanho_bytes, sha256, conteudo)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (loja_id, actor.user_id, contexto, descricao, fpath,
                 arq.filename, arq.content_type, len(content), sha, content),
            )
        texto = _extrair_texto(content, arq.filename or '', arq.content_type or '')
        sugerir = _sugere_reembolso(texto)
        extrato = texto[:400] if texto else ''
        salvos.append({
            "id": row["id"], "nome": arq.filename,
            "sugere_reembolso": sugerir,
            "texto_extraido": extrato,
        })
    return {"salvos": salvos}


# ═══════════════════════════════════════════════════════════
#  WHATSAPP — controle da instância + webhook do bot
# ═══════════════════════════════════════════════════════════

@app.post("/whatsapp/webhook")
async def whatsapp_webhook(
    request: Request,
    bot: WhatsAppBot = Depends(get_whatsapp_bot),
):
    """Webhook da Evolution API — recebe todas as mensagens."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "error", "detail": "invalid JSON"}

    event = body.get("event", "")

    if event == "messages.upsert":
        data = body.get("data", {})
        key  = data.get("key", {})

        if key.get("fromMe"):
            return {"status": "ignored", "motivo": "fromMe"}

        remote_jid = key.get("remoteJid", "")
        if "@g.us" in remote_jid:
            return {"status": "ignored", "motivo": "grupo"}

        telefone    = remote_jid.split("@")[0]
        message     = data.get("message", {})
        msg_type    = data.get("messageType", "")
        push_name   = data.get("pushName", "")
        loja_id     = int(os.getenv("DEFAULT_LOJA_ID", "1"))

        return bot.processar(loja_id, telefone, msg_type, message, push_name)

    return {"status": "ok", "event": event}


@app.get("/whatsapp/status")
def whatsapp_status(
    actor: Actor = Depends(get_current_actor),
    wpp: WhatsAppService = Depends(get_whatsapp_service),
):
    try:
        return wpp.status()
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@app.get("/whatsapp/qrcode")
def whatsapp_qrcode(
    actor: Actor = Depends(get_current_actor),
    wpp: WhatsAppService = Depends(get_whatsapp_service),
):
    if actor.cargo not in ("admin_principal", "veneravel_mestre"):
        raise HTTPException(status_code=403, detail="Sem permissão.")
    if not wpp.base_url or "localhost" in wpp.base_url:
        raise HTTPException(
            status_code=503,
            detail="EVOLUTION_API_URL não configurada. Adicione a variável no Railway.",
        )
    return wpp.conectar_ou_criar()


@app.post("/whatsapp/conectar")
def whatsapp_conectar(
    actor: Actor = Depends(get_current_actor),
    wpp: WhatsAppService = Depends(get_whatsapp_service),
):
    if actor.cargo not in ("admin_principal", "veneravel_mestre"):
        raise HTTPException(status_code=403, detail="Sem permissão.")
    if not wpp.base_url or "localhost" in wpp.base_url:
        raise HTTPException(
            status_code=503,
            detail="EVOLUTION_API_URL não configurada. Adicione a variável no Railway.",
        )
    return wpp.conectar_ou_criar()


@app.post("/whatsapp/configurar-webhook")
def whatsapp_configurar_webhook(
    actor: Actor = Depends(get_current_actor),
    wpp: WhatsAppService = Depends(get_whatsapp_service),
):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Sem permissão.")
    base = os.getenv("WEBHOOK_URL", "").rstrip("/")
    if not base:
        raise HTTPException(
            status_code=400,
            detail="Variável WEBHOOK_URL não configurada no servidor.",
        )
    try:
        return wpp.configurar_webhook(f"{base}/whatsapp/webhook")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.delete("/whatsapp/desconectar", status_code=200)
def whatsapp_desconectar(
    actor: Actor = Depends(get_current_actor),
    wpp: WhatsAppService = Depends(get_whatsapp_service),
):
    if actor.cargo not in ("admin_principal", "veneravel_mestre"):
        raise HTTPException(status_code=403, detail="Sem permissão.")
    try:
        return wpp.desconectar()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ═══════════════════════════════════════════════════════════
#  REPOSITÓRIO — exclusão
# ═══════════════════════════════════════════════════════════

@app.delete("/repositorio/{arquivo_id}", status_code=204)
def deletar_repositorio(
    arquivo_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        row = tx.fetch_one(
            "SELECT caminho, loja_id FROM repositorio_arquivos WHERE id=%s",
            (arquivo_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
        if actor.loja_id is not None and row["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem permissão para excluir este arquivo.")
        tx.execute("DELETE FROM repositorio_arquivos WHERE id=%s", (arquivo_id,))
    if row.get("caminho"):
        import pathlib
        p = pathlib.Path(row["caminho"])
        if p.exists():
            p.unlink(missing_ok=True)


# ═══════════════════════════════════════════════════════════
#  CATEGORIAS DE MENSALIDADE
# ═══════════════════════════════════════════════════════════

class CategoriaInput(BaseModel):
    loja_id: int
    nome: str
    descricao: Optional[str] = None

class CategoriaUpdateInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

@app.get("/categorias-mensalidade")
def listar_categorias(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        return tx.fetch_all(
            "SELECT * FROM categorias_mensalidade WHERE loja_id=%s ORDER BY nome",
            (loja_id,),
        )

@app.post("/categorias-mensalidade", status_code=201)
def criar_categoria(
    payload: CategoriaInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        row = tx.fetch_one(
            """INSERT INTO categorias_mensalidade (loja_id, nome, descricao)
               VALUES (%s,%s,%s) RETURNING id""",
            (payload.loja_id, payload.nome, payload.descricao),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar categoria.")
    return {"id": row["id"]}

@app.put("/categorias-mensalidade/{cat_id}")
def atualizar_categoria(
    cat_id: int,
    payload: CategoriaUpdateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            "UPDATE categorias_mensalidade SET nome=%s, descricao=%s, ativo=%s WHERE id=%s",
            (payload.nome, payload.descricao, payload.ativo, cat_id),
        )
    return {"status": "updated"}

@app.delete("/categorias-mensalidade/{cat_id}", status_code=204)
def deletar_categoria(
    cat_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        row = tx.fetch_one("SELECT id, loja_id FROM categorias_mensalidade WHERE id=%s", (cat_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Categoria não encontrada.")
        if actor.loja_id is not None and row["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem permissão para excluir esta categoria.")
        tx.execute("DELETE FROM categorias_mensalidade WHERE id=%s", (cat_id,))


# ═══════════════════════════════════════════════════════════
#  INVENTÁRIO DA LOJA
# ═══════════════════════════════════════════════════════════

class InventarioInput(BaseModel):
    loja_id: int
    nome: str
    descricao: Optional[str] = None
    quantidade: int = 1
    condicao: str = "bom"
    precisa_comprar: bool = False

class InventarioUpdateInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    quantidade: int = 1
    condicao: str = "bom"
    precisa_comprar: bool = False

@app.get("/inventario")
def listar_inventario(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        return tx.fetch_all(
            "SELECT * FROM inventario_loja WHERE loja_id=%s ORDER BY nome",
            (loja_id,),
        )

@app.post("/inventario", status_code=201)
def criar_item_inventario(
    payload: InventarioInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.loja_id is not None and payload.loja_id != actor.loja_id:
        raise HTTPException(status_code=403, detail="Sem permissão para criar item nesta loja.")
    with db.transaction() as tx:
        row = tx.fetch_one(
            """INSERT INTO inventario_loja (loja_id, nome, descricao, quantidade, condicao, precisa_comprar)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""",
            (payload.loja_id, payload.nome, payload.descricao,
             payload.quantidade, payload.condicao, payload.precisa_comprar),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar item.")
    return {"id": row["id"]}

@app.put("/inventario/{item_id}")
def atualizar_item_inventario(
    item_id: int,
    payload: InventarioUpdateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            """UPDATE inventario_loja SET nome=%s, descricao=%s, quantidade=%s,
               condicao=%s, precisa_comprar=%s, atualizado_em=NOW() WHERE id=%s""",
            (payload.nome, payload.descricao, payload.quantidade,
             payload.condicao, payload.precisa_comprar, item_id),
        )
    return {"status": "updated"}

@app.delete("/inventario/{item_id}", status_code=204)
def deletar_item_inventario(
    item_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        row = tx.fetch_one("SELECT id, loja_id FROM inventario_loja WHERE id=%s", (item_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Item não encontrado.")
        if actor.loja_id is not None and row["loja_id"] != actor.loja_id:
            raise HTTPException(status_code=403, detail="Sem permissão para excluir este item.")
        tx.execute("DELETE FROM inventario_loja WHERE id=%s", (item_id,))


# ═══════════════════════════════════════════════════════════
#  TAREFAS
# ═══════════════════════════════════════════════════════════

_DATE_RE = _re.compile(r'^\d{4}-\d{2}-\d{2}$')

def _parse_date_field(value: Optional[str], field: str = "data") -> Optional[str]:
    """Valida e retorna uma string de data YYYY-MM-DD, ou None."""
    if not value:
        return None
    if not _DATE_RE.match(value):
        raise HTTPException(status_code=422,
            detail=f"Formato inválido para '{field}'. Use YYYY-MM-DD.")
    return value

def _loja_scope(actor: Actor) -> tuple:
    """Retorna (cond_sql, params) para filtro de loja. Admin vê tudo."""
    if actor.loja_id is not None:
        return "AND loja_id = %s", [actor.loja_id]
    return "", []


class TarefaCreateInput(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    prioridade: str = "normal"
    vencimento: Optional[str] = None
    responsavel_usuario_id: Optional[int] = None
    irmao_id: Optional[int] = None

class TarefaUpdateInput(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    prioridade: Optional[str] = None
    vencimento: Optional[str] = None
    responsavel_usuario_id: Optional[int] = None
    irmao_id: Optional[int] = None

class TarefaStatusInput(BaseModel):
    status: str

@app.get("/tarefas")
def listar_tarefas(
    status: Optional[str] = Query(None),
    prioridade: Optional[str] = Query(None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    loja_cond, loja_params = _loja_scope(actor)
    filtros = ["t.deleted_at IS NULL"]
    params: list = list(loja_params)
    if actor.loja_id is not None:
        filtros.insert(0, "t.loja_id = %s")
    if status:
        filtros.append("t.status = %s"); params.append(status)
    if prioridade:
        filtros.append("t.prioridade = %s"); params.append(prioridade)
    where = " AND ".join(filtros)
    with db.transaction() as tx:
        rows = tx.fetch_all(
            f"""SELECT t.id, t.titulo, t.descricao, t.status, t.prioridade,
                       t.vencimento, t.irmao_id, t.responsavel_usuario_id,
                       t.created_at, t.updated_at,
                       i.nome AS irmao_nome,
                       u.nome AS responsavel_nome
                FROM tarefas t
                LEFT JOIN irmaos i ON i.id = t.irmao_id
                LEFT JOIN usuarios u ON u.id = t.responsavel_usuario_id
                WHERE {where}
                ORDER BY
                    CASE t.prioridade WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2
                                      WHEN 'normal' THEN 3 ELSE 4 END,
                    t.vencimento ASC NULLS LAST, t.created_at DESC""",
            params,
        )
    return [dict(r) for r in rows]

@app.post("/tarefas", status_code=201)
def criar_tarefa(
    payload: TarefaCreateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if actor.loja_id is None:
        raise HTTPException(
            status_code=422,
            detail="Conta de administrador não vinculada a uma loja. "
                   "Associe o usuário a uma loja para criar tarefas.",
        )
    venc = _parse_date_field(payload.vencimento, "vencimento")
    if payload.prioridade not in ("urgente", "alta", "normal", "baixa"):
        raise HTTPException(status_code=422, detail="Prioridade inválida.")
    with db.transaction() as tx:
        row = tx.fetch_one(
            """INSERT INTO tarefas
               (loja_id, criado_por_usuario_id, titulo, descricao, prioridade,
                vencimento, responsavel_usuario_id, irmao_id)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (actor.loja_id, actor.user_id, payload.titulo, payload.descricao,
             payload.prioridade, venc,
             payload.responsavel_usuario_id, payload.irmao_id),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar tarefa.")
    return {"id": row["id"], "status": "created"}

@app.put("/tarefas/{tarefa_id}")
def atualizar_tarefa(
    tarefa_id: int,
    payload: TarefaUpdateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    loja_cond, loja_params = _loja_scope(actor)
    with db.transaction() as tx:
        existing = tx.fetch_one(
            f"SELECT id FROM tarefas WHERE id=%s {loja_cond} AND deleted_at IS NULL",
            [tarefa_id] + loja_params,
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        sets, params = [], []
        if payload.titulo     is not None: sets.append("titulo=%s");    params.append(payload.titulo)
        if payload.descricao  is not None: sets.append("descricao=%s"); params.append(payload.descricao)
        if payload.prioridade is not None:
            if payload.prioridade not in ("urgente", "alta", "normal", "baixa"):
                raise HTTPException(status_code=422, detail="Prioridade inválida.")
            sets.append("prioridade=%s"); params.append(payload.prioridade)
        if payload.vencimento is not None:
            sets.append("vencimento=%s")
            params.append(_parse_date_field(payload.vencimento, "vencimento"))
        if payload.responsavel_usuario_id is not None:
            sets.append("responsavel_usuario_id=%s"); params.append(payload.responsavel_usuario_id)
        if payload.irmao_id is not None:
            sets.append("irmao_id=%s"); params.append(payload.irmao_id)
        if sets:
            sets.append("updated_at=NOW()")
            params.append(tarefa_id)
            tx.execute(f"UPDATE tarefas SET {', '.join(sets)} WHERE id=%s", params)
    return {"status": "updated"}

@app.patch("/tarefas/{tarefa_id}/status")
def atualizar_status_tarefa(
    tarefa_id: int,
    payload: TarefaStatusInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    if payload.status not in ("pendente", "em_andamento", "concluida", "cancelada"):
        raise HTTPException(status_code=422, detail="Status inválido.")
    loja_cond, loja_params = _loja_scope(actor)
    with db.transaction() as tx:
        row = tx.fetch_one(
            f"SELECT id FROM tarefas WHERE id=%s {loja_cond} AND deleted_at IS NULL",
            [tarefa_id] + loja_params,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        tx.execute(
            "UPDATE tarefas SET status=%s, updated_at=NOW() WHERE id=%s",
            (payload.status, tarefa_id),
        )
    return {"status": "updated"}

@app.delete("/tarefas/{tarefa_id}", status_code=204)
def deletar_tarefa(
    tarefa_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    loja_cond, loja_params = _loja_scope(actor)
    with db.transaction() as tx:
        row = tx.fetch_one(
            f"SELECT id FROM tarefas WHERE id=%s {loja_cond} AND deleted_at IS NULL",
            [tarefa_id] + loja_params,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        tx.execute("UPDATE tarefas SET deleted_at=NOW() WHERE id=%s", (tarefa_id,))


# ═══════════════════════════════════════════════════════════
#  TENANTS & ASSINATURAS SAAS
# ═══════════════════════════════════════════════════════════

class TenantInput(BaseModel):
    nome: str
    tipo: str = "externo"
    plano: Optional[str] = None
    valor_mensalidade: Optional[Decimal] = None
    vencimento_dia: int = 10
    dias_tolerancia: int = 5
    status: str = "ativo"

class TenantUpdateInput(BaseModel):
    nome: Optional[str] = None
    plano: Optional[str] = None
    valor_mensalidade: Optional[Decimal] = None
    vencimento_dia: Optional[int] = None
    dias_tolerancia: Optional[int] = None
    status: Optional[str] = None

class TenantStatusInput(BaseModel):
    status: str

class AssinaturaInput(BaseModel):
    tenant_id: int
    competencia: str   # YYYY-MM
    valor: Decimal
    vencimento: str    # YYYY-MM-DD
    observacao: Optional[str] = None

class AssinaturaPagarInput(BaseModel):
    forma_pagamento: Optional[str] = None
    observacao: Optional[str] = None


def _only_admin(actor: Actor):
    if actor.cargo != "admin_principal":
        raise HTTPException(status_code=403, detail="Apenas admin pode executar esta operação.")


@app.get("/tenants")
def listar_tenants(
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    with db.transaction() as tx:
        rows = tx.fetch_all(
            """SELECT t.*,
                      COUNT(DISTINCT l.id)  AS total_lojas,
                      COUNT(DISTINCT u.id)  AS total_usuarios,
                      MAX(a.competencia)    AS ultima_competencia,
                      (SELECT a2.status FROM assinaturas_saas a2
                       WHERE a2.tenant_id = t.id
                       ORDER BY a2.criado_em DESC LIMIT 1) AS ultimo_status_ass
               FROM tenants t
               LEFT JOIN lojas l    ON l.tenant_id = t.id AND l.deleted_at IS NULL
               LEFT JOIN usuarios u ON u.loja_id   = l.id AND u.deleted_at IS NULL AND u.ativo = TRUE
               LEFT JOIN assinaturas_saas a ON a.tenant_id = t.id
               WHERE t.cancelado_em IS NULL
               GROUP BY t.id
               ORDER BY t.tipo, t.nome""",
            [],
        )
    return [dict(r) for r in rows]


@app.post("/tenants", status_code=201)
def criar_tenant(
    payload: TenantInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    if payload.tipo not in ("interno", "externo"):
        raise HTTPException(status_code=422, detail="tipo deve ser 'interno' ou 'externo'.")
    if payload.status not in ("ativo", "bloqueado", "cancelado", "teste"):
        raise HTTPException(status_code=422, detail="status inválido.")
    with db.transaction() as tx:
        row = tx.fetch_one(
            """INSERT INTO tenants (nome, tipo, plano, valor_mensalidade, vencimento_dia, dias_tolerancia, status)
               VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (payload.nome, payload.tipo, payload.plano, payload.valor_mensalidade,
             payload.vencimento_dia, payload.dias_tolerancia, payload.status),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar tenant.")
    return {"id": row["id"], "status": "created"}


@app.put("/tenants/{tenant_id}")
def atualizar_tenant(
    tenant_id: int,
    payload: TenantUpdateInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    with db.transaction() as tx:
        if not tx.fetch_one("SELECT id FROM tenants WHERE id=%s AND cancelado_em IS NULL", (tenant_id,)):
            raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        sets, params = [], []
        if payload.nome              is not None: sets.append("nome=%s");               params.append(payload.nome)
        if payload.plano             is not None: sets.append("plano=%s");              params.append(payload.plano)
        if payload.valor_mensalidade is not None: sets.append("valor_mensalidade=%s");  params.append(payload.valor_mensalidade)
        if payload.vencimento_dia    is not None: sets.append("vencimento_dia=%s");     params.append(payload.vencimento_dia)
        if payload.dias_tolerancia   is not None: sets.append("dias_tolerancia=%s");    params.append(payload.dias_tolerancia)
        if payload.status            is not None:
            if payload.status not in ("ativo", "bloqueado", "cancelado", "teste"):
                raise HTTPException(status_code=422, detail="status inválido.")
            sets.append("status=%s"); params.append(payload.status)
            if payload.status == "cancelado":
                sets.append("cancelado_em=NOW()")
        if sets:
            params.append(tenant_id)
            tx.execute(f"UPDATE tenants SET {', '.join(sets)} WHERE id=%s", params)
    return {"status": "updated"}


@app.patch("/tenants/{tenant_id}/status")
def alterar_status_tenant(
    tenant_id: int,
    payload: TenantStatusInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    if payload.status not in ("ativo", "bloqueado", "cancelado", "teste"):
        raise HTTPException(status_code=422, detail="status inválido.")
    with db.transaction() as tx:
        row = tx.fetch_one("SELECT id FROM tenants WHERE id=%s AND cancelado_em IS NULL", (tenant_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        extra = ", cancelado_em=NOW()" if payload.status == "cancelado" else ""
        tx.execute(f"UPDATE tenants SET status=%s{extra} WHERE id=%s", (payload.status, tenant_id))
    return {"status": "updated"}


@app.delete("/tenants/{tenant_id}", status_code=204)
def deletar_tenant(
    tenant_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    with db.transaction() as tx:
        row = tx.fetch_one("SELECT id, tipo FROM tenants WHERE id=%s AND cancelado_em IS NULL", (tenant_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        if row["tipo"] == "interno":
            raise HTTPException(status_code=403, detail="Tenant interno não pode ser excluído.")
        tx.execute("UPDATE tenants SET cancelado_em=NOW(), status='cancelado' WHERE id=%s", (tenant_id,))


@app.get("/assinaturas-saas")
def listar_assinaturas(
    tenant_id: Optional[int] = Query(None),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    with db.transaction() as tx:
        conds, params = [], []
        if tenant_id:
            conds.append("a.tenant_id=%s"); params.append(tenant_id)
        where = ("WHERE " + " AND ".join(conds)) if conds else ""
        rows = tx.fetch_all(
            f"""SELECT a.*, t.nome AS tenant_nome
                FROM assinaturas_saas a
                JOIN tenants t ON t.id = a.tenant_id
                {where}
                ORDER BY a.competencia DESC, a.tenant_id""",
            params,
        )
    return [dict(r) for r in rows]


@app.post("/assinaturas-saas", status_code=201)
def criar_assinatura(
    payload: AssinaturaInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    if not _re.match(r"^\d{4}-\d{2}$", payload.competencia):
        raise HTTPException(status_code=422, detail="competencia deve ser YYYY-MM.")
    venc = _parse_date_field(payload.vencimento, "vencimento")
    with db.transaction() as tx:
        if not tx.fetch_one("SELECT id FROM tenants WHERE id=%s AND cancelado_em IS NULL", (payload.tenant_id,)):
            raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        existente = tx.fetch_one(
            "SELECT id FROM assinaturas_saas WHERE tenant_id=%s AND competencia=%s",
            (payload.tenant_id, payload.competencia),
        )
        if existente:
            raise HTTPException(status_code=409, detail="Já existe assinatura para esta competência.")
        row = tx.fetch_one(
            """INSERT INTO assinaturas_saas (tenant_id, competencia, valor, vencimento, observacao)
               VALUES (%s,%s,%s,%s,%s) RETURNING id""",
            (payload.tenant_id, payload.competencia, payload.valor, venc, payload.observacao),
        )
    if not row:
        raise HTTPException(status_code=500, detail="Falha ao criar assinatura.")
    return {"id": row["id"], "status": "created"}


@app.patch("/assinaturas-saas/{ass_id}/pagar")
def marcar_assinatura_paga(
    ass_id: int,
    payload: AssinaturaPagarInput,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    _only_admin(actor)
    with db.transaction() as tx:
        row = tx.fetch_one(
            "SELECT id, status FROM assinaturas_saas WHERE id=%s FOR UPDATE",
            (ass_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Assinatura não encontrada.")
        if row["status"] == "pago":
            raise HTTPException(status_code=409, detail="Assinatura já está paga.")
        tx.execute(
            """UPDATE assinaturas_saas
               SET status='pago', pago_em=NOW(),
                   forma_pagamento=%s, observacao=COALESCE(%s, observacao)
               WHERE id=%s""",
            (payload.forma_pagamento, payload.observacao, ass_id),
        )
    return {"status": "pago"}


@app.post("/tenants/{tenant_id}/gerar-mensalidade", status_code=201)
def gerar_mensalidade(
    tenant_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    """Gera cobrança do mês corrente para o tenant (idempotente)."""
    _only_admin(actor)
    import datetime as _dt
    with db.transaction() as tx:
        t = tx.fetch_one(
            "SELECT id, valor_mensalidade, vencimento_dia FROM tenants WHERE id=%s AND cancelado_em IS NULL",
            (tenant_id,),
        )
        if not t:
            raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        if not t["valor_mensalidade"]:
            raise HTTPException(status_code=422, detail="Tenant sem valor de mensalidade definido.")
        hoje = _dt.date.today()
        competencia = hoje.strftime("%Y-%m")
        dia = min(t["vencimento_dia"] or 10, 28)
        try:
            vencimento = hoje.replace(day=dia)
        except ValueError:
            import calendar
            ultimo = calendar.monthrange(hoje.year, hoje.month)[1]
            vencimento = hoje.replace(day=min(dia, ultimo))
        existente = tx.fetch_one(
            "SELECT id FROM assinaturas_saas WHERE tenant_id=%s AND competencia=%s",
            (tenant_id, competencia),
        )
        if existente:
            return {"id": existente["id"], "status": "already_exists"}
        row = tx.fetch_one(
            """INSERT INTO assinaturas_saas (tenant_id, competencia, valor, vencimento)
               VALUES (%s,%s,%s,%s) RETURNING id""",
            (tenant_id, competencia, t["valor_mensalidade"], vencimento),
        )
    return {"id": row["id"], "status": "created"}


# ═══════════════════════════════════════════════════════════
#  NOTIFICAÇÕES INBOX
# ═══════════════════════════════════════════════════════════

def _notificar_agape(db, loja_id: int, titulo: str, data_evento):
    """Insere notificação de ágape para usuários financeiro e mestre_banquete."""
    data_str = f" em {data_evento}" if data_evento else ""
    with db.transaction() as tx:
        destinatarios = tx.fetch_all(
            """SELECT u.id FROM usuarios u
               JOIN cargos c ON c.id = u.cargo_id
               WHERE u.loja_id=%s AND c.nome IN ('financeiro','mestre_banquete','tesoureiro') AND u.ativo=TRUE""",
            (loja_id,),
        )
        for dest in destinatarios:
            tx.execute(
                """INSERT INTO notificacoes_inbox (loja_id, usuario_id, titulo, mensagem)
                   VALUES (%s,%s,%s,%s)""",
                (loja_id, dest["id"], f"Ágape agendado: {titulo}",
                 f"Um novo ágape foi cadastrado na agenda{data_str}. Providencie orçamento e compras."),
            )

@app.get("/notificacoes/inbox")
def listar_inbox(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        return tx.fetch_all(
            """SELECT * FROM notificacoes_inbox
               WHERE loja_id=%s AND usuario_id=%s
               ORDER BY criado_em DESC LIMIT 50""",
            (loja_id, actor.user_id),
        )

@app.put("/notificacoes/inbox/{notif_id}/lida", status_code=200)
def marcar_notif_lida(
    notif_id: int,
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            "UPDATE notificacoes_inbox SET lido=TRUE WHERE id=%s AND usuario_id=%s",
            (notif_id, actor.user_id),
        )
    return {"status": "ok"}

@app.put("/notificacoes/inbox/todas-lidas", status_code=200)
def marcar_todas_lidas(
    loja_id: int = Query(...),
    actor: Actor = Depends(get_current_actor),
    db=Depends(get_database),
):
    with db.transaction() as tx:
        tx.execute(
            "UPDATE notificacoes_inbox SET lido=TRUE WHERE loja_id=%s AND usuario_id=%s",
            (loja_id, actor.user_id),
        )
    return {"status": "ok"}
