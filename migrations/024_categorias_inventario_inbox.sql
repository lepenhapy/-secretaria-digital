BEGIN;

CREATE TABLE IF NOT EXISTS categorias_mensalidade (
  id          SERIAL PRIMARY KEY,
  loja_id     INT NOT NULL,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(loja_id, nome)
);

CREATE TABLE IF NOT EXISTS inventario_loja (
  id              SERIAL PRIMARY KEY,
  loja_id         INT NOT NULL,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  quantidade      INT NOT NULL DEFAULT 1,
  condicao        TEXT NOT NULL DEFAULT 'bom',
  precisa_comprar BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificacoes_inbox (
  id         SERIAL PRIMARY KEY,
  loja_id    INT NOT NULL,
  usuario_id INT NOT NULL,
  titulo     TEXT NOT NULL,
  mensagem   TEXT,
  lido       BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
