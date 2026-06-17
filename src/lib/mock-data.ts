export type EmpreendimentoStatus =
  | "Rascunho"
  | "Quadro enviado"
  | "Dados extraídos"
  | "Em validação"
  | "Pronto para gerar"
  | "Memorial gerado"
  | "Em revisão"
  | "Aprovado"
  | "Exportado";

export type Empreendimento = {
  id: string;
  nome: string;
  incorporadora: string;
  cnpj: string;
  cidade: string;
  uf: string;
  endereco: string;
  lote: string;
  quadra: string;
  matricula: string;
  responsavel: string;
  status: EmpreendimentoStatus;
  atualizadoEm: string;
  progresso: number;
  pendencias: number;
  areaTerreno: number;
  areaGlobal: number;
  torres: number;
  pavimentos: number;
  unidades: number;
  vagas: number;
  alvara: string;
  dataAprovacao: string;
  crea: string;
  art: string;
};

export const empreendimentos: Empreendimento[] = [
  {
    id: "residencial-madrid",
    nome: "Residencial Madrid",
    incorporadora: "Pitangueiras SPE LTDA",
    cnpj: "63.310.140/0001-86",
    cidade: "Cascavel",
    uf: "PR",
    endereco: "Rua Ilhas Canárias, nº 359",
    lote: "13",
    quadra: "04",
    matricula: "48.291",
    responsavel: "Francieli Luize Wagner Lima",
    status: "Em revisão",
    atualizadoEm: "15/04/2026",
    progresso: 72,
    pendencias: 4,
    areaTerreno: 2763.0,
    areaGlobal: 3113.58,
    torres: 3,
    pavimentos: 5,
    unidades: 60,
    vagas: 60,
    alvara: "AL-2025/3812",
    dataAprovacao: "12/01/2026",
    crea: "158.605 D/PR",
    art: "ART 2026/PR/00482",
  },
  {
    id: "residencial-aurora",
    nome: "Residencial Aurora",
    incorporadora: "Aurora Incorporações",
    cnpj: "21.402.118/0001-44",
    cidade: "Toledo",
    uf: "PR",
    endereco: "Av. Maripá, nº 1.205",
    lote: "07",
    quadra: "12",
    matricula: "52.110",
    responsavel: "Ana Técnica",
    status: "Dados extraídos",
    atualizadoEm: "12/04/2026",
    progresso: 38,
    pendencias: 9,
    areaTerreno: 1840.0,
    areaGlobal: 2210.4,
    torres: 2,
    pavimentos: 4,
    unidades: 32,
    vagas: 40,
    alvara: "AL-2025/4011",
    dataAprovacao: "20/02/2026",
    crea: "162.118 D/PR",
    art: "ART 2026/PR/00611",
  },
  {
    id: "edificio-piemonte",
    nome: "Edifício Piemonte",
    incorporadora: "Piemonte SPE",
    cnpj: "33.812.405/0001-12",
    cidade: "Cascavel",
    uf: "PR",
    endereco: "Rua Paraná, nº 2.480",
    lote: "02",
    quadra: "18",
    matricula: "61.087",
    responsavel: "Marcos Engenharia",
    status: "Pronto para gerar",
    atualizadoEm: "10/04/2026",
    progresso: 55,
    pendencias: 2,
    areaTerreno: 980.0,
    areaGlobal: 4820.15,
    torres: 1,
    pavimentos: 12,
    unidades: 48,
    vagas: 72,
    alvara: "AL-2025/3110",
    dataAprovacao: "08/12/2025",
    crea: "144.220 D/PR",
    art: "ART 2025/PR/01882",
  },
  {
    id: "residencial-pacifico",
    nome: "Residencial Pacífico",
    incorporadora: "Litoral Construtora",
    cnpj: "44.991.012/0001-77",
    cidade: "Foz do Iguaçu",
    uf: "PR",
    endereco: "Av. das Cataratas, nº 4.110",
    lote: "21",
    quadra: "03",
    matricula: "70.554",
    responsavel: "Carla Projetos",
    status: "Aprovado",
    atualizadoEm: "08/04/2026",
    progresso: 100,
    pendencias: 0,
    areaTerreno: 3120.0,
    areaGlobal: 5440.0,
    torres: 4,
    pavimentos: 6,
    unidades: 96,
    vagas: 120,
    alvara: "AL-2024/2810",
    dataAprovacao: "14/10/2025",
    crea: "131.402 D/PR",
    art: "ART 2025/PR/01102",
  },
];

export type UnidadeStatus = "Validado" | "Pendente" | "Inconsistência" | "Não revisado";

export type Unidade = {
  id: string;
  nome: string;
  torre: string;
  pavimento: string;
  tipo: "Tipo" | "Garden" | "Cobertura";
  areaPrivativa: number;
  areaComum: number;
  areaTotal: number;
  garden: number;
  vaga: string;
  fracao: string;
  status: UnidadeStatus;
  confrontacoes: string;
};

function gerarUnidades(): Unidade[] {
  const lista: Unidade[] = [];
  const torres = ["Torre 01", "Torre 02", "Torre 03"];
  let idx = 0;
  torres.forEach((torre, ti) => {
    // Garden no térreo
    for (let g = 1; g <= 4; g++) {
      idx++;
      lista.push({
        id: `u-${idx}`,
        nome: `Apartamento Garden 0${g}`,
        torre,
        pavimento: "Térreo",
        tipo: "Garden",
        areaPrivativa: 43.3,
        areaComum: 8.593,
        areaTotal: 51.893,
        garden: 12.5,
        vaga: `V-${String(idx).padStart(3, "0")}`,
        fracao: "1,667%",
        status: g === 1 ? "Validado" : g === 2 ? "Pendente" : "Não revisado",
        confrontacoes: "Norte: hall social. Sul: jardim. Leste: ap. vizinho. Oeste: fachada.",
      });
    }
    // 4 pavimentos tipo, 4 apartamentos cada
    for (let p = 1; p <= 4; p++) {
      for (let a = 1; a <= 4; a++) {
        idx++;
        const num = `${p}0${a}`;
        lista.push({
          id: `u-${idx}`,
          nome: `Apartamento ${num}`,
          torre,
          pavimento: `${p}º Pavimento`,
          tipo: "Tipo",
          areaPrivativa: 43.3,
          areaComum: 8.593,
          areaTotal: 51.893,
          garden: 0,
          vaga: `V-${String(idx).padStart(3, "0")}`,
          fracao: "1,667%",
          status: ti === 0 && p === 1 ? "Inconsistência" : idx % 5 === 0 ? "Pendente" : "Validado",
          confrontacoes:
            "Norte: corredor de circulação. Sul: fachada. Leste: ap. vizinho. Oeste: poço de ventilação.",
        });
      }
    }
  });
  return lista;
}

