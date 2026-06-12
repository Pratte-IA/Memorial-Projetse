-- EPIC-02: seeds iniciais — Organização Projetse + Residencial Madrid.
-- Idempotente: não duplica se já existir organização com slug 'projetse'.

do $$
declare
  v_org_id bigint;
  v_incorp_id bigint;
  v_emp_id bigint;
  v_modelo_id bigint;
  v_memorial_id bigint;
  v_imovel_id bigint;
  v_idx integer := 0;
  v_torre text;
  v_ti integer;
  v_g integer;
  v_p integer;
  v_a integer;
  v_num text;
begin
  if exists (select 1 from projetse.organizations where slug = 'projetse') then
    raise notice 'Seed Projetse já aplicado — ignorando.';
    return;
  end if;

  insert into projetse.organizations (name, slug)
  values ('Projetse', 'projetse')
  returning id into v_org_id;

  insert into projetse.incorporadoras (organization_id, razao_social, cnpj, endereco)
  values (
    v_org_id,
    'Pitangueiras SPE LTDA',
    '63.310.140/0001-86',
    jsonb_build_object(
      'logradouro', 'Rua Ilhas Canárias',
      'numero', '359',
      'cidade', 'Cascavel',
      'uf', 'PR'
    )
  )
  returning id into v_incorp_id;

  insert into projetse.representantes_legais (incorporadora_id, nome, cpf, estado_civil)
  values (
    v_incorp_id,
    'Representante Legal Pitangueiras',
    '000.000.000-00',
    'casado'
  );

  insert into projetse.empreendimentos (
    organization_id,
    nome,
    incorporadora_id,
    cidade,
    uf,
    endereco,
    lote,
    quadra,
    matricula,
    status,
    progresso,
    pendencias_count
  )
  values (
    v_org_id,
    'Residencial Madrid',
    v_incorp_id,
    'Cascavel',
    'PR',
    'Rua Ilhas Canárias, nº 359',
    '13',
    '04',
    '48.291',
    'em_revisao',
    72,
    4
  )
  returning id into v_emp_id;

  insert into projetse.dados_tecnicos (
    empreendimento_id,
    area_terreno,
    area_global,
    area_privativa_total,
    area_comum_total,
    torres,
    pavimentos,
    unidades,
    vagas,
    alvara,
    data_aprovacao,
    responsavel_tecnico,
    crea_cau,
    art_rrt
  )
  values (
    v_emp_id,
    2763.0,
    3113.58,
    2598.0,
    515.58,
    3,
    5,
    60,
    60,
    'AL-2025/3812',
    '2026-01-12',
    'Francieli Luize Wagner Lima',
    '158.605 D/PR',
    'ART 2026/PR/00482'
  );

  insert into projetse.imoveis (
    empreendimento_id,
    lote_numero,
    lote_extenso,
    quadra_numero,
    quadra_extenso,
    loteamento,
    cidade,
    comarca,
    uf,
    estado_extenso,
    area_numero,
    area_extenso,
    matricula_numero,
    matricula_extenso,
    cartorio
  )
  values (
    v_emp_id,
    '13',
    'treze',
    '04',
    'quatro',
    'Residencial Madrid',
    'Cascavel',
    'Cascavel',
    'PR',
    'Paraná',
    2763.0,
    'dois mil setecentos e sessenta e três metros quadrados',
    '48.291',
    'quarenta e oito mil duzentos e noventa e um',
    '3º Serviço de Registro de Imóveis da Comarca de Cascavel'
  )
  returning id into v_imovel_id;

  insert into projetse.imovel_confrontacoes (imovel_id, direcao, confrontante, medida, ordem)
  values
    (v_imovel_id, 'noroeste', 'Rua Ilhas Canárias', '45,20 m', 1),
    (v_imovel_id, 'nordeste', 'Lote 14', '62,10 m', 2),
    (v_imovel_id, 'sudeste', 'Área verde municipal', '45,20 m', 3),
    (v_imovel_id, 'sudoeste', 'Lote 12', '62,10 m', 4);

  insert into projetse.modelos_documento (organization_id, nome, tipo, status)
  values (
    v_org_id,
    'Memorial de Incorporação — Padrão Projetse',
    'Memorial completo',
    'ativo'
  )
  returning id into v_modelo_id;

  insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
  values
    (
      v_org_id, v_modelo_id,
      'Primeira – Qualificação da Incorporadora',
      'Incorporação',
      'Bloco padrão de qualificação jurídica da SPE incorporadora.',
      '{{incorporadora.razaoSocial}}, sociedade de propósito específico, com sede {{incorporadora.endereco}}, na cidade de {{incorporadora.cidade}}/{{incorporadora.uf}}, inscrita no CNPJ/MF sob o nº {{incorporadora.cnpj}}, representada por seu sócio administrador: {{incorporadora.representante.nome}}, na qualidade de Incorporadora, convenciona este Instrumento Particular de Memorial de Incorporação do {{empreendimento.nome}}.',
      array['incorporadora.razaoSocial', 'incorporadora.endereco', 'incorporadora.cidade', 'incorporadora.uf', 'incorporadora.cnpj', 'empreendimento.nome'],
      'publicada', 1
    ),
    (
      v_org_id, v_modelo_id,
      'Segunda – Da Propriedade e Localização do Imóvel',
      'Propriedade e Localização',
      'Qualificação do imóvel, confrontações, matrícula, área e cartório de registro.',
      'O imóvel objeto desta incorporação é o lote de terreno urbano sob nº {{imovel.loteNumero}} ({{imovel.loteNumeroExtenso}}), da quadra nº {{imovel.quadraNumero}} ({{imovel.quadraNumeroExtenso}}), localizado na {{empreendimento.endereco}}, na cidade de {{imovel.cidade}}, Estado do {{imovel.uf}}, com área total de {{imovel.area}} ({{imovel.areaExtenso}}), conforme matrícula nº {{imovel.matricula}} do {{imovel.cartorio}}.',
      array['imovel.loteNumero', 'imovel.quadraNumero', 'imovel.cidade', 'imovel.uf', 'imovel.area', 'imovel.matricula', 'empreendimento.endereco'],
      'publicada', 2
    ),
    (
      v_org_id, v_modelo_id,
      'Terceira – Da Incorporação Imobiliária',
      'Incorporação',
      'Declaração de incorporação nos termos da Lei 4.591/64.',
      'Que, pretendendo ela Incorporadora alienar frações do descrito terreno, representativas de unidades autônomas de edificações a serem erigidas sobre o mesmo imóvel, promove a incorporação imobiliária de tais edificações, sob a denominação de {{empreendimento.nome}}.',
      array['empreendimento.nome'],
      'publicada', 3
    ),
    (
      v_org_id, v_modelo_id,
      'Quarta – Da Composição do Condomínio',
      'Composição do Condomínio',
      'Define áreas global, privativa, comum, torres, pavimentos e unidades.',
      'O Condomínio com área total a ser edificada de {{empreendimento.areaGlobal}}, será constituído de {{empreendimento.torres}} torres, divididas em {{empreendimento.pavimentos}} pavimentos cada, com {{empreendimento.unidades}} apartamentos e {{empreendimento.vagas}} vagas de garagem.',
      array['empreendimento.areaGlobal', 'empreendimento.torres', 'empreendimento.pavimentos', 'empreendimento.unidades', 'empreendimento.vagas'],
      'publicada', 4
    ),
    (
      v_org_id, v_modelo_id,
      'Quinta – Da Aprovação do Projeto Arquitetônico',
      'Aprovação de Projeto',
      'Cita alvará municipal, data, responsável técnico, CREA/CAU e ART/RRT.',
      'O projeto arquitetônico da edificação foi aprovado conforme Alvará de Construção nº {{aprovacao.alvara}}, expedido em {{aprovacao.data}}. Responsável técnica: {{responsavelProjeto.nome}}, CREA {{responsavelProjeto.crea}}, ART {{responsavelProjeto.art}}.',
      array['aprovacao.alvara', 'aprovacao.data', 'responsavelProjeto.nome', 'responsavelProjeto.crea', 'responsavelProjeto.art'],
      'publicada', 5
    );

  insert into projetse.memoriais (empreendimento_id, versao, status)
  values (v_emp_id, 1, 'em_revisao')
  returning id into v_memorial_id;

  insert into projetse.memorial_secoes (memorial_id, titulo, conteudo, status, ordem)
  values
    (
      v_memorial_id,
      'Primeira – Qualificação da Incorporadora',
      'PITANGUEIRAS SPE LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 63.310.140/0001-86, com sede na cidade de Cascavel, Estado do Paraná, vem submeter a registro o presente Memorial de Incorporação.',
      'aprovada', 1
    ),
    (
      v_memorial_id,
      'Segunda – Da Propriedade e Localização do Imóvel',
      'O imóvel objeto desta incorporação é o lote de terreno urbano sob nº 13 (treze), da quadra nº 04 (quatro), localizado na Rua Ilhas Canárias, nº 359, na cidade de Cascavel, Estado do Paraná, com área total de 2.763,00 m², conforme matrícula nº 48.291.',
      'aprovada', 2
    ),
    (
      v_memorial_id,
      'Terceira – Da Incorporação Imobiliária',
      'Promove a incorporação imobiliária das edificações sob a denominação de RESIDENCIAL MADRID.',
      'em_revisao', 3
    ),
    (
      v_memorial_id,
      'Quarta – Da Composição do Condomínio',
      'O Condomínio com área total a ser edificada de 3.113,58 m² será constituído de 03 torres, divididas em 5 pavimentos cada, com 60 apartamentos e 60 vagas de garagem.',
      'em_revisao', 4
    ),
    (
      v_memorial_id,
      'Sexta – Da Descrição das Unidades Autônomas',
      'Conforme os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, assim se descrevem as futuras unidades autônomas do condomínio:',
      'com_pendencia', 6
    );

  -- 60 unidades (equivalente ao mock gerarUnidades)
  for v_ti in 0..2 loop
    v_torre := 'Torre 0' || (v_ti + 1);

    for v_g in 1..4 loop
      v_idx := v_idx + 1;
      insert into projetse.unidades_autonomas (
        empreendimento_id, nome, torre, pavimento, tipo,
        area_privativa, area_comum, area_total, area_garden,
        vaga, fracao, status, confrontacoes
      )
      values (
        v_emp_id,
        'Apartamento Garden 0' || v_g,
        v_torre,
        'Térreo',
        'Garden',
        43.3, 8.593, 51.893, 12.5,
        'V-' || lpad(v_idx::text, 3, '0'),
        '1,667%',
        case when v_g = 1 then 'validado' when v_g = 2 then 'pendente' else 'nao_revisado' end,
        'Norte: hall social. Sul: jardim. Leste: ap. vizinho. Oeste: fachada.'
      );
    end loop;

    for v_p in 1..4 loop
      for v_a in 1..4 loop
        v_idx := v_idx + 1;
        v_num := v_p::text || '0' || v_a::text;
        insert into projetse.unidades_autonomas (
          empreendimento_id, nome, torre, pavimento, tipo,
          area_privativa, area_comum, area_total, area_garden,
          vaga, fracao, status, confrontacoes
        )
        values (
          v_emp_id,
          'Apartamento ' || v_num,
          v_torre,
          v_p || 'º Pavimento',
          'Tipo',
          43.3, 8.593, 51.893, 0,
          'V-' || lpad(v_idx::text, 3, '0'),
          '1,667%',
          case
            when v_ti = 0 and v_p = 1 then 'inconsistencia'
            when v_idx % 5 = 0 then 'pendente'
            else 'validado'
          end,
          'Norte: corredor de circulação. Sul: fachada. Leste: ap. vizinho. Oeste: poço de ventilação.'
        );
      end loop;
    end loop;
  end loop;

  insert into projetse.pendencias (empreendimento_id, entidade_tipo, severidade, mensagem, status)
  values
    (v_emp_id, 'memorial_secao', 'atencao', 'Seção "Unidades Autônomas" com pendências de revisão.', 'aberta'),
    (v_emp_id, 'unidade_autonoma', 'atencao', 'Unidades com status pendente aguardam validação.', 'aberta'),
    (v_emp_id, 'dados_tecnico', 'info', 'Conferir áreas comuns do pavimento térreo.', 'aberta'),
    (v_emp_id, 'memorial_secao', 'bloqueante', 'Inconsistência em unidade da Torre 01 — 1º pavimento.', 'aberta');

  insert into projetse.audit_events (organization_id, empreendimento_id, event_type, description, metadata)
  values
    (v_org_id, v_emp_id, 'criacao', 'Empreendimento criado.', jsonb_build_object('fonte', 'seed')),
    (v_org_id, v_emp_id, 'upload', 'Enviou o quadro técnico NBR 12.721.', jsonb_build_object('fonte', 'seed')),
    (v_org_id, v_emp_id, 'extracao', 'Extração concluída: 60 unidades identificadas.', jsonb_build_object('fonte', 'seed')),
    (v_org_id, v_emp_id, 'validacao', 'Validou 56 de 60 unidades autônomas.', jsonb_build_object('fonte', 'seed')),
    (v_org_id, v_emp_id, 'aprovacao', 'Aprovou a seção "Composição do Condomínio".', jsonb_build_object('fonte', 'seed'));

  raise notice 'Seed Projetse aplicado: org=%, empreendimento=%', v_org_id, v_emp_id;
end;
$$;
