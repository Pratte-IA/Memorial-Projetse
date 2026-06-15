-- Cláusulas 6–12 do memorial (complemento do seed inicial).

do $$
declare
  r record;
begin
  for r in
    select m.organization_id, m.id as modelo_id
    from projetse.modelos_documento m
    where m.tipo ilike '%Memorial%'
  loop

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 6
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Sexta – Da Descrição das Unidades Autônomas',
        'Unidades Autônomas',
        'Descrição completa das unidades autônomas por torre, pavimento, apartamento, metragem e fração ideal.',
        'Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira nº 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei nº 4.591, assim se descrevem as futuras unidades autônomas do condomínio:\n\n{{listaUnidades}}',
        array['listaUnidades'],
        'publicada', 6
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 7
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Sétima – Da Destinação das Unidades Autônomas',
        'Unidades Autônomas',
        'Remete a destinação à Convenção Condominial e Regimento Interno.',
        'A destinação das unidades autônomas e tudo que às mesmas unidades se referirem, estão tratadas na Convenção Condominial e Regimento Interno do {{empreendimento.nome}}, doravante denominada exclusivamente Convenção, elaborada em cumprimento ao Artigo 9º, da citada Lei nº 4.591, de 16 de dezembro de 1964, conforme Cláusula a seguir.',
        array['empreendimento.nome'],
        'publicada', 7
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 8
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Oitava – Convenção Condominial e Regimento Interno',
        'Convenção Condominial',
        'Convenção e Regimento completos: 7 capítulos e 32 artigos.',
        'Capítulo I – Direitos e Deveres

Artigo 1. São direitos dos condôminos: a) usar, gozar e dispor da respectiva unidade autônoma, de acordo com o respectivo destino (residencial e comercial), desde que não prejudiquem à segurança e solidez do condomínio, que não causem dano aos demais condôminos, e não infrinjam as normas legais ou às disposições desta Convenção; b) usar e gozar das partes comuns do condomínio, desde que não impeçam idêntico uso ou gozo por parte do outro condômino, com as mesmas restrições da alínea anterior; c) examinar a qualquer tempo os livros e arquivos da administração e pedir esclarecimentos ao administrador ou síndico; d) não desviar os empregados do condomínio para serviços internos de suas unidades autônomas; e) comparecer às assembléias e nelas discutir e votar; f) denunciar ao síndico qualquer irregularidade que observem.

Artigo 2. São deveres dos condôminos: a) guardar decoro e respeito no uso das coisas e partes comuns, não as usando nem permitindo que as usem, bem como as respectivas unidades autônomas para fins diversos daqueles a que se destinem; b) não usar as respectivas unidades autônomas, nem alugá-las ou cedê-las para atividades ruidosas, ou a pessoas de maus costumes, ou para instalação de qualquer atividade ou depósito de objeto capaz de causar danos ao prédio ou incômodo aos demais condôminos; c) remover pós de tapetes, cortinas ou partes das unidades autônomas senão com aspiradores dotados de dispositivos que impeçam a sua dispersão; d) não estender roupas, tapetes ou quaisquer outros objetos nas janelas, ou em quaisquer lugares que sejam visíveis do exterior, ou de onde estejam expostos ao risco de caírem; e) não lançar quaisquer objetos ou líquidos sobre a via pública e área interna; f) colocar lixo, detritos, etc., no lugar designado para tanto; g) não decorar as paredes, portas e esquadrias externas com cores ou tonalidades diversas das empregadas no condomínio; h) não colocar nem deixar que se coloquem nas partes comuns do condomínio quaisquer objetos de instalações, sejam de que natureza forem; i) não utilizar os empregados do condomínio para serviços particulares; j) não manter nas respectivas unidades autônomas, substâncias, instalações ou aparelhos que causem perigo à segurança e à solidez do condomínio ou incômodo aos demais condôminos; k) não sobrecarregar a estrutura e as lajes do condomínio com peso superior a 300 kg por metro quadrado; l) não fracionar a respectiva unidade autônoma para fim de aliená-la a mais de uma pessoa separadamente; m) contribuir para as despesas comuns do condomínio na proporção adiante expressa, efetuando os recolhimentos nas ocasiões oportunas; n) contribuir para o custeio de obras determinadas pela Assembleia, na forma e na proporção adiante definida; o) permitir o ingresso, em sua unidade autônoma, do administrador ou preposto seu quando isto se torne indispensável à inspeção ou realização de trabalhos relativos à estrutura geral do condomínio, sua segurança e solidez, ou indispensável à realização de reparos em instalações e tubulações na unidade autônoma vizinha; p) não permitir a realização de jogos infantis em quaisquer das partes comuns do condomínio que não tenham essa destinação; q) comunicar imediatamente ao síndico a ocorrência de moléstia contagiosa em sua unidade autônoma; r) não promover a dispersão de sons ou ruídos gerados em sua unidade autônoma de modo que possam ser percebidos nas unidades autônomas vizinhas, no período compreendido entre às 22:00 horas de um dia as 08:00 horas do dia seguinte, de segunda a sexta, das 12:00 às 24:00 horas de sábado e em nenhum horário durante domingos e feriados.

