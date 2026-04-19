begin;

create table if not exists caso_mensagens (
  id bigserial primary key,
  caso_id bigint not null references casos_operacionais(id),
  mensagem_id bigint not null references mensagens(id),
  created_at timestamp not null default now(),
  unique (caso_id, mensagem_id),
  unique (mensagem_id)
);

create index if not exists idx_caso_mensagens_caso_id on caso_mensagens(caso_id);

commit;
