begin;

create table if not exists eventos (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  criado_por_usuario_id bigint references usuarios(id),
  contrato_id bigint references contratos(id),
  templo_id bigint references recursos(id),
  titulo varchar(200) not null,
  descricao text,
  tipo varchar(30) not null
    check (tipo in ('evento', 'sessao_extra', 'agape', 'administrativo')),
  status varchar(30) not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'cancelado', 'encerrado')),
  data_evento date not null,
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (hora_fim > hora_inicio),
  check (length(titulo) <= 200),
  check (descricao is null or length(descricao) <= 10000)
);

create index if not exists idx_eventos_loja_id on eventos(loja_id);
create index if not exists idx_eventos_templo_id on eventos(templo_id);
create index if not exists idx_eventos_data_evento on eventos(data_evento);

commit;