Capítulo II – Das Assembleias Gerais

Artigo 3. As Assembleias Gerais serão convocadas mediante carta registrada ou protocolizada pelo síndico ou por um quarto dos condôminos, e serão realizadas no próprio condomínio, salvo motivo de força maior. § 1º As convocações indicarão o resumo da ordem do dia, a data, a hora e o local da assembleia, e serão assinadas pelo síndico ou pelo condômino que a fizer. § 2º As convocações das assembleias gerais ordinárias serão acompanhadas de cópias do relatório e contas do administrador, bem como da proposta de orçamento relativo ao exercício respectivo. § 3º Entre a data da convocação e a da assembleia deverá mediar um prazo de cinco dias, no mínimo. § 4º As assembleias extraordinárias poderão ser convocadas com prazo mais curto do que o mencionado no parágrafo anterior, quando houver comprovada urgência. § 5º É lícito, no mesmo anúncio, fixar o momento em que se realizará a assembleia em primeira e em segunda convocação, mediando entre ambas, o período de uma hora, no mínimo. § 6º O síndico endereçará as convocações para as unidades dos respectivos condôminos, salvo se tiverem estes, feito em tempo oportuno comunicação de outro endereço para o qual devam ser remetidas.

Artigo 4. As assembleias serão presididas por um condômino ou não, que lavrará a ata dos trabalhos no livro próprio.

Artigo 5. Cada unidade representará um voto e as decisões só poderão ser unânimes, observando o disposto no Artigo 8 e seus parágrafos.

Artigo 6. É lícito fazer o condômino representar, nas assembléias, por procurador com poderes especiais, condômino ou não.

Artigo 7. A assembleia geral ordinária realizar-se-á anualmente no primeiro dia útil do mês a que corresponder à primeira assembleia geral ordinária, e a ela compete: a) discutir e votar o relatório e as contas da administração relativas ao ano findo; b) discutir e votar o orçamento das despesas para o ano em curso, fixando fundos de reserva; c) eleger o síndico, fixando-lhe a remuneração; d) votar as demais matérias constantes da ordem do dia.

Artigo 8. As assembleias gerais ordinárias só realizar-se-ão com a presença dos condôminos que representarem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º Caso um condômino injustificadamente ou por impedimento não possa comparecer à assembleia, o outro condômino poderá requerer à custa do condômino ausente, junto ao Juízo competente, o suprimento de seu comparecimento e voto. § 2º Em caso de empate a decisão será tomada judicialmente, por Juiz de Direito.

Artigo 9. As assembleias gerais extraordinárias só realizar-se-ão com a presença dos condôminos que representem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º As assembleias gerais extraordinárias serão convocadas pelo síndico ou por um condômino, pelo mesmo processo e nos mesmos prazos exigidos para convocação das assembleias ordinárias. § 2º Aplica-se às assembleias gerais extraordinárias as disposições sobre as assembleias gerais ordinárias, no que couber.

Artigo 10. Compete nas assembleias extraordinárias: a) deliberar sobre matéria de interesse geral do condomínio ou dos condôminos; b) decidir em grau de recurso os assuntos que tenham sido deliberados pelo síndico e a elas levadas a pedido do interessado ou dos interessados; c) apreciar as demais matérias constantes da ordem do dia; d) examinar os assuntos que lhes sejam propostos por qualquer condômino; e) destituir o síndico a qualquer tempo, independentemente de justificação e sem indenização.

Artigo 11. As deliberações das assembleias gerais serão obrigatórias a todos os condôminos, cumprindo ao síndico executá-las e fazê-las cumprir. § único. Nos oito dias que se seguirem à assembleia, o administrador enviará cópia aos condôminos por carta registrada ou protocolizada, de relato das deliberações na assembleia tomadas.

