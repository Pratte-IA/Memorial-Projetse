-- EPIC-11: configurações persistidas na organização

alter table projetse.organizations
  add column if not exists settings jsonb not null default '{}'::jsonb;

update projetse.organizations
set settings = jsonb_build_object(
  'razao_social', 'Projetse Engenharia e Arquitetura LTDA',
  'cnpj', '12.345.678/0001-90',
  'endereco', 'Rua das Palmeiras, 1.020 — Cascavel/PR',
  'responsavel_tecnico', 'Francieli Luize Wagner Lima',
  'export_prefs', jsonb_build_object(
    'incluir_logo', true,
    'numerar_paginas', true,
    'marca_dagua_revisao', false,
    'anexar_quadros', true
  )
)
where slug = 'projetse'
  and (settings = '{}'::jsonb or settings is null);
