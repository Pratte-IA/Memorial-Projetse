-- EPIC-03: usuários demo para testes de auth e RLS.
-- Senha padrão de todos: Projetse@2026 (alterar em produção).

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_org_id bigint;
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_password text := extensions.crypt('Projetse@2026', extensions.gen_salt('bf'));
begin
  select id into v_org_id from projetse.organizations where slug = 'projetse' limit 1;

  if v_org_id is null then
    raise exception 'Organização Projetse não encontrada. Execute o seed da EPIC-02 primeiro.';
  end if;

  if exists (select 1 from auth.users where email = 'admin@projetse.com.br') then
    raise notice 'Usuários demo já existem — ignorando seed.';
    return;
  end if;

  -- Admin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    v_instance_id,
    'a1000001-0001-4001-8001-000000000001',
    'authenticated', 'authenticated',
    'admin@projetse.com.br', v_password,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Projetse"}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    'a1000001-0001-4001-8001-000000000001',
    jsonb_build_object(
      'sub', 'a1000001-0001-4001-8001-000000000001',
      'email', 'admin@projetse.com.br',
      'email_verified', true
    ),
    'email',
    'a1000001-0001-4001-8001-000000000001',
    now(), now(), now()
  );

  -- Gestora
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    v_instance_id,
    'a1000002-0002-4002-8002-000000000002',
    'authenticated', 'authenticated',
    'marcos@projetse.com.br', v_password,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Marcos Souza"}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    'a1000002-0002-4002-8002-000000000002',
    jsonb_build_object(
      'sub', 'a1000002-0002-4002-8002-000000000002',
      'email', 'marcos@projetse.com.br',
      'email_verified', true
    ),
    'email',
    'a1000002-0002-4002-8002-000000000002',
    now(), now(), now()
  );

  -- Responsável técnica
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    v_instance_id,
    'a1000003-0003-4003-8003-000000000003',
    'authenticated', 'authenticated',
    'francieli@projetse.com.br', v_password,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Francieli Lima"}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    'a1000003-0003-4003-8003-000000000003',
    jsonb_build_object(
      'sub', 'a1000003-0003-4003-8003-000000000003',
      'email', 'francieli@projetse.com.br',
      'email_verified', true
    ),
    'email',
    'a1000003-0003-4003-8003-000000000003',
    now(), now(), now()
  );

  -- Revisora
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    v_instance_id,
    'a1000004-0004-4004-8004-000000000004',
    'authenticated', 'authenticated',
    'ana@projetse.com.br', v_password,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Técnica"}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    'a1000004-0004-4004-8004-000000000004',
    jsonb_build_object(
      'sub', 'a1000004-0004-4004-8004-000000000004',
      'email', 'ana@projetse.com.br',
      'email_verified', true
    ),
    'email',
    'a1000004-0004-4004-8004-000000000004',
    now(), now(), now()
  );

  -- Vínculos com a organização Projetse (profiles criados pelo trigger)
  insert into projetse.organization_members (organization_id, profile_id, role, status)
  select v_org_id, p.id, 'admin', 'active'
  from projetse.profiles p
  where p.user_id = 'a1000001-0001-4001-8001-000000000001';

  insert into projetse.organization_members (organization_id, profile_id, role, status)
  select v_org_id, p.id, 'gestora', 'active'
  from projetse.profiles p
  where p.user_id = 'a1000002-0002-4002-8002-000000000002';

  insert into projetse.organization_members (organization_id, profile_id, role, status)
  select v_org_id, p.id, 'responsavel_tecnica', 'active'
  from projetse.profiles p
  where p.user_id = 'a1000003-0003-4003-8003-000000000003';

  insert into projetse.organization_members (organization_id, profile_id, role, status)
  select v_org_id, p.id, 'revisora', 'active'
  from projetse.profiles p
  where p.user_id = 'a1000004-0004-4004-8004-000000000004';

  -- Responsável do empreendimento seed
  update projetse.empreendimentos e
  set responsavel_profile_id = p.id
  from projetse.profiles p
  where e.nome = 'Residencial Madrid'
    and p.user_id = 'a1000003-0003-4003-8003-000000000003';

  raise notice 'Usuários demo criados para a organização %', v_org_id;
end;
$$;