export const unidadesResidencialMadrid = gerarUnidades();

export type SecaoStatus = "Não gerada" | "Gerada" | "Em revisão" | "Com pendência" | "Aprovada";

export type SecaoMemorial = {
  id: string;
  titulo: string;
  status: SecaoStatus;
  conteudo: string;
};

export const secoesMemorial: SecaoMemorial[] = [
  {
    id: "qualificacao",
    titulo: "Qualificação da Incorporadora",
    status: "Aprovada",
    conteudo:
      "PITANGUEIRAS SPE LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 63.310.140/0001-86, com sede na cidade de Cascavel, Estado do Paraná, neste ato representada na forma de seu contrato social, doravante denominada INCORPORADORA, vem, na forma da Lei Federal nº 4.591/64, submeter a registro o presente Memorial de Incorporação.",
  },
  {
    id: "propriedade",
    titulo: "Primeira – Da Propriedade e Localização do Imóvel",
    status: "Aprovada",
    conteudo:
      "O imóvel objeto desta incorporação é o lote de terreno urbano sob nº 13 (treze), da quadra nº 04 (quatro), localizado na Rua Ilhas Canárias, nº 359, na cidade de Cascavel, Estado do Paraná, com área total de 2.763,00 m² (dois mil setecentos e sessenta e três metros quadrados), conforme matrícula nº 48.291 do Cartório de Registro de Imóveis competente.",
  },
  {
    id: "incorporacao",
    titulo: "Segunda – Da Incorporação Imobiliária",
    status: "Em revisão",
    conteudo:
      "Que, pretendendo ela Incorporadora alienar frações do descrito terreno, representativas de unidades autônomas de edificações a serem erigidas sobre o mesmo imóvel, promove a incorporação imobiliária de tais edificações, para a ordenação jurídica da Lei nº 4.591, de 16 de dezembro de 1964, e todas as suas regulamentações e alterações posteriores, e do art. 1.331 e seguintes, da Lei nº 10.406 (Código Civil), de 10 de janeiro de 2002 (com vigência a partir de 11 de janeiro de 2003), e com a instituição de Condomínio Urbano Simples nos termos da Lei nº 13.465/17 e do Decreto Federal nº 9.310/18, na forma de condomínio edilício ou por unidades autônomas, sob a denominação de RESIDENCIAL MADRID.",
  },
  {
    id: "composicao",
    titulo: "Terceira – Da Composição do Condomínio",
    status: "Em revisão",
    conteudo:
      "O Condomínio com área total a ser edificada de 3.113,58 m² (três mil, cento e treze metros quadrados e cinquenta e oito centímetros quadrados), será constituído de 03 (três) torres, divididas em 5 (cinco) pavimentos cada, e uma área comum, a saber: Pavimento Térreo, medindo 844,26 m²; 1º Pavimento, medindo 567,33 m²; 2º Pavimento, medindo 567,33 m²; 3º Pavimento, medindo 567,33 m² e 4º Pavimento, medindo 567,33 m². A composição do condomínio será a seguinte: a) Partes de propriedade exclusiva (áreas privativas de 2.598,00 m²): às quais serão 60 (sessenta) apartamentos e 60 (sessenta) vagas de garagem descobertas, acessórias às unidades autônomas; b) Partes de propriedade comum (áreas de uso comum de 515,58 m²): que serão: Central GLP, Lixo, Circulação/Hall, Escada, Circulação de Veículos, Salão de Festas e Castelo d'água. Tudo conforme alocado no referido projeto arquitetônico.",
  },
  {
    id: "aprovacao",
    titulo: "Quarta – Da Aprovação do Projeto Arquitetônico",
    status: "Gerada",
    conteudo:
      "O projeto arquitetônico da edificação foi aprovado pelo IPC - Instituto de Planejamento de Cascavel, em 13 de abril de 2026, conforme Alvará de Construção no 334-26-CVL-ALV expedido pela referida Prefeitura. A responsabilidade técnica pelo projeto arquitetônico e pela elaboração dos quadros da NBR 12.721 é da Engenheira Civil Francieli Luize Wagner, inscrita no CREA/PR sob no 158.605/D e Anotação de Responsabilidade Técnica (ART) no 1720261664968. A responsabilidade técnica pela execução da obra é do Engenheiro Civil Marcio da Cruz Santos, inscrito no CREA/PR sob no 29260/D e Anotação de Responsabilidade Técnica (ART) no 1720262080080.",
  },
  {
    id: "unidades",
    titulo: "Quinta – Da Descrição das Unidades Autônomas",
    status: "Com pendência",
    conteudo:
      "Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira no 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei no 4.591, assim se descrevem as futuras unidades autônomas do condomínio:",
  },
  {
    id: "orcamento",
    titulo: "Sexta – Do Orçamento da Edificação",
    status: "Gerada",
    conteudo:
      "De acordo com a referida Norma Brasileira nº 12.721/2006, o custo da edificação foi orçado em R$ 11.943.030,00 (onze milhões, novecentos e quarenta e três mil e trinta reais), com base no Custo Unitário Básico (CUB) PP-B padrão baixo do mês de Fevereiro/2026, fornecido pelo Sindicato da Indústria da Construção Civil (Sinduscon) Paraná Oeste, atribuindo ao metro quadrado da construção o valor de R$ 3.114,00 (três mil, cento e quatorze reais), sendo que o custo de cada unidade autônoma foi orçado da mesma forma: a) Apartamentos 01, 02, 03, 04, 101, 102, 103, 104, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403 e 404 (Torre 01, 02 e 03): R$ 199.050,50 (Cento e noventa e nove mil e cinquenta reais e cinquenta centavos) cada apartamento;",
  },
  {
    id: "destinacao",
    titulo: "Sétima – Da Destinação das Unidades Autônomas",
    status: "Gerada",
    conteudo:
      "A destinação das unidades autônomas e tudo que às mesmas unidades se referirem, estão tratadas na Convenção Condominial e Regimento Interno do Residencial Madrid, doravante denominada exclusivamente Convenção, elaborada em cumprimento ao Artigo 9º, da citada Lei no 4.591, de 16 de dezembro de 1964, conforme Cláusula a seguir.",
  },
  {
    id: "convencao",
    titulo: "Oitava – Convenção Condominial e Regimento Interno do Residencial Madrid",
    status: "Gerada",
    conteudo: [
      "Capítulo I – Direitos e Deveres",
      "Artigo 1. São direitos dos condôminos: a) usar, gozar e dispor da respectiva unidade autônoma, de acordo com o respectivo destino (residencial e comercial), desde que não prejudiquem à segurança e solidez do condomínio, que não causem dano aos demais condôminos, e não infrinjam as normas legais ou às disposições desta Convenção; b) usar e gozar das partes comuns do condomínio, desde que não impeçam idêntico uso ou gozo por parte do outro condômino, com as mesmas restrições da alínea anterior; c) examinar a qualquer tempo os livros e arquivos da administração e pedir esclarecimentos ao administrador ou síndico; d) não desviar os empregados do condomínio para serviços internos de suas unidades autônomas; e) comparecer às assembléias e nelas discutir e votar; f) denunciar ao síndico qualquer irregularidade que observem.",
      "Artigo 2. São deveres dos condôminos: a) guardar decoro e respeito no uso das coisas e partes comuns, não as usando nem permitindo que as usem, bem como as respectivas unidades autônomas para fins diversos daqueles a que se destinem; b) não usar as respectivas unidades autônomas, nem alugá-las ou cedê-las para atividades ruidosas, ou a pessoas de maus costumes, ou para instalação de qualquer atividade ou depósito de objeto capaz de causar danos ao prédio ou incômodo aos demais condôminos; c) remover pós de tapetes, cortinas ou partes das unidades autônomas senão com aspiradores dotados de dispositivos que impeçam a sua dispersão; d) não estender roupas, tapetes ou quaisquer outros objetos nas janelas, ou em quaisquer lugares que sejam visíveis do exterior, ou de onde estejam expostos ao risco de caírem; e) não lançar quaisquer objetos ou líquidos sobre a via pública e área interna; f) colocar lixo, detritos, etc., no lugar designado para tanto; g) não decorar as paredes, portas e esquadrias externas com cores ou tonalidades diversas das empregadas no condomínio; h) não colocar nem deixar que se coloquem nas partes comuns do condomínio quaisquer objetos de instalações, sejam de que natureza forem; i) não utilizar os empregados do condomínio para serviços particulares; j) não manter nas respectivas unidades autônomas, substâncias, instalações ou aparelhos que causem perigo à segurança e à solidez do condomínio ou incômodo aos demais condôminos; k) não sobrecarregar a estrutura e as lajes do condomínio com peso superior a 300 kg por metro quadrado; l) não fracionar a respectiva unidade autônoma para fim de aliená-la a mais de uma pessoa separadamente; m) contribuir para as despesas comuns do condomínio na proporção adiante expressa, efetuando os recolhimentos nas ocasiões oportunas; n) contribuir para o custeio de obras determinadas pela Assembleia, na forma e na proporção adiante definida; o) permitir o ingresso, em sua unidade autônoma, do administrador ou preposto seu quando isto se torne indispensável à inspeção ou realização de trabalhos relativos à estrutura geral do condomínio, sua segurança e solidez, ou indispensável à realização de reparos em instalações e tubulações na unidade autônoma vizinha; p) não permitir a realização de jogos infantis em quaisquer das partes comuns do condomínio que não tenham essa destinação; q) comunicar imediatamente ao síndico a ocorrência de moléstia contagiosa em sua unidade autônoma; r) não promover a dispersão de sons ou ruídos gerados em sua unidade autônoma de modo que possam ser percebidos nas unidades autônomas vizinhas, no período compreendido entre às 22:00 horas de um dia as 08:00 horas do dia seguinte, de segunda a sexta, das 12:00 às 24:00 horas de sábado e em nenhum horário durante domingos e feriados.",
      "Capítulo II – Das Assembleias Gerais",
      "Artigo 3. As Assembleias Gerais serão convocadas mediante carta registrada ou protocolizada pelo síndico ou por um quarto dos condôminos, e serão realizadas no próprio condomínio, salvo motivo de força maior. § 1º As convocações indicarão o resumo da ordem do dia, a data, a hora e o local da assembleia, e serão assinadas pelo síndico ou pelo condômino que a fizer. § 2º As convocações das assembleias gerais ordinárias serão acompanhadas de cópias do relatório e contas do administrador, bem como da proposta de orçamento relativo ao exercício respectivo. § 3º Entre a data da convocação e a da assembleia deverá mediar um prazo de cinco dias, no mínimo. § 4º As assembleias extraordinárias poderão ser convocadas com prazo mais curto do que o mencionado no parágrafo anterior, quando houver comprovada urgência. § 5º É lícito, no mesmo anúncio, fixar o momento em que se realizará a assembleia em primeira e em segunda convocação, mediando entre ambas, o período de uma hora, no mínimo. § 6º O síndico endereçará as convocações para as unidades dos respectivos condôminos, salvo se tiverem estes, feito em tempo oportuno comunicação de outro endereço para o qual devam ser remetidas.",
      "Artigo 4. As assembleias serão presididas por um condômino ou não, que lavrará a ata dos trabalhos no livro próprio.",
      "Artigo 5. Cada unidade representará um voto e as decisões só poderão ser unânimes, observando o disposto no Artigo 8 e seus parágrafos.",
      "Artigo 6. É lícito fazer o condômino representar, nas assembléias, por procurador com poderes especiais, condômino ou não.",
      "Artigo 7. A assembleia geral ordinária realizar-se-á anualmente no primeiro dia útil do mês a que corresponder à primeira assembleia geral ordinária, e a ela compete: a) discutir e votar o relatório e as contas da administração relativas ao ano findo; b) discutir e votar o orçamento das despesas para o ano em curso, fixando fundos de reserva; c) eleger o síndico, fixando-lhe a remuneração; d) votar as demais matérias constantes da ordem do dia.",
      "Artigo 8. As assembleias gerais ordinárias só realizar-se-ão com a presença dos condôminos que representarem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º Caso um condômino injustificadamente ou por impedimento não possa comparecer à assembleia, o outro condômino poderá requerer à custa do condômino ausente, junto ao Juízo competente, o suprimento de seu comparecimento e voto. § 2º Em caso de empate a decisão será tomada judicialmente, por Juiz de Direito.",
      "Artigo 9. As assembleias gerais extraordinárias só realizar-se-ão com a presença dos condôminos que representem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º As assembleias gerais extraordinárias serão convocadas pelo síndico ou por um condômino, pelo mesmo processo e nos mesmos prazos exigidos para convocação das assembleias ordinárias. § 2º Aplica-se às assembleias gerais extraordinárias as disposições sobre as assembleias gerais ordinárias, no que couber.",
      "Artigo 10. Compete nas assembleias extraordinárias: a) deliberar sobre matéria de interesse geral do condomínio ou dos condôminos; b) decidir em grau de recurso os assuntos que tenham sido deliberados pelo síndico e a elas levadas a pedido do interessado ou dos interessados; c) apreciar as demais matérias constantes da ordem do dia; d) examinar os assuntos que lhes sejam propostos por qualquer condômino; e) destituir o síndico a qualquer tempo, independentemente de justificação e sem indenização.",
      "Artigo 11. As deliberações das assembleias gerais serão obrigatórias a todos os condôminos, cumprindo ao síndico executá-las e fazê-las cumprir. § único. Nos oito dias que se seguirem à assembleia, o administrador enviará cópia aos condôminos por carta registrada ou protocolada, de relato das deliberações na assembleia tomadas.",
      "Artigo 12. Das assembleias gerais serão lavradas atas em livro próprio, aberto, encerrado, rubricado e assinado pelo síndico. § único. As despesas com a Assembleia Geral serão inscritas a débito do condomínio, mas relativas à assembleia convocada para apreciação de recurso do condômino serão pagas por este, se o recurso for desprovido.",
      "Capítulo III – Da Administração",
      "Artigo 13. A administração do condomínio caberá a um síndico, condômino ou não, eleito em assembleia geral ordinária, pelo prazo de dois anos, podendo ser reeleito. § único. Ao síndico compete: a) representar os condôminos em juízo ou fora dele, ativa ou passivamente, em tudo que se referir aos assuntos de interesse da comunhão; b) superintender a administração do condomínio; c) cumprir e fazer cumprir a lei, a presente convenção e as deliberações das assembleias; d) admitir e demitir empregados, bem como fixar a respectiva remuneração; e) ordenar reparos urgentes ou adquirir o que seja necessário à segurança ou conservação do condomínio; f) executar fielmente as disposições orçamentárias aprovadas pela assembleia; g) convocar as assembleias gerais ordinárias nas épocas próprias e as extraordinárias quando julgar conveniente ou lhe for requerido fundamentalmente por no mínimo um condômino; h) prestar, a qualquer tempo, informações sobre os atos da administração; i) prestar à assembleia contas de sua gestão, acompanhadas da documentação respectiva e oferecer proposta de orçamento para o exercício seguinte; j) manter e escriturar livro-caixa, devidamente aberto, encerrado, rubricado e assinado; l) cobrar, inclusive em juízo, as quotas que couberem em rateio aos condôminos, nas despesas normais ou extraordinárias do condomínio, aprovadas pela assembleia, bem como as multas impostas por infração de disposições legais ou desta convenção; m) comunicar à assembleia as citações que receber; n) procurar, por meios suasórios, dirimir divergências entre os condôminos; o) entregar ao seu sucessor todos os livros, documentos e pertences em seu poder; p) manter guardada, durante o prazo de cinco anos, para eventuais necessidades de verificação contábil, toda a documentação relativa ao condomínio, devendo guardar por mais tempo os documentos que tiverem de fazer prova por período superior a cinco anos.",
      "Artigo 14. O síndico poderá delegar suas funções administrativas a terceiros de sua confiança, mas sob sua exclusiva responsabilidade.",
      "Artigo 15. O administrador receberá a remuneração mensal que lhe for fixada pela assembleia geral.",
      "Artigo 16. Em caso de vaga, a assembleia elegerá outro síndico que exercerá o mandato pelo tempo restante. Em caso de destituição, o síndico prestará imediatamente contas de sua gestão.",
      "Artigo 17. O síndico não é responsável pessoalmente pelas obrigações contraídas em nome do condomínio, desde que tenha agido no exercício regular de suas atribuições, responderá, porém, pelo excesso de representação e pelos prejuízos a que der causa, por dolo ou culpa.",
      "Artigo 18. Ao zelador, nomeado pelo síndico do condomínio e considerado empregado do condomínio, compete: a) exercer a vigilância do condomínio; b) manter em perfeitas condições de conservação e asseio das partes comuns do condomínio; c) comunicar ao síndico, imediatamente, quaisquer irregularidades havidas no condomínio, ou na sua utilização pelos condôminos, bem como qualquer circunstância que lhe pareça anormal; d) executar as instruções do síndico.",
      "Capítulo IV – Do Conselho Fiscal ou Consultivo",
      "Artigo 19. Não haverá conselho consultivo ou fiscal, cabendo aos condôminos que representarem a maioria das unidades do condomínio qualquer atividade relacionada à função deste conselho.",
      "Capítulo V – Do Orçamento do Condomínio",
      "Artigo 20. Constituem despesas comuns do condomínio: a) as relativas à conservação, limpeza, reparações e reconstrução das partes e coisas comuns; b) as relativas ao zelador; c) as relativas à manutenção das partes e coisas comuns; d) o prêmio do seguro do condomínio e dos empregados; e) os impostos e taxas que incidam sobre as partes e coisas comuns do condomínio; f) a remuneração do síndico, zelador e a dos demais empregados do condomínio, bem como as relativas aos encargos de Previdência e Assistência Social; g) o Fundo de Reserva de 10% (dez por cento) à maior que cabe ao condomínio no rateio mensal a título de despesas condominiais, se aceito em assembleia geral ordinária.",
      "Artigo 21. Compete à Assembleia fixar o orçamento das despesas comuns e cabe aos condôminos concorrer para o custeio das referidas despesas, até o dia cinco (5) do mês subsequente ao da efetivação das despesas, realizando-se o rateio em proporções iguais à cada unidade autônoma.",
      "Artigo 22. Serão igualmente rateadas entre os condôminos as despesas extraordinárias dentro de quinze dias a contar da data da assembleia que as autorizar, salvo se nesta oportunidade for estabelecido prazo diferente, ou se forem adicionadas à quota normal do condomínio.",
      "Artigo 23. Ficarão a cargo exclusivo de cada condômino as despesas a que der causa. § único. O disposto neste artigo é extensivo aos prejuízos causados às partes comuns do condomínio, pela omissão do condômino na execução dos trabalhos ou reparações na sua unidade autônoma.",
      "Artigo 24. O saldo remanescente do orçamento de um exercício será incorporado ao exercício seguinte, se outro destino não lhe for dado pela assembleia ordinária. O déficit verificado será rateado entre os condôminos e arrecadado no prazo de quinze dias.",
      "Artigo 25. O condomínio será segurado contra incêndio ou qualquer outro risco que possa vir a destruí-lo no todo ou em parte, em companhia idônea com aprovação da assembleia, pelo respectivo valor, discriminando-se na apólice o de cada unidade. § único. É lícito a cada condômino, individualmente e às expensas próprias, aumentar o seguro de sua unidade autônoma, ou segurar as benfeitorias e melhoramentos por ele introduzidas na mesma.",
      "Artigo 26. Ocorrido o sinistro total ou a destruição de mais de dois terços do condomínio, os condôminos que representarem as unidades do condomínio se reunirão em assembleia geral dentro de quinze dias e elegerão quem os representará para: a) receber a indenização e depositá-la em nome do condomínio no estabelecimento bancário designado pela assembleia, respeitado o parágrafo único do artigo 25; b) abrir concorrência para a reconstrução do prédio ou de suas partes destruídas, comunicando o resultado à assembleia geral para a devida deliberação; c) acompanhar os trabalhos de reconstrução até final, representando os condôminos junto aos construtores, fornecedores, empreiteiros e repartições públicas.",
      "Artigo 27. Não sendo acordado entre os condôminos a reconstrução das partes destruídas, será feita a venda do terreno, partilhando-se o seu preço e o valor entre os condôminos, respeitando o parágrafo único do artigo 25.",
      "Artigo 28. Em caso de incêndio parcial, recolhido o seguro, proceder-se-á à reparação ou reconstrução das partes destruídas.",
      "Capítulo VI – Das Penalidades",
      "Artigo 29. Os condôminos em atraso com o pagamento das respectivas contribuições, pagarão o juro de 1% (um por cento) ao mês, e até 20% (vinte por cento) sobre o débito, contados a partir da data do vencimento do respectivo prazo, independentemente de interpelação, até uma mora de trinta dias. Findo este prazo, poderá o síndico cobrar-lhe o débito judicialmente, sujeitando-se, ainda, ao pagamento das custas e honorários de advogado e à correção monetária de seu débito, segundo os índices levantados pelos órgãos governamentais.",
      "Artigo 30. Além das penas cominadas em lei, fica ainda o condômino ou possuidor, que não cumprir reiteradamente com os seus deveres perante o condomínio, que por deliberação de três quartos dos condôminos restantes, ser constrangido a pagar multa correspondente até ao quíntuplo do valor atribuído à contribuição para as despesas condominiais, conforme a gravidade das faltas e a reiteração, independentemente das perdas e danos que se apurarem. Além de que, o condômino ou possuidor que, por seu reiterado comportamento anti-social, gerar incompatibilidade de convivência com os demais condôminos ou possuidores, poderá ser constrangido a pagar multa correspondente ao décuplo do valor atribuído à contribuição para as despesas condominiais, até ulterior deliberação da assembleia. § único. A multa será imposta e cobrada pelo síndico, com recurso do interessado para a Assembleia Geral.",
      "Capítulo VII – Disposições Gerais e Transitórias",
      "Artigo 31. A presente convenção, que sujeita a todo ocupante ainda que eventual do condomínio ou de qualquer de suas partes, obriga a todos os condôminos, seus sub-rogados e sucessores a título universal ou singular, e somente poderá ser modificada mediante a aprovação de 2/3 (dois terços) dos votos dos condôminos a alteração da convenção, bem como a mudança da destinação do edifício ou da unidade imobiliária.",
      "Artigo 32. Fica eleito o foro da Comarca de Cascavel-PR para todo tipo de ação ou execução decorrente da aplicação de qualquer dos dispositivos constantes nesta convenção.",
    ].join("\n\n"),
  },
  {
    id: "regime",
    titulo: "Nona – Do Regime de Incorporação",
    status: "Gerada",
    conteudo:
      "A incorporadora, utilizando-se do disposto no art. 6º, da Lei no 4.864, de 29.11.1965, combinado com o art. 9º, parágrafo 4º, da citada Lei no 4.591, de 1964, convenciona que a incorporação imobiliária do Residencial Madrid, será em três etapas, que serão aleatórias, dependendo da conclusão de cada uma das torres, conforme emissão do Habite-se.",
  },
  {
    id: "prazo-carencia",
    titulo: "Décima – Do Prazo de Carência",
    status: "Gerada",
    conteudo:
      "Não haverá prazo de carência, haja visto que as obras de edificação já foram iniciadas.",
  },
  {
    id: "regularidade-fiscal",
    titulo: "Décima Primeira – Da Regularidade Fiscal",
    status: "Gerada",
    conteudo:
      'De acordo com o que dispõe o Artigo 257, Inciso III, do Decreto Federal no 3.408, de 6 de maio de 1999, publicado no Diário Oficial da União em 7 de maio de 1999, retificado conforme publicação no mesmo Diário em 12 de maio de 1999 (com a redação que lhe foi dada pelos Decretos Federais no 3.265, de 29 de novembro de 1999 (DOU 30/11/1999), 3.298, de 20 de dezembro de 1999 (DOU 21/12/1999), 3.452, de 9 de maio de 2000 (DOU 09/05/2020) e 3.668, de 22 de novembro de 2000 (DOU 23/11/2000), e Item 5-III, da Ordem de Serviço no 207, de 8 de abril de 1999, da Diretoria de Arrecadação e Fiscalização do Instituto Nacional do Seguro Social – INSS, publicada no Diário Oficial da União em 15 de abril de 1999, retificada conforme publicação no mesmo Diário em 16 e 19 de abril de 1999, combinado com os Artigos 29, Parágrafo Único, 30 e 32, alínea "f", da Lei Federal no 4.591, de 16 de dezembro de 1964, a incorporadora declara, para fins de registro da Incorporação imobiliária do condomínio do Residencial Madrid, que está em dia com o recolhimento de contribuições à Previdência Social e que apresenta junto com este instrumento a Certidão Negativa de Débitos – CND, da Certidão Positiva de Débitos – CPD ou da Certidão Positiva de Débitos com Efeitos de Negativa – CPD-EM, do citado INSS.',
  },
  {
    id: "registro",
    titulo: "Décima Segunda – Do Registro",
    status: "Gerada",
    conteudo:
      "Em face de tudo expresso, a incorporadora requer ao Registrador, do Terceiro Serviço de Registro de Imóveis da Comarca de Cascavel que promova os seguintes atos: primeiro, o registro da incorporação imobiliária; segundo, o registro da Convenção Condominial e Regimento Interno; não havendo necessidade de registrar a convenção na íntegra, mas resumida, fornecendo-lhe, em seguida, cópia deste instrumento e certidão probatória de todos os atos; terceiro, todos os demais atos necessários para o pleno registro deste instrumento.",
  },
];

