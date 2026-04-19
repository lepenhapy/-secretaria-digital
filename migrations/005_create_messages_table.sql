begin;

create table if not exists mensagens (
  id bigserial primary key,
  loja_id bigint references lojas(id),
  irmao_id bigint references irmaos(id),
  message_external_id varchar(255),
  tipo varchar(30) not null
    check (tipo in ('texto', 'audio', 'imagem', 'pdf', 'arquivo')),
  contexto varchar(50),
  texto text,
  arquivo_url text,
  audio_url text,
  transcricao text,
  status varchar(30) not null default 'novo'
    check (status in ('novo', 'processado', 'vinculado', 'arquivado')),
  enviado_por_telefone varchar(30),
  created_at timestamp not null default now(),
  check (texto is null or length(texto) <= 20000),
  check (transcricao is null or length(transcricao) <= 20000)
);

create unique index if not exists uq_mensagens_external_id
on mensagens(message_external_id)
where message_external_id is not null;

create index if not exists idx_mensagens_loja_id on mensagens(loja_id);
create index if not exists idx_mensagens_contexto on mensagens(contexto);

commit;
