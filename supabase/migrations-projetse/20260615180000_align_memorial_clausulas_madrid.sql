-- Alinha cláusulas e seções do memorial à estrutura do PDF Madrid (preâmbulo + 12 cláusulas).
-- Idempotente: usa palavras-chave no título para reconciliar registros existentes.

do $$
declare
  r record;
  v_modelo_id bigint;
  v_memorial_id bigint;
  v_orcamento_template text := 'O custo global estimado da edificação, para fins do presente memorial de incorporação, é de {{orcamento.valor}} ({{orcamento.valorExtenso}}), correspondente a {{orcamento.cubMultiplicador}} ({{orcamento.cubMultiplicadorExtenso}}) vezes o CUB (Custo Unitário Básico) de {{orcamento.cubValor}} ({{orcamento.cubValorExtenso}}), referente ao mês de {{orcamento.mesReferencia}}/{{orcamento.anoReferencia}}, divulgado pelo Sinduscon {{orcamento.regiaoCub}}.';
begin
  for r in
    select o.id as org_id, m.id as modelo_id
    from projetse.organizations o
    join projetse.modelos_documento m on m.organization_id = o.id and m.tipo ilike '%Memorial%'
  loop
    v_modelo_id := r.modelo_id;

    update projetse.clausulas
    set titulo = 'Qualificação da Incorporadora', ordem = 0, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%qualificação%';

    update projetse.clausulas
    set titulo = 'Primeira – Da Propriedade e Localização do Imóvel', ordem = 1, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%propriedade%';

    update projetse.clausulas
    set
      titulo = 'Segunda – Da Incorporação Imobiliária',
      ordem = 2,
      template = 'Que, pretendendo ela Incorporadora alienar frações do descrito terreno, representativas de unidades autônomas de edificações a serem erigidas sobre o mesmo imóvel, promove à incorporação imobiliária de tais edificações, para a ordenação jurídica da Lei nº 4.591, de 16 de dezembro de 1964, e todas as suas regulamentações e alterações posteriores, e do art. 1.331 e seguintes, da Lei nº 10.406 (Código Civil), de 10 de janeiro de 2002 (com vigência a partir de 11 de janeiro de 2003), e com a instituição de Condomínio Urbano Simples nos termos da Lei nº 13.465/17 e do Decreto Federal nº 9.310/18, na forma de condomínio edilício ou por unidades autônomas, sob a denominação de {{empreendimento.nome}}.',
      status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%incorporação imobiliária%';

    update projetse.clausulas
    set titulo = 'Terceira – Da Composição do Condomínio', ordem = 3, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%composição%';

    update projetse.clausulas
    set titulo = 'Quarta – Da Aprovação do Projeto Arquitetônico', ordem = 4, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%aprovação%';

    update projetse.clausulas
    set titulo = 'Quinta – Da Descrição das Unidades Autônomas', ordem = 5, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%descrição das unidades%';

    if not exists (
      select 1 from projetse.clausulas
      where organization_id = r.org_id and titulo ilike '%orçamento%'
    ) then
      insert into projetse.clausulas (
        organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem
      ) values (
        r.org_id,
        v_modelo_id,
        'Sexta – Do Orçamento da Edificação',
        'Orçamento',
        'Declara o custo global estimado da edificação com base no CUB de referência.',
        v_orcamento_template,
        array[
          'orcamento.valor', 'orcamento.valorExtenso', 'orcamento.cubMultiplicador',
          'orcamento.cubMultiplicadorExtenso', 'orcamento.cubValor', 'orcamento.cubValorExtenso',
          'orcamento.mesReferencia', 'orcamento.anoReferencia', 'orcamento.regiaoCub'
        ],
        'publicada',
        6
      );
    else
      update projetse.clausulas
      set titulo = 'Sexta – Do Orçamento da Edificação', ordem = 6, template = v_orcamento_template, status = 'publicada'
      where organization_id = r.org_id and titulo ilike '%orçamento%';
    end if;

    update projetse.clausulas
    set titulo = 'Sétima – Da Destinação das Unidades Autônomas', ordem = 7, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%destinação%';

    update projetse.clausulas
    set titulo = 'Oitava – Convenção Condominial e Regimento Interno', ordem = 8, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%convenção%';

    update projetse.clausulas
    set titulo = 'Nona – Do Regime de Incorporação', ordem = 9, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%regime de incorporação%';

    update projetse.clausulas
    set titulo = 'Décima – Do Prazo de Carência', ordem = 10, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%prazo de carência%';

    update projetse.clausulas
    set titulo = 'Décima Primeira – Da Regularidade Fiscal', ordem = 11, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%regularidade fiscal%';

    update projetse.clausulas
    set titulo = 'Décima Segunda – Do Registro', ordem = 12, status = 'publicada'
    where organization_id = r.org_id and titulo ilike '%registro%' and titulo not ilike '%cartório%';

    -- Reconcilia seções dos memoriais existentes
    for v_memorial_id in
      select mem.id
      from projetse.memoriais mem
      join projetse.empreendimentos emp on emp.id = mem.empreendimento_id
      where emp.organization_id = r.org_id
    loop
      update projetse.memorial_secoes ms
      set titulo = c.titulo, ordem = c.ordem, clausula_id = c.id
      from projetse.clausulas c
      where ms.memorial_id = v_memorial_id
        and c.organization_id = r.org_id
        and (
          (ms.titulo ilike '%qualificação%' and c.ordem = 0) or
          (ms.titulo ilike '%propriedade%' and c.ordem = 1) or
          (ms.titulo ilike '%incorporação imobiliária%' and c.ordem = 2) or
          (ms.titulo ilike '%composição%' and c.ordem = 3) or
          (ms.titulo ilike '%aprovação%' and c.ordem = 4) or
          (ms.titulo ilike '%descrição das unidades%' and c.ordem = 5) or
          (ms.titulo ilike '%orçamento%' and c.ordem = 6) or
          (ms.titulo ilike '%destinação%' and c.ordem = 7) or
          (ms.titulo ilike '%convenção%' and c.ordem = 8) or
          (ms.titulo ilike '%regime de incorporação%' and c.ordem = 9) or
          (ms.titulo ilike '%prazo de carência%' and c.ordem = 10) or
          (ms.titulo ilike '%regularidade fiscal%' and c.ordem = 11) or
          (ms.titulo ilike '%registro%' and c.ordem = 12 and ms.titulo not ilike '%cartório%')
        );

      insert into projetse.memorial_secoes (memorial_id, clausula_id, titulo, conteudo, status, ordem)
      select v_memorial_id, c.id, c.titulo, null, 'nao_gerada', c.ordem
      from projetse.clausulas c
      where c.organization_id = r.org_id
        and c.status = 'publicada'
        and not exists (
          select 1 from projetse.memorial_secoes ms
          where ms.memorial_id = v_memorial_id
            and (ms.clausula_id = c.id or ms.titulo = c.titulo)
        );
    end loop;
  end loop;
end $$;
