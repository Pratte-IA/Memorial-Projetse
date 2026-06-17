-- Cláusula sexta (orçamento): texto padrão conforme NBR 12.721 com valores do quadro e lista por unidade.

do $$
declare
  v_template text := 'De acordo com a referida Norma Brasileira nº 12.721/2006, o custo da edificação foi orçado em {{orcamento.valor}} ({{orcamento.valorExtenso}}), com base no Custo Unitário Básico (CUB) {{orcamento.cubDesignacao}} padrão {{orcamento.padraoAcabamento}} do mês de {{orcamento.mesReferenciaCub}}, fornecido pelo {{orcamento.sindicatoCub}}, atribuindo ao metro quadrado da construção o valor de {{orcamento.custoMetroQuadrado}} ({{orcamento.custoMetroQuadradoExtenso}}), sendo que o custo de cada unidade autônoma foi orçado da mesma forma: {{listaOrcamentoUnidades}}';
  v_variaveis text[] := array[
    'orcamento.valor',
    'orcamento.valorExtenso',
    'orcamento.cubDesignacao',
    'orcamento.padraoAcabamento',
    'orcamento.mesReferenciaCub',
    'orcamento.sindicatoCub',
    'orcamento.custoMetroQuadrado',
    'orcamento.custoMetroQuadradoExtenso',
    'listaOrcamentoUnidades'
  ];
begin
  update projetse.clausulas
  set
    template = v_template,
    variaveis = v_variaveis,
    resumo = 'Declara o custo da edificação com base no CUB e no orçamento por unidade autônoma do quadro NBR 12.721.'
  where titulo ilike '%orçamento%';
end $$;