Artigo 12. Das assembleias gerais serão lavradas atas em livro próprio, aberto, encerrado, rubricado e assinado pelo síndico. § único. As despesas com a Assembleia Geral serão inscritas a débito do condomínio, mas relativas à assembleia convocada para apreciação de recurso do condômino serão pagas por este, se o recurso for desprovido.

Capítulo III – Da Administração

Artigo 13. A administração do condomínio caberá a um síndico, condômino ou não, eleito em assembleia geral ordinária, pelo prazo de dois anos, podendo ser reeleito. § único. Ao síndico compete: a) representar os condôminos em juízo ou fora dele, ativa ou passivamente, em tudo que se referir aos assuntos de interesse da comunhão; b) superintender a administração do condomínio; c) cumprir e fazer cumprir a lei, a presente convenção e as deliberações das assembleias; d) admitir e demitir empregados, bem como fixar a respectiva remuneração; e) ordenar reparos urgentes ou adquirir o que seja necessário à segurança ou conservação do condomínio; f) executar fielmente as disposições orçamentárias aprovadas pela assembleia; g) convocar as assembleias gerais ordinárias nas épocas próprias e as extraordinárias quando julgar conveniente ou lhe for requerido fundamentalmente por no mínimo um condômino; h) prestar, a qualquer tempo, informações sobre os atos da administração; i) prestar à assembleia contas de sua gestão, acompanhadas da documentação respectiva e oferecer proposta de orçamento para o exercício seguinte; j) manter e escriturar livro-caixa, devidamente aberto, encerrado, rubricado e assinado; l) cobrar, inclusive em juízo, as quotas que couberem em rateio aos condôminos, nas despesas normais ou extraordinárias do condomínio, aprovadas pela assembleia, bem como as multas impostas por infração de disposições legais ou desta convenção; m) comunicar à assembleia as citações que receber; n) procurar, por meios suasórios, dirimir divergências entre os condôminos; o) entregar ao seu sucessor todos os livros, documentos e pertences em seu poder; p) manter guardada, durante o prazo de cinco anos, para eventuais necessidades de verificação contábil, toda a documentação relativa ao condomínio, devendo guardar por mais tempo os documentos que tiverem de fazer prova por período superior a cinco anos.

Artigo 14. O síndico poderá delegar suas funções administrativas a terceiros de sua confiança, mas sob sua exclusiva responsabilidade.

Artigo 15. O administrador receberá a remuneração mensal que lhe for fixada pela assembleia geral.

Artigo 16. Em caso de vaga, a assembleia elegerá outro síndico que exercerá o mandato pelo tempo restante. Em caso de destituição, o síndico prestará imediatamente contas de sua gestão.

Artigo 17. O síndico não é responsável pessoalmente pelas obrigações contraídas em nome do condomínio, desde que tenha agido no exercício regular de suas atribuições, responderá, porém, pelo excesso de representação e pelos prejuízos a que der causa, por dolo ou culpa.

Artigo 18. Ao zelador, nomeado pelo síndico do condomínio e considerado empregado do condomínio, compete: a) exercer a vigilância do condomínio; b) manter em perfeitas condições de conservação e asseio das partes comuns do condomínio; c) comunicar ao síndico, imediatamente, quaisquer irregularidades havidas no condomínio, ou na sua utilização pelos condôminos, bem como qualquer circunstância que lhe pareça anormal; d) executar as instruções do síndico.

Capítulo IV – Do Conselho Fiscal ou Consultivo

Artigo 19. Não haverá conselho consultivo ou fiscal, cabendo aos condôminos que representarem a maioria das unidades do condomínio qualquer atividade relacionada à função deste conselho.

Capítulo V – Do Orçamento do Condomínio

Artigo 20. Constituem despesas comuns do condomínio: a) as relativas à conservação, limpeza, reparações e reconstrução das partes e coisas comuns; b) as relativas ao zelador; c) as relativas à manutenção das partes e coisas comuns; d) o prêmio do seguro do condomínio e dos empregados; e) os impostos e taxas que incidam sobre as partes e coisas comuns do condomínio; f) a remuneração do síndico, zelador e a dos demais empregados do condomínio, bem como as relativas aos encargos de Previdência e Assistência Social; g) o Fundo de Reserva de 10% (dez por cento) à maior que cabe ao condomínio no rateio mensal a título de despesas condominiais, se aceito em assembleia geral ordinária.

