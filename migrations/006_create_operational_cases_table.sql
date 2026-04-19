begin;

create table if not exists casos_operacionais (
  id bigserial primary key,
  loja_id bigint not null references lojas(id),
  tipo_caso varchar(50) not null
    check (tipo_caso in ('agape', 'financeiro', 'manutencao', 'documento', 'contrato', 'evento')),
  subtipo varchar(50),
  criado_por_irmao_id bigint references irmaos(id),
  criado_por_usuario_id bigint references usuarios(id),
  responsavel_usuario_id bigint references usuarios(id),
  origem varchar(30) not null default 'whatsapp'
    check (origem in ('whatsapp', 'painel', 'sistema')),
  status varchar(30) not null default 'novo'
    check (status in ('novo', 'em_analise', 'aguardando_aprovacao', 'aprovado', 'rejeitado', 'pago', 'arquivado', 'pendente_complemento')),
  titulo varchar(200) not null,
  descricao_resumida text,
  valor_informado numeric(12,2) check (valor_informado is null or valor_informado >= 0),
  valor_confirmado numeric(12,2) check (valor_confirmado is null or valor_confirmado >= 0),
  data_referencia date,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp,
  check (length(titulo) <= 200),
  check (descricao_resumida is null or length(descricao_resumida) <= 10000)
);

create index if not exists idx_casos_loja_id on casos_operacionais(loja_id);
create index if not exists idx_casos_tipo on casos_operacionais(tipo_caso);

commit;
