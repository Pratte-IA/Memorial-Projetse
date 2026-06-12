-- Memorial Projetse — verificação de RLS (executar no SQL Editor do Supabase)
-- Critério Go-Live: todas as tabelas do schema projetse com RLS habilitado.

select
  c.relname as tabela,
  c.relrowsecurity as rls_habilitado,
  (
    select count(*)
    from pg_policies p
    where p.schemaname = 'projetse'
      and p.tablename = c.relname
  ) as total_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'projetse'
  and c.relkind = 'r'
  and c.relname not like 'pg_%'
order by c.relname;

-- Buckets de storage esperados (via storage.buckets):
--   quadros-tecnicos (privado)
--   documentos-exportados (privado)

select id, name, public
from storage.buckets
where id in ('quadros-tecnicos', 'documentos-exportados');

-- Smoke test manual (com usuário autenticado na app):
-- 1. Login teste@projetse.com.br — deve ver org Projetse e empreendimento Madrid.
-- 2. Usuário de outra org não deve listar empreendimentos da Projetse.
-- 3. Download de quadro/export só com path da própria org.
