begin;

create table if not exists recursos (
  id bigserial primary key,
  nome varchar(150) not null,
  tipo varchar(50) not null
    check (tipo in ('templo', 'cozinha', 'espaco', 'outro')),
  ativo boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp
);

commit;
