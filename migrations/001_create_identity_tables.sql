begin;

create table if not exists cargos (
  id bigserial primary key,
  nome varchar(100) not null unique,
  nivel_hierarquico integer not null default 0 check (nivel_hierarquico >= 0),
  created_at timestamp not null default now()
);

create table if not exists lojas (
  id bigserial primary key,
  nome varchar(150) not null,
  status varchar(30) not null default 'pendente'
    check (status in ('pendente', 'ativa', 'inativa', 'bloqueada')),
  plano varchar(50),
  telefone_whatsapp varchar(30),
  cidade varchar(120),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp
);

create table if not exists usuarios (
  id bigserial primary key,
  loja_id bigint references lojas(id),
  cargo_id bigint not null references cargos(id),
  nome varchar(150) not null,
  email varchar(150) not null unique,
  senha_hash text not null,
  ativo boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp
);

create table if not exists delegacoes (
  id bigserial primary key,
  concedido_por_usuario_id bigint not null references usuarios(id),
  concedido_para_usuario_id bigint not null references usuarios(id),
  permissao varchar(100) not null,
  escopo varchar(100),
  limite_valor numeric(12,2) check (limite_valor is null or limite_valor >= 0),
  inicio_vigencia timestamp not null,
  fim_vigencia timestamp,
  ativo boolean not null default true,
  created_at timestamp not null default now(),
  check (fim_vigencia is null or fim_vigencia >= inicio_vigencia)
);

create table if not exists irmaos (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  nome varchar(150) not null,
  telefone varchar(30),
  status varchar(30) not null default 'ativo'
    check (status in ('ativo', 'inativo', 'bloqueado')),
  observacoes text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (observacoes is null or length(observacoes) <= 5000)
);

create index if not exists idx_usuarios_loja_id on usuarios(loja_id);
create index if not exists idx_irmaos_loja_id on irmaos(loja_id);

commit;
