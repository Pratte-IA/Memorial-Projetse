-- EPIC-06: bucket privado para quadros técnicos + policies de storage

-- ---------------------------------------------------------------------------
-- Funções auxiliares para validar paths: {organization_id}/{empreendimento_id}/arquivo.pdf
-- ---------------------------------------------------------------------------

create or replace function projetse.can_access_storage_quadro(object_path text)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select
    split_part(object_path, '/', 1) ~ '^[0-9]+$'
    and split_part(object_path, '/', 2) ~ '^[0-9]+$'
    and projetse.is_org_member(split_part(object_path, '/', 1)::bigint)
    and projetse.can_access_empreendimento(split_part(object_path, '/', 2)::bigint);
$$;

create or replace function projetse.can_write_storage_quadro(object_path text)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select
    split_part(object_path, '/', 1) ~ '^[0-9]+$'
    and split_part(object_path, '/', 2) ~ '^[0-9]+$'
    and projetse.can_edit_technical(split_part(object_path, '/', 1)::bigint)
    and projetse.can_access_empreendimento(split_part(object_path, '/', 2)::bigint);
$$;

grant execute on function projetse.can_access_storage_quadro(text) to authenticated;
grant execute on function projetse.can_write_storage_quadro(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Bucket privado
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quadros-tecnicos',
  'quadros-tecnicos',
  false,
  52428800,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Policies de storage (path com organization_id/empreendimento_id)
-- ---------------------------------------------------------------------------

drop policy if exists projetse_quadros_tecnicos_select on storage.objects;
drop policy if exists projetse_quadros_tecnicos_insert on storage.objects;
drop policy if exists projetse_quadros_tecnicos_update on storage.objects;
drop policy if exists projetse_quadros_tecnicos_delete on storage.objects;

create policy projetse_quadros_tecnicos_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'quadros-tecnicos'
    and projetse.can_access_storage_quadro(name)
  );

create policy projetse_quadros_tecnicos_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'quadros-tecnicos'
    and projetse.can_write_storage_quadro(name)
  );

create policy projetse_quadros_tecnicos_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'quadros-tecnicos'
    and projetse.can_write_storage_quadro(name)
  )
  with check (
    bucket_id = 'quadros-tecnicos'
    and projetse.can_write_storage_quadro(name)
  );

create policy projetse_quadros_tecnicos_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'quadros-tecnicos'
    and projetse.can_write_storage_quadro(name)
  );

-- Permite substituir quadro (remoção do registro anterior, se necessário)
drop policy if exists quadros_tecnicos_delete on projetse.quadros_tecnicos;

create policy quadros_tecnicos_delete
  on projetse.quadros_tecnicos for delete to authenticated
  using (projetse.can_edit_technical(projetse.empreendimento_org_id(empreendimento_id)));
