begin;

create table if not exists arquivos (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  irmao_id bigint references irmaos(id),
  contrato_id bigint references contratos(id),
  caso_id bigint references casos_operacionais(id),
  categoria varchar(50) not null,
  nome_original varchar(255) not null,
  tipo_mime varchar(120),
  tamanho_bytes bigint check (tamanho_bytes is null or tamanho_bytes >= 0),
  sha256 varchar(64),
  url_armazenamento text not null,
  origem_envio varchar(30) not null
    check (origem_envio in ('site', 'whatsapp', 'admin', 'sistema')),
  status varchar(30) not null default 'ativo'
    check (status in ('ativo', 'arquivado', 'bloqueado')),
  enviado_por_usuario_id bigint references usuarios(id),
  enviado_por_telefone varchar(30),
  data_envio timestamp not null default now(),
  created_at timestamp not null default now(),
  deleted_at timestamp,
  check (tamanho_bytes is null or tamanho_bytes <= 52428800)
);

create index if not exists idx_arquivos_loja_id on arquivos(loja_id);
create index if not exists idx_arquivos_caso_id on arquivos(caso_id);
create index if not exists idx_arquivos_contrato_id on arquivos(contrato_id);
create index if not exists idx_arquivos_sha256_por_loja
on arquivos(loja_id, sha256)
where sha256 is not null and deleted_at is null;

create table if not exists evidencias (
  id bigserial primary key,
  caso_id bigint not null references casos_operacionais(id),
  arquivo_id bigint references arquivos(id),
  tipo varchar(30) not null
    check (tipo in ('foto', 'audio', 'pdf', 'texto', 'imagem', 'arquivo')),
  texto_extraido text,
  transcricao text,
  enviado_por_telefone varchar(30),
  data_envio timestamp not null default now(),
  check (texto_extraido is null or length(texto_extraido) <= 20000),
  check (transcricao is null or length(transcricao) <= 20000)
);

create index if not exists idx_evidencias_caso_id on evidencias(caso_id);
create index if not exists idx_evidencias_arquivo_id on evidencias(arquivo_id);

create table if not exists acessos_arquivo (
  id bigserial primary key,
  arquivo_id bigint not null references arquivos(id),
  usuario_id bigint not null references usuarios(id),
  acao varchar(30) not null
    check (acao in ('visualizou', 'baixou')),
  origem varchar(30) not null default 'painel'
    check (origem in ('painel', 'interno', 'link')),
  data_hora timestamp not null default now()
);

create index if not exists idx_acessos_arquivo_arquivo_id on acessos_arquivo(arquivo_id);
create index if not exists idx_acessos_arquivo_usuario_id on acessos_arquivo(usuario_id);

commit;
