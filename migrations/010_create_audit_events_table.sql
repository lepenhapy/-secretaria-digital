begin;

create table if not exists auditoria_eventos (
  id bigserial primary key,
  loja_id bigint references lojas(id),
  usuario_id bigint references usuarios(id),
  cargo_snapshot varchar(100),
  acao varchar(100) not null,
  modulo varchar(50) not null,
  entidade_tipo varchar(50),
  entidade_id bigint,
  detalhes_json jsonb,
  origem varchar(30) not null
    check (origem in ('painel', 'whatsapp', 'interno', 'api')),
  exigiu_reautenticacao boolean not null default false,
  ocorreu_em timestamp not null default now()
);

create index if not exists idx_auditoria_loja_id on auditoria_eventos(loja_id);
create index if not exists idx_auditoria_entidade on auditoria_eventos(entidade_tipo, entidade_id);
create index if not exists idx_auditoria_usuario_id on auditoria_eventos(usuario_id);

commit;
