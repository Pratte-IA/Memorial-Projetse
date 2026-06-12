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

export interface MemorialContextData {
  incorporadora: {
    razaoSocial: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    uf: string;
    representante: {
      nome: string;
      cpf: string;
      rg: string;
      estadoCivil: string;
    };
  };
  empreendimento: {
    nome: string;
    endereco: string;
    cidade: string;
    uf: string;
    areaGlobal: string;
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
    cidade: string;
    uf: string;
    area: string;
    areaExtenso: string;
    matricula: string;
    cartorio: string;
    confrontacoes: string;
  };
  aprovacao: {
    alvara: string;
    data: string;
  };
  responsavelProjeto: {
    nome: string;
    crea: string;
    art: string;
  };
}