export type EventoHistorico = {
  data: string;
  hora: string;
  usuario: string;
  descricao: string;
  tipo:
    | "criacao"
    | "upload"
    | "extracao"
    | "edicao"
    | "validacao"
    | "geracao"
    | "aprovacao"
    | "exportacao";
};

export const historico: EventoHistorico[] = [
  {
    data: "15/04/2026",
    hora: "11:02",
    usuario: "Francieli L.",
    descricao: 'Aprovou a seção "Composição do Condomínio".',
    tipo: "aprovacao",
  },
  {
    data: "15/04/2026",
    hora: "10:48",
    usuario: "Sistema",
    descricao: "Memorial regenerado após edição de áreas comuns.",
    tipo: "geracao",
  },
  {
    data: "15/04/2026",
    hora: "10:05",
    usuario: "Francieli L.",
    descricao: "Editou área comum da unidade 101 — Torre 01.",
    tipo: "edicao",
  },
  {
    data: "15/04/2026",
    hora: "09:42",
    usuario: "Ana T.",
    descricao: "Validou 56 de 60 unidades autônomas.",
    tipo: "validacao",
  },
  {
    data: "15/04/2026",
    hora: "09:18",
    usuario: "Sistema",
    descricao: "Extração concluída: 60 unidades identificadas.",
    tipo: "extracao",
  },
  {
    data: "15/04/2026",
    hora: "09:12",
    usuario: "Ana T.",
    descricao: "Enviou o quadro técnico NBR 12.721.",
    tipo: "upload",
  },
  {
    data: "14/04/2026",
    hora: "17:30",
    usuario: "Francieli L.",
    descricao: "Empreendimento criado.",
    tipo: "criacao",
  },
];

