-- EPIC-01: schema oficial de negócio do Memorial Projetse.
-- Tabelas de negócio serão criadas em migrations subsequentes (EPIC-02+).

create schema if not exists projetse;

comment on schema projetse is 'Schema oficial de negócio do Memorial Projetse';

grant usage on schema projetse to postgres, service_role;
grant usage on schema projetse to authenticated;
grant usage on schema projetse to anon;
