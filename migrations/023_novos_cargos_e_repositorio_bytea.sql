BEGIN;

-- Novos cargos
INSERT INTO cargos (nome, nivel_hierarquico) VALUES
  ('mestre_banquete', 55),
  ('obreiro',         20),
  ('irmao_loja',      15)
ON CONFLICT (nome) DO NOTHING;

-- Repositório: guardar conteúdo no BD para sobreviver a restarts do Railway
ALTER TABLE repositorio_arquivos ADD COLUMN IF NOT EXISTS conteudo BYTEA;

COMMIT;
