begin;

create table if not exists sessoes_whatsapp (
  id bigserial primary key,
  loja_id bigint references lojas(id),
  irmao_id bigint references irmaos(id),
  usuario_id bigint references usuarios(id),
  telefone varchar(30) not null,
  contexto_ativo varchar(50) not null,
  perfil_snapshot varchar(100),
  iniciado_em timestamp not null default now(),
  expira_em timestamp not null,
  encerrado_em timestamp,
  created_at timestamp not null default now(),
  check (expira_em > iniciado_em),
  check (encerrado_em is null or encerrado_em >= iniciado_em)
);

create index if not exists idx_sessoes_whatsapp_telefone on sessoes_whatsapp(telefone);
create index if not exists idx_sessoes_whatsapp_loja_id on sessoes_whatsapp(loja_id);

create unique index if not exists uq_sessao_whatsapp_ativa_por_telefone
on sessoes_whatsapp(telefone)
where encerrado_em is null;

create index if not exists idx_sessoes_whatsapp_expira_em on sessoes_whatsapp(expira_em);
}} ,{
commit;
