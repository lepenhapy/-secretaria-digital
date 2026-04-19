BEGIN;

CREATE TABLE IF NOT EXISTS centros_custo (
    id          SERIAL PRIMARY KEY,
    loja_id     INT NOT NULL,
    nome        VARCHAR(100) NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regras_rateio (
    id          SERIAL PRIMARY KEY,
    loja_id     INT NOT NULL,
    nome        VARCHAR(100) NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por  INT REFERENCES usuarios(id),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regras_rateio_itens (
    id               SERIAL PRIMARY KEY,
    regra_id         INT NOT NULL REFERENCES regras_rateio(id) ON DELETE CASCADE,
    centro_custo_id  INT NOT NULL REFERENCES centros_custo(id),
    percentual       NUMERIC(6,3) NOT NULL CHECK (percentual > 0 AND percentual <= 100)
);

CREATE TABLE IF NOT EXISTS compras (
    id               SERIAL PRIMARY KEY,
    loja_id          INT NOT NULL,
    usuario_id       INT NOT NULL REFERENCES usuarios(id),
    evento           VARCHAR(200) NOT NULL,
    valor            NUMERIC(12,2) NOT NULL,
    regra_rateio_id  INT REFERENCES regras_rateio(id),
    status           VARCHAR(20) NOT NULL DEFAULT 'pendente'
                         CHECK (status IN ('pendente','aprovado','rejeitado')),
    aprovado_por     INT REFERENCES usuarios(id),
    aprovado_em      TIMESTAMPTZ,
    observacao       TEXT,
    visivel          BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_from    VARCHAR(50),
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compras_arquivos (
    id             SERIAL PRIMARY KEY,
    compra_id      INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    tipo           VARCHAR(20) NOT NULL DEFAULT 'arquivo'
                       CHECK (tipo IN ('foto','cupom','arquivo')),
    caminho        VARCHAR(500) NOT NULL,
    nome_original  VARCHAR(200),
    tamanho_bytes  INT,
    sha256         VARCHAR(64),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificacoes_destinatarios (
    id           SERIAL PRIMARY KEY,
    loja_id      INT NOT NULL,
    evento_tipo  VARCHAR(50) NOT NULL,
    usuario_id   INT NOT NULL REFERENCES usuarios(id),
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (loja_id, evento_tipo, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_compras_loja_id    ON compras(loja_id);
CREATE INDEX IF NOT EXISTS idx_compras_usuario_id ON compras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_compras_status     ON compras(status);
CREATE INDEX IF NOT EXISTS idx_compras_criado_em  ON compras(criado_em);

COMMIT;
