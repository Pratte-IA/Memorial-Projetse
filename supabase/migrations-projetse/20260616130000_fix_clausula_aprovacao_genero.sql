-- Cláusula de aprovação: linguagem inclusiva do(a) / Engenheiro(a) / inscrito(a).

do $$
declare
  v_template text := 'O projeto arquitetônico da edificação foi aprovado pela {{aprovacao.orgao}}, em {{aprovacao.data}}, conforme Alvará de Construção nº {{aprovacao.alvara}}, expedido pela {{aprovacao.prefeitura}}. A responsabilidade técnica pelo projeto arquitetônico e pela elaboração dos quadros da NBR 12.721 é do(a) Engenheiro(a) Civil {{responsavelProjeto.nome}}, inscrito(a) no CREA/CAU sob nº {{responsavelProjeto.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelProjeto.art}}. A responsabilidade técnica pela execução da obra é do(a) Engenheiro(a) Civil {{responsavelObra.nome}}, inscrito(a) no CREA/CAU sob nº {{responsavelObra.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelObra.art}}.';
  v_variaveis text[] := array[
    'aprovacao.orgao',
    'aprovacao.data',
    'aprovacao.alvara',
    'aprovacao.prefeitura',
    'responsavelProjeto.nome',
    'responsavelProjeto.crea',
    'responsavelProjeto.art',
    'responsavelObra.nome',
    'responsavelObra.crea',
    'responsavelObra.art'
  ];
begin
  update projetse.clausulas
  set
    template = v_template,
    variaveis = v_variaveis
  where titulo ilike '%aprovação%'
    and template ilike '%responsavelProjeto.formacao%';
end $$;
