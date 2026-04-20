BEGIN;

CREATE TABLE IF NOT EXISTS sessoes_recorrentes (
    id           SERIAL PRIMARY KEY,
    loja_id      INT NOT NULL,
    titulo       VARCHAR(200) NOT NULL,
    descricao    TEXT,
    tipo         VARCHAR(30) NOT NULL DEFAULT 'sessao'
                     CHECK (tipo IN ('sessao','agape','administrativa','especial')),
    frequencia   VARCHAR(30) NOT NULL
                     CHECK (frequencia IN ('semanal','quinzenal','mensal_dia_semana','mensal_dia_numero')),
    dia_semana   SMALLINT CHECK (dia_semana BETWEEN 0 AND 6),   -- 0=dom,1=seg,...,6=sab
    semana_mes   SMALLINT CHECK (semana_mes BETWEEN 1 AND 5),   -- 1ª,2ª,3ª,4ª,5ª semana
    dia_mes      SMALLINT CHECK (dia_mes BETWEEN 1 AND 31),     -- para mensal_dia_numero
    hora_inicio  TIME NOT NULL,
    hora_fim     TIME NOT NULL,
    cor          VARCHAR(7) NOT NULL DEFAULT '#2563eb',
    vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    vigencia_fim    DATE,
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eventos avulsos simples (independente do Google Calendar)
CREATE TABLE IF NOT EXISTS agenda_eventos (
    id          SERIAL PRIMARY KEY,
    loja_id     INT NOT NULL,
    titulo      VARCHAR(200) NOT NULL,
    descricao   TEXT,
    tipo        VARCHAR(30) NOT NULL DEFAULT 'evento',
    data        DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim    TIME NOT NULL,
    local       VARCHAR(200),
    cor         VARCHAR(7) NOT NULL DEFAULT '#7c3aed',
    criado_por  INT REFERENCES usuarios(id),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sess_rec_loja  ON sessoes_recorrentes(loja_id);
CREATE INDEX IF NOT EXISTS idx_agenda_ev_loja ON agenda_eventos(loja_id);
CREATE INDEX IF NOT EXISTS idx_agenda_ev_data ON agenda_eventos(data);

COMMIT;
