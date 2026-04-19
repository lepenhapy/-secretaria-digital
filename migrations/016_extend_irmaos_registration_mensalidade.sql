begin;

-- Novos campos em irmaos
alter table irmaos
  add column if not exists cim varchar(30),
  add column if not exists data_nascimento date,
  add column if not exists nome_esposa varchar(150),
  add column if not exists data_nascimento_esposa date,
  add column if not exists potencia varchar(100);

-- Filhos dos irmãos
create table if not exists irmaos_filhos (
  id              bigserial primary key,
  irmao_id        bigint not null references irmaos(id) on delete cascade,
  nome            varchar(150) not null,
  data_nascimento date,
  created_at      timestamp not null default now()
);

-- Regras de mensalidade por irmão
create table if not exists regras_mensalidade (
  id               bigserial primary key,
  irmao_id         bigint not null references irmaos(id) on delete cascade,
  categoria        varchar(30) not null
    check (categoria in ('regular', 'idoso', 'potencia', 'especial')),
  valor            numeric(10,2) not null check (valor >= 0),
  vigencia_inicio  date not null,
  vigencia_fim     date,
  observacao       text,
  created_at       timestamp not null default now(),
  updated_at       timestamp not null default now(),
  check (vigencia_fim is null or vigencia_fim >= vigencia_inicio)
);

-- Suporte a registro com confirmação de e-mail
alter table usuarios
  add column if not exists confirmacao_token text,
  add column if not exists email_confirmado  boolean not null default true;

-- Usuários existentes já confirmados
update usuarios set email_confirmado = true where email_confirmado = false;

create index if not exists idx_irmaos_filhos_irmao_id       on irmaos_filhos(irmao_id);
create index if not exists idx_regras_mensalidade_irmao_id  on regras_mensalidade(irmao_id);
create index if not exists idx_usuarios_conf_token          on usuarios(confirmacao_token)
  where confirmacao_token is not null;

commit;
