-- Expõe o schema projetse na API PostgREST.
-- Em projetos compartilhados, prefira também `supabase config push` com schemas mesclados no config.toml.

grant usage on schema projetse to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema projetse to anon, authenticated, service_role;
grant usage, select on all sequences in schema projetse to anon, authenticated, service_role;
grant execute on all functions in schema projetse to anon, authenticated, service_role;

alter default privileges in schema projetse
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

alter default privileges in schema projetse
  grant usage, select on sequences to anon, authenticated, service_role;

alter default privileges in schema projetse
  grant execute on functions to anon, authenticated, service_role;

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
