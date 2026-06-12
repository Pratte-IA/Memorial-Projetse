-- EPIC-02: RLS e funções de autorização do schema projetse.

-- ---------------------------------------------------------------------------
-- Funções de autorização (security definer)
-- ---------------------------------------------------------------------------

create or replace function projetse.current_profile_id()
returns bigint
language sql
stable
security definer
set search_path = projetse
as $$
  select p.id
  from projetse.profiles p
  where p.user_id = auth.uid()
  limit 1;
$$;

create or replace function projetse.is_org_member(p_org_id bigint)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select exists (
    select 1
    from projetse.organization_members om
    join projetse.profiles p on p.id = om.profile_id
    where om.organization_id = p_org_id
      and om.status = 'active'
      and p.user_id = auth.uid()
  );
$$;

create or replace function projetse.member_role(p_org_id bigint)
returns text
language sql
stable
security definer
set search_path = projetse
as $$
  select om.role
  from projetse.organization_members om
  join projetse.profiles p on p.id = om.profile_id
  where om.organization_id = p_org_id
    and om.status = 'active'
    and p.user_id = auth.uid()
  limit 1;
$$;

create or replace function projetse.has_org_role(p_org_id bigint, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select coalesce(projetse.member_role(p_org_id) = any (p_roles), false);
$$;

create or replace function projetse.can_manage_org(p_org_id bigint)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select projetse.has_org_role(p_org_id, array['admin', 'gestora']);
$$;

create or replace function projetse.can_edit_technical(p_org_id bigint)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select projetse.has_org_role(
    p_org_id,
    array['admin', 'gestora', 'responsavel_tecnica']
  );
$$;

create or replace function projetse.can_review(p_org_id bigint)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select projetse.has_org_role(
    p_org_id,
    array['admin', 'gestora', 'responsavel_tecnica', 'revisora']
  );
$$;

create or replace function projetse.empreendimento_org_id(p_empreendimento_id bigint)
returns bigint
language sql
stable
security definer
set search_path = projetse
as $$
  select e.organization_id
  from projetse.empreendimentos e
  where e.id = p_empreendimento_id
  limit 1;
$$;

create or replace function projetse.can_access_empreendimento(p_empreendimento_id bigint)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select projetse.is_org_member(projetse.empreendimento_org_id(p_empreendimento_id));
$$;

create or replace function projetse.log_audit_event(
  p_organization_id bigint,
  p_empreendimento_id bigint,
  p_event_type text,
  p_description text,
  p_metadata jsonb default null
)
returns bigint
language plpgsql
security definer
set search_path = projetse
as $$
declare
  v_event_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Autenticação obrigatória';
  end if;

  if not projetse.is_org_member(p_organization_id) then
    raise exception 'Sem permissão para registrar auditoria';
  end if;

  insert into projetse.audit_events (
    organization_id,
    empreendimento_id,
    profile_id,
    event_type,
    description,
    metadata
  )
  values (
    p_organization_id,
    p_empreendimento_id,
    projetse.current_profile_id(),
    p_event_type,
    p_description,
    p_metadata
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

grant execute on function projetse.current_profile_id() to authenticated;
grant execute on function projetse.is_org_member(bigint) to authenticated;
grant execute on function projetse.member_role(bigint) to authenticated;
grant execute on function projetse.has_org_role(bigint, text[]) to authenticated;
grant execute on function projetse.can_manage_org(bigint) to authenticated;
grant execute on function projetse.can_edit_technical(bigint) to authenticated;
grant execute on function projetse.can_review(bigint) to authenticated;
grant execute on function projetse.empreendimento_org_id(bigint) to authenticated;
grant execute on function projetse.can_access_empreendimento(bigint) to authenticated;
grant execute on function projetse.log_audit_event(bigint, bigint, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Habilitar RLS
-- ---------------------------------------------------------------------------

alter table projetse.organizations enable row level security;
alter table projetse.profiles enable row level security;
alter table projetse.organization_members enable row level security;
alter table projetse.incorporadoras enable row level security;
alter table projetse.representantes_legais enable row level security;
alter table projetse.empreendimentos enable row level security;
alter table projetse.imoveis enable row level security;
alter table projetse.imovel_confrontacoes enable row level security;
alter table projetse.dados_tecnicos enable row level security;
alter table projetse.quadros_tecnicos enable row level security;
alter table projetse.dados_extraidos enable row level security;
alter table projetse.unidades_autonomas enable row level security;
alter table projetse.modelos_documento enable row level security;
alter table projetse.clausulas enable row level security;
alter table projetse.memoriais enable row level security;
alter table projetse.memorial_secoes enable row level security;
alter table projetse.document_exports enable row level security;
alter table projetse.pendencias enable row level security;
alter table projetse.audit_events enable row level security;

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

create policy organizations_select_member
  on projetse.organizations for select to authenticated
  using (projetse.is_org_member(id));

create policy organizations_update_manager
  on projetse.organizations for update to authenticated
  using (projetse.can_manage_org(id))
  with check (projetse.can_manage_org(id));

create policy organizations_insert_admin
  on projetse.organizations for insert to authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy profiles_select_own_or_org
  on projetse.profiles for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from projetse.organization_members om_self
      join projetse.organization_members om_other on om_other.organization_id = om_self.organization_id
      where om_self.profile_id = projetse.current_profile_id()
        and om_other.profile_id = projetse.profiles.id
        and om_self.status = 'active'
        and om_other.status = 'active'
    )
  );

create policy profiles_update_own
  on projetse.profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy profiles_insert_own
  on projetse.profiles for insert to authenticated
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------

create policy organization_members_select_member
  on projetse.organization_members for select to authenticated
  using (projetse.is_org_member(organization_id));

create policy organization_members_insert_admin
  on projetse.organization_members for insert to authenticated
  with check (projetse.has_org_role(organization_id, array['admin']));

create policy organization_members_update_admin
  on projetse.organization_members for update to authenticated
  using (projetse.has_org_role(organization_id, array['admin']))
  with check (projetse.has_org_role(organization_id, array['admin']));

create policy organization_members_delete_admin
  on projetse.organization_members for delete to authenticated
  using (projetse.has_org_role(organization_id, array['admin']));

-- ---------------------------------------------------------------------------
-- Tabelas com organization_id
-- ---------------------------------------------------------------------------

create policy incorporadoras_select
  on projetse.incorporadoras for select to authenticated
  using (projetse.is_org_member(organization_id));

create policy incorporadoras_write
  on projetse.incorporadoras for all to authenticated
  using (projetse.can_edit_technical(organization_id))
  with check (projetse.can_edit_technical(organization_id));

create policy modelos_documento_select
  on projetse.modelos_documento for select to authenticated
  using (projetse.is_org_member(organization_id));

create policy modelos_documento_write
  on projetse.modelos_documento for all to authenticated
  using (projetse.can_manage_org(organization_id))
  with check (projetse.can_manage_org(organization_id));

create policy clausulas_select
  on projetse.clausulas for select to authenticated
  using (projetse.is_org_member(organization_id));

create policy clausulas_write
  on projetse.clausulas for all to authenticated
  using (projetse.can_manage_org(organization_id))
  with check (projetse.can_manage_org(organization_id));

-- ---------------------------------------------------------------------------
-- empreendimentos e dependentes
-- ---------------------------------------------------------------------------

create policy empreendimentos_select
  on projetse.empreendimentos for select to authenticated
  using (projetse.is_org_member(organization_id));

create policy empreendimentos_insert
  on projetse.empreendimentos for insert to authenticated
  with check (projetse.can_edit_technical(organization_id));

create policy empreendimentos_update
  on projetse.empreendimentos for update to authenticated
  using (projetse.can_edit_technical(organization_id))
  with check (projetse.can_edit_technical(organization_id));

create policy empreendimentos_delete
  on projetse.empreendimentos for delete to authenticated
  using (projetse.can_manage_org(organization_id));

-- representantes_legais (via incorporadora)
create policy representantes_legais_select
  on projetse.representantes_legais for select to authenticated
  using (
    exists (
      select 1 from projetse.incorporadoras i
      where i.id = incorporadora_id and projetse.is_org_member(i.organization_id)
    )
  );

create policy representantes_legais_write
  on projetse.representantes_legais for all to authenticated
  using (
    exists (
      select 1 from projetse.incorporadoras i
      where i.id = incorporadora_id and projetse.can_edit_technical(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from projetse.incorporadoras i
      where i.id = incorporadora_id and projetse.can_edit_technical(i.organization_id)
    )
  );

-- Macro para tabelas ligadas a empreendimento_id
create policy imoveis_access
  on projetse.imoveis for all to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id))
  with check (projetse.can_access_empreendimento(empreendimento_id));

