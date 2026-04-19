begin;

create table if not exists aprovacoes (
  id bigserial primary key,
  entidade_tipo varchar(50) not null,
  entidade_id bigint not null,
  etapa varchar(50),
  aprovado_por_usuario_id bigint not null references usuarios(id),
  delegacao_id bigint references delegacoes(id),
  decisao varchar(20) not null
    check (decisao in ('aprovado', 'rejeitado')),
  observacao text,
  created_at timestamp not null default now(),
  check (observacao is null or length(observacao) <= 5000)
);

create index if not exists idx_aprovacoes_entidade on aprovacoes(entidade_tipo, entidade_id);
create index if not exists idx_aprovacoes_usuario_id on aprovacoes(aprovado_por_usuario_id);

commit;