export type Modelo = {
  id: string;
  nome: string;
  tipo: string;
  status: "Ativo" | "Rascunho";
  atualizadoEm: string;
};

export const modelos: Modelo[] = [
  {
    id: "m1",
    nome: "Memorial de Incorporação — Padrão Projetse",
    tipo: "Memorial completo",
    status: "Ativo",
    atualizadoEm: "02/04/2026",
  },
];

export type Clausula = {
  id: string;
  ordem: number;
  titulo: string;
  categoria: string;
  resumo: string;
  template: string;
  variaveis: string[];
  status: "Publicada" | "Em revisão";
};

export const clausulas: Clausula[] = [
  {
    id: "c1",
    ordem: 0,
    titulo: "Qualificação da Incorporadora",
    categoria: "Incorporação",
    resumo: "Bloco padrão de qualificação jurídica da SPE incorporadora.",
    status: "Publicada",
    variaveis: [
      "incorporadora.razaoSocial",
      "incorporadora.endereco",
      "incorporadora.cidade",
      "incorporadora.uf",
      "incorporadora.cnpj",
      "incorporadora.representante.nome",
      "incorporadora.representante.estadoCivil",
      "incorporadora.representante.profissao",
      "incorporadora.representante.rg",
      "incorporadora.representante.orgaoEmissor",
      "incorporadora.representante.cpf",
      "incorporadora.certidao",
      "empreendimento.nome",
    ],
    template:
      "{{incorporadora.razaoSocial}}, sociedade de propósito específico, com sede {{incorporadora.endereco}}, na cidade de {{incorporadora.cidade}}/{{incorporadora.uf}}, inscrita no CNPJ/MF sob o nº {{incorporadora.cnpj}}, representada por seu sócio administrador: {{incorporadora.representante.nome}}, brasileiro, {{incorporadora.representante.estadoCivil}}, {{incorporadora.representante.profissao}}, portador da Cédula de Identidade RG nº {{incorporadora.representante.rg}} {{incorporadora.representante.orgaoEmissor}} e inscrito no CPF/MF sob nº {{incorporadora.representante.cpf}}; conforme {{incorporadora.certidao}} em anexo; na qualidade de Incorporadora, convenciona este Instrumento Particular de Memorial de Incorporação, Convenção Condominial, Memorial Descritivo do Empreendimento e Regimento Interno do *{{empreendimento.nome}}*, mediante as cláusulas a seguir.",
  },
  {
    id: "c2",
    ordem: 1,
    titulo: "Primeira – Da Propriedade e Localização do Imóvel",
    categoria: "Propriedade e Localização",
    resumo: "Qualificação do imóvel confrontas, matrícula, área e cartório de registro.",
    status: "Publicada",
    variaveis: [
      "imovel.loteNumero",
      "imovel.loteNumeroExtenso",
      "imovel.area",
      "imovel.areaExtenso",
      "imovel.quadraNumero",
      "imovel.quadraNumeroExtenso",
      "imovel.loteamento",
      "imovel.comarca",
      "imovel.ufExtenso",
      "imovel.confrontacoes",
      "imovel.matricula",
      "imovel.matriculaExtenso",
      "imovel.cartorio",
    ],
    template:
      "A Incorporadora é proprietária, livre de ônus e de ações reais ou pessoais reipersecutórias, o que declara sob as penas da Lei, do imóvel constituído pelo Lote nº {{imovel.loteNumero}} ({{imovel.loteNumeroExtenso}}), com área de {{imovel.area}} ({{imovel.areaExtenso}}), da Quadra nº {{imovel.quadraNumero}} ({{imovel.quadraNumeroExtenso}}), no Loteamento *{{imovel.loteamento}}*, situado na comarca de {{imovel.comarca}} no estado do {{imovel.ufExtenso}}, sem benfeitorias, que confronta-se, {{imovel.confrontacoes}}. Atualmente registrado na matrícula *{{imovel.matricula}}* ({{imovel.matriculaExtenso}}), do {{imovel.cartorio}}.",
  },
  {
    id: "c3",
    ordem: 2,
    titulo: "Segunda – Da Incorporação Imobiliária",
    categoria: "Incorporação",
    resumo: "Declaração de incorporação nos termos da Lei 4.591/64 e do Código Civil.",
    status: "Publicada",
    variaveis: ["empreendimento.nome"],
    template:
      "Que, pretendendo ela Incorporadora alienar frações do descrito terreno, representativas de unidades autônomas de edificações a serem erigidas sobre o mesmo imóvel, promove à incorporação imobiliária de tais edificações, para a ordenação jurídica da Lei nº 4.591, de 16 de dezembro de 1964, e todas as suas regulamentações e alterações posteriores, e do art. 1.331 e seguintes, da Lei nº 10.406 (Código Civil), de 10 de janeiro de 2002 (com vigência a partir de 11 de janeiro de 2003), e com a instituição de Condomínio Urbano Simples nos termos da Lei nº 13.465/17 e do Decreto Federal nº 9.310/18, na forma de condomínio edilício ou por unidades autônomas, sob a denominação de {{empreendimento.nome}}.",
  },
  {
    id: "c4",
    ordem: 3,
    titulo: "Terceira – Da Composição do Condomínio",
    categoria: "Composição do Condomínio",
    resumo: "Define áreas global, privativa, comum, torres, pavimentos e unidades.",
    status: "Publicada",
    variaveis: [
      "empreendimento.areaTotalEdificada",
      "empreendimento.areaTotalEdificadaExtenso",
      "empreendimento.qtdTorres",
      "empreendimento.qtdTorresExtenso",
      "empreendimento.qtdPavimentos",
      "empreendimento.qtdPavimentosExtenso",
      "areasPavimentos",
      "empreendimento.areaPrivativa",
      "empreendimento.qtdUnidades",
      "empreendimento.qtdUnidadesExtenso",
      "empreendimento.qtdVagas",
      "empreendimento.qtdVagasExtenso",
      "empreendimento.areaComum",
      "empreendimento.areasComuns",
    ],
    template:
      "O Condomínio com área total a ser edificada de {{empreendimento.areaTotalEdificada}} ({{empreendimento.areaTotalEdificadaExtenso}}), será constituído de {{empreendimento.qtdTorres}} ({{empreendimento.qtdTorresExtenso}}) torres, divididas em {{empreendimento.qtdPavimentos}} ({{empreendimento.qtdPavimentosExtenso}}) pavimentos cada, e uma área comum, a saber: {{areasPavimentos}}. A composição do condomínio será a seguinte: a) Partes de propriedade exclusiva (áreas privativas de {{empreendimento.areaPrivativa}}): às quais serão {{empreendimento.qtdUnidades}} ({{empreendimento.qtdUnidadesExtenso}}) apartamentos e {{empreendimento.qtdVagas}} ({{empreendimento.qtdVagasExtenso}}) vagas de garagem descobertas, acessórias às unidades autônomas; b) Partes de propriedade comum (áreas de uso comum de {{empreendimento.areaComum}}): que serão: {{empreendimento.areasComuns}}. Tudo conforme alocado no referido projeto arquitetônico.",
  },
  {
    id: "c5",
    ordem: 4,
    titulo: "Quarta – Da Aprovação do Projeto Arquitetônico",
    categoria: "Aprovação de Projeto",
    resumo: "Cita alvará municipal, data, responsável técnico, CREA/CAU e ART/RRT.",
    status: "Publicada",
    variaveis: [
      "aprovacao.orgao",
      "aprovacao.data",
      "aprovacao.alvara",
      "aprovacao.prefeitura",
      "responsavelProjeto.nome",
      "responsavelProjeto.crea",
      "responsavelProjeto.art",
      "responsavelObra.nome",
      "responsavelObra.crea",
      "responsavelObra.art",
    ],
    template:
      "O projeto arquitetônico da edificação foi aprovado pela {{aprovacao.orgao}}, em {{aprovacao.data}}, conforme Alvará de Construção nº {{aprovacao.alvara}}, expedido pela {{aprovacao.prefeitura}}. A responsabilidade técnica pelo projeto arquitetônico e pela elaboração dos quadros da NBR 12.721 é do(a) Engenheiro(a) Civil {{responsavelProjeto.nome}}, inscrito(a) no CREA/CAU sob nº {{responsavelProjeto.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelProjeto.art}}. A responsabilidade técnica pela execução da obra é do(a) Engenheiro(a) Civil {{responsavelObra.nome}}, inscrito(a) no CREA/CAU sob nº {{responsavelObra.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelObra.art}}.",
  },
  {
    id: "c6",
    ordem: 5,
    titulo: "Quinta – Da Descrição das Unidades Autônomas",
    categoria: "Unidades Autônomas",
    resumo:
      "Descrição completa das unidades autônomas por torre, pavimento, apartamento, metragem e fração ideal.",
    status: "Publicada",
    variaveis: ["listaUnidades"],
    template:
      "Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira nº 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei nº 4.591, assim se descrevem as futuras unidades autônomas do condomínio:\n\n{{listaUnidades}}",
  },
  {
    id: "c6b",
    ordem: 6,
    titulo: "Sexta – Do Orçamento da Edificação",
    categoria: "Orçamento",
    resumo:
      "Declara o custo da edificação com base no CUB e no orçamento por unidade autônoma do quadro NBR 12.721.",
    status: "Publicada",
    variaveis: [
      "orcamento.valor",
      "orcamento.valorExtenso",
      "orcamento.cubDesignacao",
      "orcamento.padraoAcabamento",
      "orcamento.mesReferenciaCub",
      "orcamento.sindicatoCub",
      "orcamento.custoMetroQuadrado",
      "orcamento.custoMetroQuadradoExtenso",
      "listaOrcamentoUnidades",
    ],
    template:
      "De acordo com a referida Norma Brasileira nº 12.721/2006, o custo da edificação foi orçado em *{{orcamento.valor}}* ({{orcamento.valorExtenso}}), com base no Custo Unitário Básico (CUB) *{{orcamento.cubDesignacao}}* padrão {{orcamento.padraoAcabamento}} do mês de {{orcamento.mesReferenciaCub}}, fornecido pelo {{orcamento.sindicatoCub}}, atribuindo ao metro quadrado da construção o valor de *{{orcamento.custoMetroQuadrado}}* ({{orcamento.custoMetroQuadradoExtenso}}), sendo que o custo de cada unidade autônoma foi orçado da mesma forma: {{listaOrcamentoUnidades}}",
  },
  {
    id: "c7",
    ordem: 7,
    titulo: "Sétima – Da Destinação das Unidades Autônomas",
    categoria: "Unidades Autônomas",
    resumo: "Remete a destinação à Convenção Condominial e Regimento Interno.",
    status: "Publicada",
    variaveis: ["empreendimento.nome"],
    template:
      "A destinação das unidades autônomas e tudo que às mesmas unidades se referirem, estão tratadas na Convenção Condominial e Regimento Interno do *{{empreendimento.nome}}*, doravante denominada exclusivamente Convenção, elaborada em cumprimento ao Artigo 9º, da citada Lei nº 4.591, de 16 de dezembro de 1964, conforme Cláusula a seguir.",
  },
  {
    id: "c8",
    ordem: 8,
    titulo: "Oitava – Convenção Condominial e Regimento Interno",
    categoria: "Convenção Condominial",
    resumo: "Convenção e Regimento completos: 7 capítulos e 32 artigos.",
    status: "Publicada",
    variaveis: [],
    template: `Capítulo I – Direitos e Deveres

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

Artigo 32. Fica eleito o foro da Comarca de Cascavel-PR para todo tipo de ação ou execução decorrente da aplicação de qualquer dos dispositivos constantes nesta convenção.`,
  },
  {
    id: "c9",
    ordem: 9,
    titulo: "Nona – Do Regime de Incorporação",
    categoria: "Incorporação",
    resumo: "Define a incorporação em etapas com base na Lei 4.864/65 e Lei 4.591/64.",
    status: "Publicada",
    variaveis: ["empreendimento.nome", "empreendimento.qtdEtapas"],
    template:
      "A incorporadora, utilizando-se do disposto no art. 6º, da Lei nº 4.864, de 29.11.1965, combinado com o art. 9º, parágrafo 4º, da citada Lei nº 4.591, de 1964, convenciona que a incorporação imobiliária do *{{empreendimento.nome}}*, será em {{empreendimento.qtdEtapas}} etapas, que serão aleatórias, dependendo da conclusão de cada uma das torres, conforme emissão do Habite-se.",
  },
  {
    id: "c10",
    ordem: 10,
    titulo: "Décima – Do Prazo de Carência",
    categoria: "Incorporação",
    resumo:
      "Declara inexistência de prazo de carência, pois as obras de edificação já foram iniciadas.",
    status: "Publicada",
    variaveis: [],
    template:
      "Não haverá prazo de carência, haja visto que as obras de edificação já foram iniciadas.",
  },
  {
    id: "c11",
    ordem: 11,
    titulo: "Décima Primeira – Da Regularidade Fiscal",
    categoria: "Incorporação",
    resumo: "Declaração de regularidade fiscal e previdenciária da incorporadora.",
    status: "Publicada",
    variaveis: ["empreendimento.nome"],
    template:
      'De acordo com o que dispõe o Artigo 257, Inciso III, do Decreto Federal nº 3.408, de 6 de maio de 1999, publicado no Diário Oficial da União em 7 de maio de 1999, retificado conforme publicação no mesmo Diário em 12 de maio de 1999 (com a redação que lhe foi dada pelos Decretos Federais nº 3.265, de 29 de novembro de 1999 (DOU 30/11/1999), 3.298, de 20 de dezembro de 1999 (DOU 21/12/1999), 3.452, de 9 de maio de 2000 (DOU 09/05/2000) e 3.668, de 22 de novembro de 2000 (DOU 23/11/2000), e Item 5-III, da Ordem de Serviço nº 207, de 8 de abril de 1999, da Diretoria de Arrecadação e Fiscalização do Instituto Nacional do Seguro Social – INSS, publicada no Diário Oficial da União em 15 de abril de 1999, retificada conforme publicação no mesmo Diário em 16 e 19 de abril de 1999, combinado com os Artigos 29, Parágrafo Único, 30 e 32, alínea "f", da Lei Federal nº 4.591, de 16 de dezembro de 1964, a incorporadora declara, para fins de registro da Incorporação imobiliária do condomínio do *{{empreendimento.nome}}*, que está em dia com o recolhimento de contribuições à Previdência Social e que apresenta junto com este instrumento a Certidão Negativa de Débitos – CND, da Certidão Positiva de Débitos – CPD ou da Certidão Positiva de Débitos com Efeitos de Negativa – CPD-EM, do citado INSS.',
  },
  {
    id: "c12",
    ordem: 12,
    titulo: "Décima Segunda – Do Registro",
    categoria: "Registro",
    resumo: "Solicita registro da incorporação e da Convenção (em resumo) ao Cartório.",
    status: "Publicada",
    variaveis: ["empreendimento.comarca"],
    template:
      "Em face de tudo expresso, a incorporadora requer ao Registrador, do Terceiro Serviço de Registro de Imóveis da Comarca de {{empreendimento.comarca}} que promova os seguintes atos: *primeiro*, o registro da incorporação imobiliária; *segundo*, o registro da Convenção Condominial e Regimento Interno; não havendo necessidade de registrar a convenção na íntegra, mas resumida, fornecendo-lhe, em seguida, cópia deste instrumento e certidão probatória de todos os atos; *terceiro*, todos os demais atos necessários para o pleno registro deste instrumento.",
  },
];

export const indicadoresDashboard = {
  total: 12,
  emValidacao: 3,
  geradas: 5,
  pendentes: 2,
  aprovados: 6,
  exportados: 4,
};
