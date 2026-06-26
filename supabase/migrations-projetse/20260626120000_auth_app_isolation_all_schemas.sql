-- Isolamento de schemas via app_metadata + inferência por domínio de e-mail.
-- Corrige vazamento cruzado entre projetse, studium e demais apps no auth.users compartilhado.

-- ---------------------------------------------------------------------------
-- core: resolve qual app "possui" o usuário auth
-- ---------------------------------------------------------------------------

create schema if not exists core;

comment on schema core is 'Utilitários compartilhados entre apps do Supabase multi-schema';

create or replace function core.resolve_auth_user_app(p_user auth.users)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_explicit text;
  v_email text;
begin
  v_explicit := nullif(trim(p_user.raw_app_meta_data ->> 'app'), '');
  if v_explicit is not null then
    return v_explicit;
  end if;

  v_email := lower(coalesce(p_user.email, ''));

  if v_email like '%@projetse.com.br' then
    return 'projetse';
  end if;

  if v_email like '%@studium.local' then
    return 'studium';
  end if;

  if v_email like '%@usuarios.crisrelojoaria.local' then
    return 'crisrelojoaria';
  end if;

  if v_email like '%@casadasbicicletas.local' then
    return 'casadasbicicletas';
  end if;

  if v_email like '%@eventosvilaencantada.com.br' then
    return 'vila';
  end if;

  if v_email like '%@retirotabor.local' or v_email like '%@retirotabor.com.br' then
    return 'retirotabor';
  end if;

  if v_email like '%@wekids.local' or v_email like '%@wekids.com.br' then
    return 'wekids';
  end if;

  if v_email like '%@prattegestaoclientes.local' or v_email like '%@pratte.com.br' then
    return 'prattegestaoclientes';
  end if;

  return null;
end;
$$;

comment on function core.resolve_auth_user_app(auth.users) is
  'Retorna app explícito (raw_app_meta_data.app) ou inferido pelo domínio do e-mail.';

grant usage on schema core to postgres, service_role, authenticated;
grant execute on function core.resolve_auth_user_app(auth.users) to postgres, service_role;

-- ---------------------------------------------------------------------------
-- Backfill: marca app em usuários existentes sem metadado
-- ---------------------------------------------------------------------------

update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('app', core.resolve_auth_user_app(u))
where nullif(trim(u.raw_app_meta_data ->> 'app'), '') is null
  and core.resolve_auth_user_app(u) is not null;

-- ---------------------------------------------------------------------------
-- Limpeza: remove perfis criados no schema errado
-- ---------------------------------------------------------------------------

delete from studium.profiles p
using auth.users u
where p.auth_user_id = u.id
  and core.resolve_auth_user_app(u) = 'projetse';

delete from projetse.profiles p
using auth.users u
where p.user_id = u.id
  and core.resolve_auth_user_app(u) = 'studium';

-- ---------------------------------------------------------------------------
-- projetse: trigger só cria perfil para app projetse
-- ---------------------------------------------------------------------------

create or replace function projetse.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = projetse, public
as $$
begin
  if core.resolve_auth_user_app(new) is distinct from 'projetse' then
    return new;
  end if;

  insert into projetse.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- studium: trigger só cria perfil para app studium
-- ---------------------------------------------------------------------------

create or replace function studium.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = studium, public
as $$
begin
  if core.resolve_auth_user_app(new) is distinct from 'studium' then
    return new;
  end if;

  insert into studium.profiles (auth_user_id, nome, email, cpf, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Usuario'),
    coalesce(new.email, new.id::text),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'cpf', ''), '\D', '', 'g'), ''),
    coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;