Artigo 21. Compete à Assembleia fixar o orçamento das despesas comuns e cabe aos condôminos concorrer para o custeio das referidas despesas, até o dia cinco (5) do mês subsequente ao da efetivação das despesas, realizando-se o rateio em proporções iguais à cada unidade autônoma.

Artigo 22. Serão igualmente rateadas entre os condôminos as despesas extraordinárias dentro de quinze dias a contar da data da assembleia que as autorizar, salvo se nesta oportunidade for estabelecido prazo diferente, ou se forem adicionadas à quota normal do condomínio.

Artigo 23. Ficarão a cargo exclusivo de cada condômino as despesas a que der causa. § único. O disposto neste artigo é extensivo aos prejuízos causados às partes comuns do condomínio, pela omissão do condômino na execução dos trabalhos ou reparações na sua unidade autônoma.

Artigo 24. O saldo remanescente do orçamento de um exercício será incorporado ao exercício seguinte, se outro destino não lhe for dado pela assembleia ordinária. O déficit verificado será rateado entre os condôminos e arrecadado no prazo de quinze dias.

Artigo 25. O condomínio será segurado contra incêndio ou qualquer outro risco que possa vir a destruí-lo no todo ou em parte, em companhia idônea com aprovação da assembleia, pelo respectivo valor, discriminando-se na apólice o de cada unidade. § único. É lícito a cada condômino, individualmente e às expensas próprias, aumentar o seguro de sua unidade autônoma, ou segurar as benfeitorias e melhoramentos por ele introduzidas na mesma.

Artigo 26. Ocorrido o sinistro total ou a destruição de mais de dois terços do condomínio, os condôminos que representarem as unidades do condomínio se reunirão em assembleia geral dentro de quinze dias e elegerão quem os representará para: a) receber a indenização e depositá-la em nome do condomínio no estabelecimento bancário designado pela assembleia, respeitado o parágrafo único do artigo 25; b) abrir concorrência para a reconstrução do prédio ou de suas partes destruídas, comunicando o resultado à assembleia geral para a devida deliberação; c) acompanhar os trabalhos de reconstrução até final, representando os condôminos junto aos construtores, fornecedores, empreiteiros e repartições públicas.

Artigo 27. Não sendo acordado entre os condôminos a reconstrução das partes destruídas, será feita a venda do terreno, partilhando-se o seu preço e o valor entre os condôminos, respeitando o parágrafo único do artigo 25.

Artigo 28. Em caso de incêndio parcial, recolhido o seguro, proceder-se-á à reparação ou reconstrução das partes destruídas.

Capítulo VI – Das Penalidades

Artigo 29. Os condôminos em atraso com o pagamento das respectivas contribuições, pagarão o juro de 1% (um por cento) ao mês, e até 20% (vinte por cento) sobre o débito, contados a partir da data do vencimento do respectivo prazo, independentemente de interpelação, até uma mora de trinta dias. Findo este prazo, poderá o síndico cobrar-lhe o débito judicialmente, sujeitando-se, ainda, ao pagamento das custas e honorários de advogado e à correção monetária de seu débito, segundo os índices levantados pelos órgãos governamentais.

Artigo 30. Além das penas cominadas em lei, fica ainda o condômino ou possuidor, que não cumprir reiteradamente com os seus deveres perante o condomínio, que por deliberação de três quartos dos condôminos restantes, ser constrangido a pagar multa correspondente até ao quíntuplo do valor atribuído à contribuição para as despesas condominiais, conforme a gravidade das faltas e a reiteração, independentemente das perdas e danos que se apurarem. Além de que, o condômino ou possuidor que, por seu reiterado comportamento anti-social, gerar incompatibilidade de convivência com os demais condôminos ou possuidores, poderá ser constrangido a pagar multa correspondente ao décuplo do valor atribuído à contribuição para as despesas condominiais, até ulterior deliberação da assembleia. § único. A multa será imposta e cobrada pelo síndico, com recurso do interessado para a Assembleia Geral.

Capítulo VII – Disposições Gerais e Transitórias

