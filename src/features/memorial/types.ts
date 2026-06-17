export type MemorialDbStatus = "rascunho" | "gerado" | "em_revisao" | "aprovado" | "exportado";

export type SecaoDbStatus = "nao_gerada" | "gerada" | "em_revisao" | "com_pendencia" | "aprovada";

export interface SecaoRecord {
  id: number;
  memorialId: number;
  clausulaId: number | null;
  titulo: string;
  conteudo: string;
  status: SecaoDbStatus;
  statusLabel: string;
  ordem: number;
  updatedAt: string;
}

export interface MemorialRecord {
  id: number;
  empreendimentoId: number;
  versao: number;
  status: MemorialDbStatus;
  statusLabel: string;
  secoes: SecaoRecord[];
}

export interface MemorialContextRepresentante {
  nome: string;
  cpf: string;
  rg: string;
  estadoCivil: string;
  profissao: string;
  orgaoEmissor: string;
}

export interface MemorialContextResponsavel {
  nome: string;
  formacao: string;
  crea: string;
  art: string;
}

export interface MemorialContextData {
  incorporadora: {
    razaoSocial: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    uf: string;
    certidao: string;
    representante: MemorialContextRepresentante;
  };
  empreendimento: {
    nome: string;
    endereco: string;
    cidade: string;
    uf: string;
    comarca: string;
    areaGlobal: string;
    areaTotalEdificada: string;
    areaTotalEdificadaExtenso: string;
    areaPrivativa: string;
    areaPrivativaExtenso: string;
    areaComum: string;
    areaComumExtenso: string;
    qtdTorres: string;
    qtdTorresExtenso: string;
    qtdPavimentos: string;
    qtdPavimentosExtenso: string;
    qtdUnidades: string;
    qtdUnidadesExtenso: string;
    qtdVagas: string;
    qtdVagasExtenso: string;
    qtdEtapas: string;
    areasComuns: string;
    torres: string;
    pavimentos: string;
    unidades: string;
    vagas: string;
  };
  imovel: {
    loteNumero: string;
    loteNumeroExtenso: string;
    quadraNumero: string;
    quadraNumeroExtenso: string;
    loteamento: string;
    comarca: string;
    cidade: string;
    uf: string;
    ufExtenso: string;
    area: string;
    areaExtenso: string;
    matricula: string;
    matriculaExtenso: string;
    cartorio: string;
    confrontacoes: string;
    confrontaNoroeste: string;
    medidaNoroeste: string;
    azimuteNoroeste: string;
    confrontaNordeste: string;
    medidaNordeste: string;
    azimuteNordeste: string;
    confrontaSudeste: string;
    medidaSudeste: string;
    azimuteSudeste: string;
    confrontaSudoeste: string;
    medidaSudoeste: string;
    azimuteSudoeste: string;
  };
  aprovacao: {
    orgao: string;
    alvara: string;
    data: string;
    prefeitura: string;
  };
  responsavelProjeto: MemorialContextResponsavel;
  responsavelObra: MemorialContextResponsavel;
  orcamento: {
    valor: string;
    valorExtenso: string;
    cubDesignacao: string;
    padraoAcabamento: string;
    mesReferenciaCub: string;
    sindicatoCub: string;
    custoMetroQuadrado: string;
    custoMetroQuadradoExtenso: string;
  };
  areasPavimentos: string;
  listaUnidades: string;
  listaOrcamentoUnidades: string;
}
