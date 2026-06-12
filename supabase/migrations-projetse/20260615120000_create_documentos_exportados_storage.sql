-- EPIC-10: bucket privado para documentos exportados + policies de storage

create or replace function projetse.can_access_storage_documento(object_path text)
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

create or replace function projetse.can_write_storage_documento(object_path text)
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

grant execute on function projetse.can_access_storage_documento(text) to authenticated;
grant execute on function projetse.can_write_storage_documento(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos-exportados',
  'documentos-exportados',
  false,
  52428800,
  array[
    'application/pdf',
    'application/rtf',
    'application/vnd.ms-word',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists projetse_documentos_exportados_select on storage.objects;
drop policy if exists projetse_documentos_exportados_insert on storage.objects;
drop policy if exists projetse_documentos_exportados_update on storage.objects;
drop policy if exists projetse_documentos_exportados_delete on storage.objects;

create policy projetse_documentos_exportados_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documentos-exportados'
    and projetse.can_access_storage_documento(name)
  );

create policy projetse_documentos_exportados_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documentos-exportados'
    and projetse.can_write_storage_documento(name)
  );

create policy projetse_documentos_exportados_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documentos-exportados'
    and projetse.can_write_storage_documento(name)
  )
  with check (
    bucket_id = 'documentos-exportados'
    and projetse.can_write_storage_documento(name)
  );

create policy projetse_documentos_exportados_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documentos-exportados'
    and projetse.can_write_storage_documento(name)
  );
