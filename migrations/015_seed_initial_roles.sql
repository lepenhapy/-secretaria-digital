begin;

insert into cargos (nome, nivel_hierarquico)
values
  ('admin_principal', 100),
  ('veneravel_mestre', 90),
  ('primeiro_vigilante', 80),
  ('segundo_vigilante', 70),
  ('financeiro', 60),
  ('secretario', 60),
  ('chanceler', 60),
  ('arquiteto', 60),
  ('almoxarife', 60),
  ('irmao_operacional', 10)
on conflict (nome) do update
set nivel_hierarquico = excluded.nivel_hierarquico;

commit;