create policy imovel_confrontacoes_access
  on projetse.imovel_confrontacoes for all to authenticated
  using (
    exists (
      select 1 from projetse.imoveis i
      where i.id = imovel_id and projetse.can_access_empreendimento(i.empreendimento_id)
    )
  )
  with check (
    exists (
      select 1 from projetse.imoveis i
      where i.id = imovel_id and projetse.can_access_empreendimento(i.empreendimento_id)
    )
  );

create policy dados_tecnicos_access
  on projetse.dados_tecnicos for all to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id))
  with check (projetse.can_access_empreendimento(empreendimento_id));

create policy quadros_tecnicos_select
  on projetse.quadros_tecnicos for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy quadros_tecnicos_write
  on projetse.quadros_tecnicos for insert to authenticated
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy quadros_tecnicos_update
  on projetse.quadros_tecnicos for update to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy dados_extraidos_select
  on projetse.dados_extraidos for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy dados_extraidos_write
  on projetse.dados_extraidos for all to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy unidades_autonomas_select
  on projetse.unidades_autonomas for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy unidades_autonomas_write
  on projetse.unidades_autonomas for all to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy memoriais_select
  on projetse.memoriais for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy memoriais_write
  on projetse.memoriais for all to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy memorial_secoes_select
  on projetse.memorial_secoes for select to authenticated
  using (
    exists (
      select 1 from projetse.memoriais m
      where m.id = memorial_id and projetse.can_access_empreendimento(m.empreendimento_id)
    )
  );

create policy memorial_secoes_write
  on projetse.memorial_secoes for all to authenticated
  using (
    exists (
      select 1 from projetse.memoriais m
      where m.id = memorial_id
        and projetse.can_review(projetse.empreendimento_org_id(m.empreendimento_id))
    )
  )
  with check (
    exists (
      select 1 from projetse.memoriais m
      where m.id = memorial_id
        and projetse.can_review(projetse.empreendimento_org_id(m.empreendimento_id))
    )
  );

create policy document_exports_select
  on projetse.document_exports for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy document_exports_write
  on projetse.document_exports for all to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));

create policy pendencias_select
  on projetse.pendencias for select to authenticated
  using (projetse.can_access_empreendimento(empreendimento_id));

create policy pendencias_write
  on projetse.pendencias for all to authenticated
  using (projetse.can_review(projetse.empreendimento_org_id(empreendimento_id)))
  with check (projetse.can_review(projetse.empreendimento_org_id(empreendimento_id)));

-- ---------------------------------------------------------------------------
-- audit_events
-- ---------------------------------------------------------------------------

create policy audit_events_select
  on projetse.audit_events for select to authenticated
  using (projetse.is_org_member(organization_id));

-- Insert apenas via função security definer (sem policy de insert direto)
