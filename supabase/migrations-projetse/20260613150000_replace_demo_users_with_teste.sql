-- Substitui usuários demo anteriores por um único admin de testes.
-- E-mail: teste@projetse.com.br | Senha: Projetse@2026

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_org_id bigint;
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_password text := extensions.crypt('Projetse@2026', extensions.gen_salt('bf'));
  v_teste_user_id uuid := 'b1000001-0001-4001-8001-000000000001';
  v_old_emails text[] := array[
    'admin@projetse.com.br',
    'marcos@projetse.com.br',
    'francieli@projetse.com.br',
    'ana@projetse.com.br'
  ];
begin
  select id into v_org_id from projetse.organizations where slug = 'projetse' limit 1;

  if v_org_id is null then
    raise exception 'Organização Projetse não encontrada.';
  end if;

  -- Remove vínculos e usuários demo antigos
  delete from projetse.organization_members om
  using projetse.profiles p
  join auth.users u on u.id = p.user_id
  where om.profile_id = p.id
    and u.email = any (v_old_emails);

  update projetse.empreendimentos e
  set responsavel_profile_id = null
  from projetse.profiles p
  join auth.users u on u.id = p.user_id
  where e.responsavel_profile_id = p.id
    and u.email = any (v_old_emails);

  delete from auth.identities i
  using auth.users u
  where i.user_id = u.id
    and u.email = any (v_old_emails);

  delete from auth.users
  where email = any (v_old_emails);

  -- Cria usuário único de testes (admin)
  if not exists (select 1 from auth.users where email = 'teste@projetse.com.br') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      v_instance_id,
      v_teste_user_id,
      'authenticated', 'authenticated',
      'teste@projetse.com.br', v_password,
      now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Usuário Teste Projetse"}'::jsonb,
      now(), now()
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_teste_user_id,
      jsonb_build_object(
        'sub', v_teste_user_id::text,
        'email', 'teste@projetse.com.br',
        'email_verified', true
      ),
      'email',
      v_teste_user_id::text,
      now(), now(), now()
    );
  end if;

  -- Garante membership admin (perfil criado pelo trigger projetse_on_auth_user_created)
  insert into projetse.organization_members (organization_id, profile_id, role, status)
  select v_org_id, p.id, 'admin', 'active'
  from projetse.profiles p
  where p.user_id = (select id from auth.users where email = 'teste@projetse.com.br' limit 1)
  on conflict (organization_id, profile_id) do update
    set role = 'admin', status = 'active';

  update projetse.empreendimentos e
  set responsavel_profile_id = p.id
  from projetse.profiles p
  where e.nome = 'Residencial Madrid'
    and p.user_id = (select id from auth.users where email = 'teste@projetse.com.br' limit 1);

  raise notice 'Usuário teste@projetse.com.br configurado como admin da organização %', v_org_id;
end;
$$;
