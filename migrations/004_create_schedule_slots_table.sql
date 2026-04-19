begin;

create table if not exists agenda_slots (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  contrato_id bigint references contratos(id),
  recurso_id bigint not null references recursos(id),
  regra varchar(150) not null,
  hora_inicio time not null,
  hora_fim time not null,
  vigencia_inicio date not null,
  vigencia_fim date,
  status varchar(30) not null default 'ativo'
    check (status in ('ativo', 'encerrado', 'cancelado')),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (hora_fim > hora_inicio),
  check (vigencia_fim is null or vigencia_fim >= vigencia_inicio)
);

create index if not exists idx_agenda_slots_recurso_id on agenda_slots(recurso_id);
create index if not exists idx_agenda_slots_loja_id on agenda_slots(loja_id);

commit;
