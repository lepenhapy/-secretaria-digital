begin;

create table if not exists contratos (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  templo_id bigint references recursos(id),
  status varchar(30) not null default 'rascunho'
    check (status in ('rascunho', 'enviado', 'aguardando_aceite', 'aceito', 'ativo', 'encerrado', 'cancelado', 'recusado')),
  arquivo_url text,
  vigencia_inicio date,
  vigencia_fim date,
  regra_recorrencia varchar(150),
  hora_inicio_sessao time,
  hora_fim_sessao time,
  created_by_usuario_id bigint references usuarios(id),
  updated_by_usuario_id bigint references usuarios(id),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (vigencia_fim is null or vigencia_inicio is null or vigencia_fim >= vigencia_inicio),
  check (hora_fim_sessao is null or hora_inicio_sessao is null or hora_fim_sessao > hora_inicio_sessao)
);

create unique index if not exists uq_contrato_ativo_por_loja
on contratos(loja_id)
where status = 'ativo' and deleted_at is null;

create index if not exists idx_contratos_loja_id on contratos(loja_id);

commit;
