begin;

create table if not exists boletos_processados (
  id             bigserial primary key,
  loja_id        bigint not null references lojas(id),
  irmao_id       bigint references irmaos(id),
  tamanho_bytes  integer,
  status         varchar(30) not null
    check (status in ('enviado', 'nao_identificado', 'sem_telefone', 'erro_envio')),
  erro           text,
  created_at     timestamp not null default now()
);

create index if not exists idx_boletos_proc_loja_id  on boletos_processados(loja_id);
create index if not exists idx_boletos_proc_irmao_id on boletos_processados(irmao_id);

commit;
