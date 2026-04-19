begin;

create table if not exists reembolsos (
  id bigserial primary key,
  caso_id bigint not null references casos_operacionais(id),
  loja_id bigint not null references lojas(id),
  irmao_id bigint references irmaos(id),
  aprovado_por_usuario_id bigint references usuarios(id),
  categoria varchar(50) not null
    check (categoria in ('agape', 'manutencao', 'evento', 'material', 'outros')),
  valor_solicitado numeric(12,2) not null check (valor_solicitado >= 0),
  valor_aprovado numeric(12,2) check (valor_aprovado is null or (valor_aprovado >= 0 and valor_aprovado <= valor_solicitado)),
  status varchar(30) not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'pago', 'cancelado')),
  data_pagamento date,
  observacao_financeiro text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (observacao_financeiro is null or length(observacao_financeiro) <= 5000)
);

create unique index if not exists uq_reembolso_caso_id
on reembolsos(caso_id)
where deleted_at is null;

create index if not exists idx_reembolsos_loja_id on reembolsos(loja_id);
create index if not exists idx_reembolsos_status on reembolsos(status);

commit;
