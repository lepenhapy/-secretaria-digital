BEGIN;

CREATE TABLE IF NOT EXISTS repositorio_arquivos (
    id             SERIAL PRIMARY KEY,
    loja_id        INT NOT NULL,
    usuario_id     INT REFERENCES usuarios(id),
    contexto       VARCHAR(50) NOT NULL DEFAULT 'geral',
    contexto_id    INT,
    descricao      TEXT,
    caminho        VARCHAR(500) NOT NULL,
    nome_original  VARCHAR(200),
    mimetype       VARCHAR(100),
    tamanho_bytes  INT,
    sha256         VARCHAR(64),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repos_loja_id   ON repositorio_arquivos(loja_id);
CREATE INDEX IF NOT EXISTS idx_repos_usuario_id ON repositorio_arquivos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_repos_criado_em  ON repositorio_arquivos(criado_em DESC);

COMMIT;
