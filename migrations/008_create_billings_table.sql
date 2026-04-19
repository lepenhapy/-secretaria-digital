begin;

create table if not exists cobrancas (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  contrato_id bigint references contratos(id),
  competencia varchar(7) not null,
  valor numeric(12,2) not null check (valor >= 0),
  data_vencimento date not null,
  boleto_url text,
  status varchar(30) not null default 'pendente'
    check (status in ('pendente', 'enviado', 'pago', 'atrasado', 'cancelado')),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (competencia ~ '^[0-9]{4}-[0-9]{2}$')
);

create unique index if not exists uq_cobranca_contrato_competencia
on cobrancas(contrato_id, competencia)
where contrato_id is not null and deleted_at is null;

create index if not exists idx_cobrancas_loja_id on cobrancas(loja_id);

commit;
