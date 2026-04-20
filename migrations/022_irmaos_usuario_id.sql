BEGIN;

-- Vincula irmão à sua conta de usuário no sistema
ALTER TABLE irmaos
  ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_irmaos_usuario_id ON irmaos(usuario_id) WHERE usuario_id IS NOT NULL;

COMMIT;