Artigo 31. A presente convenção, que sujeita a todo ocupante ainda que eventual do condomínio ou de qualquer de suas partes, obriga a todos os condôminos, seus sub-rogados e sucessores a título universal ou singular, e somente poderá ser modificada mediante a aprovação de 2/3 (dois terços) dos votos dos condôminos a alteração da convenção, bem como a mudança da destinação do edifício ou da unidade imobiliária.

Artigo 32. Fica eleito o foro da Comarca de Cascavel-PR para todo tipo de ação ou execução decorrente da aplicação de qualquer dos dispositivos constantes nesta convenção.',
        array[]::text[],
        'publicada', 8
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 9
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Nona – Do Regime de Incorporação',
        'Incorporação',
        'Define a incorporação em etapas com base na Lei 4.864/65 e Lei 4.591/64.',
        'A incorporadora, utilizando-se do disposto no art. 6º, da Lei nº 4.864, de 29.11.1965, combinado com o art. 9º, parágrafo 4º, da citada Lei nº 4.591, de 1964, convenciona que a incorporação imobiliária do {{empreendimento.nome}}, será em {{empreendimento.qtdEtapas}} etapas, que serão aleatórias, dependendo da conclusão de cada uma das torres, conforme emissão do Habite-se.',
        array['empreendimento.nome', 'empreendimento.qtdEtapas'],
        'publicada', 9
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 10
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Décima – Do Prazo de Carência',
        'Incorporação',
        'Declara inexistência de prazo de carência, pois as obras de edificação já foram iniciadas.',
        'Não haverá prazo de carência, haja visto que as obras de edificação já foram iniciadas.',
        array[]::text[],
        'publicada', 10
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 11
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Décima Primeira – Da Regularidade Fiscal',
        'Incorporação',
        'Declaração de regularidade fiscal e previdenciária da incorporadora.',
        'De acordo com o que dispõe o Artigo 257, Inciso III, do Decreto Federal nº 3.408, de 6 de maio de 1999, publicado no Diário Oficial da União em 7 de maio de 1999, retificado conforme publicação no mesmo Diário em 12 de maio de 1999 (com a redação que lhe foi dada pelos Decretos Federais nº 3.265, de 29 de novembro de 1999 (DOU 30/11/1999), 3.298, de 20 de dezembro de 1999 (DOU 21/12/1999), 3.452, de 9 de maio de 2000 (DOU 09/05/2000) e 3.668, de 22 de novembro de 2000 (DOU 23/11/2000), e Item 5-III, da Ordem de Serviço nº 207, de 8 de abril de 1999, da Diretoria de Arrecadação e Fiscalização do Instituto Nacional do Seguro Social – INSS, publicada no Diário Oficial da União em 15 de abril de 1999, retificada conforme publicação no mesmo Diário em 16 e 19 de abril de 1999, combinado com os Artigos 29, Parágrafo Único, 30 e 32, alínea "f", da Lei Federal nº 4.591, de 16 de dezembro de 1964, a incorporadora declara, para fins de registro da Incorporação imobiliária do condomínio do Residencial Madrid, que está em dia com o recolhimento de contribuições à Previdência Social e que apresenta junto com este instrumento a Certidão Negativa de Débitos – CND, da Certidão Positiva de Débitos – CPD ou da Certidão Positiva de Débitos com Efeitos de Negativa – CPD-EM, do citado INSS.',
        array[]::text[],
        'publicada', 11
      );
    end if;

    if not exists (
      select 1 from projetse.clausulas c
      where c.organization_id = r.organization_id and c.ordem = 12
    ) then
      insert into projetse.clausulas (organization_id, modelo_id, titulo, categoria, resumo, template, variaveis, status, ordem)
      values (
        r.organization_id, r.modelo_id,
        'Décima Segunda – Do Registro',
        'Registro',
        'Solicita registro da incorporação e da Convenção (em resumo) ao Cartório.',
        'Em face de tudo expresso, a incorporadora requer ao Registrador, do Terceiro Serviço de Registro de Imóveis da Comarca de {{empreendimento.comarca}} que promova os seguintes atos: primeiro, o registro da incorporação imobiliária; segundo, o registro da Convenção Condominial e Regimento Interno; não havendo necessidade de registrar a convenção na íntegra, mas resumida, fornecendo-lhe, em seguida, cópia deste instrumento e certidão probatória de todos os atos; terceiro, todos os demais atos necessários para o pleno registro deste instrumento.',
        array['empreendimento.comarca'],
        'publicada', 12
      );
    end if;

  end loop;
end $$;
