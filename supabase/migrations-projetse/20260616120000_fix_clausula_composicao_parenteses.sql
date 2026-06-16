-- Remove parênteses duplicados na cláusula de composição do condomínio
-- (áreas privativas/comum não repetem valor por extenso entre parênteses aninhados).

do $$
declare
  v_template text := 'O Condomínio com área total a ser edificada de {{empreendimento.areaTotalEdificada}} ({{empreendimento.areaTotalEdificadaExtenso}}), será constituído de {{empreendimento.qtdTorres}} ({{empreendimento.qtdTorresExtenso}}) torres, divididas em {{empreendimento.qtdPavimentos}} ({{empreendimento.qtdPavimentosExtenso}}) pavimentos cada, e uma área comum, a saber: {{areasPavimentos}}. A composição do condomínio será a seguinte: a) Partes de propriedade exclusiva (áreas privativas de {{empreendimento.areaPrivativa}}): às quais serão {{empreendimento.qtdUnidades}} ({{empreendimento.qtdUnidadesExtenso}}) apartamentos e {{empreendimento.qtdVagas}} ({{empreendimento.qtdVagasExtenso}}) vagas de garagem descobertas, acessórias às unidades autônomas; b) Partes de propriedade comum (áreas de uso comum de {{empreendimento.areaComum}}): que serão: {{empreendimento.areasComuns}}. Tudo conforme alocado no referido projeto arquitetônico.';
  v_variaveis text[] := array[
    'empreendimento.areaTotalEdificada',
    'empreendimento.areaTotalEdificadaExtenso',
    'empreendimento.qtdTorres',
    'empreendimento.qtdTorresExtenso',
    'empreendimento.qtdPavimentos',
    'empreendimento.qtdPavimentosExtenso',
    'areasPavimentos',
    'empreendimento.areaPrivativa',
    'empreendimento.qtdUnidades',
    'empreendimento.qtdUnidadesExtenso',
    'empreendimento.qtdVagas',
    'empreendimento.qtdVagasExtenso',
    'empreendimento.areaComum',
    'empreendimento.areasComuns'
  ];
begin
  update projetse.clausulas
  set
    template = v_template,
    variaveis = v_variaveis
  where titulo ilike '%composição%'
    and template ilike '%areaPrivativaExtenso%';
end $$;
