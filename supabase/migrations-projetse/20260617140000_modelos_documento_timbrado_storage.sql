-- Timbrado (arquivo DOCX) vinculado ao modelo de documento + bucket privado

alter table projetse.modelos_documento
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint;

-- ---------------------------------------------------------------------------
-- Storage: path {organization_id}/{modelo_id}/arquivo.docx
-- ---------------------------------------------------------------------------

create or replace function projetse.can_access_storage_modelo(object_path text)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select
    split_part(object_path, '/', 1) ~ '^[0-9]+$'
    and split_part(object_path, '/', 2) ~ '^[0-9]+$'
    and projetse.is_org_member(split_part(object_path, '/', 1)::bigint);
$$;

create or replace function projetse.can_write_storage_modelo(object_path text)
returns boolean
language sql
stable
security definer
set search_path = projetse
as $$
  select
    split_part(object_path, '/', 1) ~ '^[0-9]+$'
    and split_part(object_path, '/', 2) ~ '^[0-9]+$'
    and projetse.can_manage_org(split_part(object_path, '/', 1)::bigint);
$$;

grant execute on function projetse.can_access_storage_modelo(text) to authenticated;
grant execute on function projetse.can_write_storage_modelo(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'modelos-documento',
  'modelos-documento',
  false,
  20971520,
  array['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists projetse_modelos_documento_select on storage.objects;
drop policy if exists projetse_modelos_documento_insert on storage.objects;
drop policy if exists projetse_modelos_documento_update on storage.objects;
drop policy if exists projetse_modelos_documento_delete on storage.objects;

create policy projetse_modelos_documento_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'modelos-documento'
    and projetse.can_access_storage_modelo(name)
  );

create policy projetse_modelos_documento_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'modelos-documento'
    and projetse.can_write_storage_modelo(name)
  );

create policy projetse_modelos_documento_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'modelos-documento'
    and projetse.can_write_storage_modelo(name)
  )
  with check (
    bucket_id = 'modelos-documento'
    and projetse.can_write_storage_modelo(name)
  );

create policy projetse_modelos_documento_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'modelos-documento'
    and projetse.can_write_storage_modelo(name)
  );
