BEGIN;

-- Permissões por cargo (Venerável configura)
CREATE TABLE IF NOT EXISTS cargo_permissoes (
    id        SERIAL PRIMARY KEY,
    loja_id   INT NOT NULL,
    cargo     VARCHAR(50) NOT NULL,
    recurso   VARCHAR(50) NOT NULL,
    acoes     TEXT[] NOT NULL DEFAULT '{}',
    UNIQUE (loja_id, cargo, recurso)
);

-- Comissões
CREATE TABLE IF NOT EXISTS comissoes (
    id          SERIAL PRIMARY KEY,
    loja_id     INT NOT NULL,
    nome        VARCHAR(100) NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membros de comissões
CREATE TABLE IF NOT EXISTS comissoes_membros (
    id           SERIAL PRIMARY KEY,
    comissao_id  INT NOT NULL REFERENCES comissoes(id) ON DELETE CASCADE,
    irmao_id     INT NOT NULL REFERENCES irmaos(id) ON DELETE CASCADE,
    funcao       VARCHAR(100),
    data_inicio  DATE,
    data_fim     DATE,
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (comissao_id, irmao_id)
);

CREATE INDEX IF NOT EXISTS idx_comissoes_membros_irmao ON comissoes_membros(irmao_id);

COMMIT;
