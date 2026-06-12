import type { Empreendimento } from "@/lib/mock-data";

/** Item resumido para listagens e dashboard. */
export interface EmpreendimentoListItem {
  id: number;
  idParam: string;
  nome: string;
  incorporadora: string;
  cnpj: string;
  cidade: string;
  uf: string;
  responsavel: string;
  status: string;
  statusLabel: string;
  atualizadoEm: string;
  progresso: number;
  pendencias: number;
  unidades: number;
}

/** Alias do modelo usado na tela de detalhe (abas internas ainda parcialmente mock). */
export type EmpreendimentoView = Empreendimento;

export interface WizardTorre {
  nome: string;
  pavimentos: number;
  unidadesPorPavimento: number;
  totalUnidades: number;
}

export interface CreateEmpreendimentoInput {
  organizationId: number;
  profileId: number;
  identificacao: {
    nome: string;
    incorporadora: string;
    cnpj: string;
    representante: string;
  };
  localizacao: {
    endereco: string;
    matricula: string;
    cidade: string;
    uf: string;
    lote: string;
    quadra: string;
    bairro: string;
  };
  torres: WizardTorre[];
  unidades: {
    total: number;
    tipos: string[];
    vagas: number;
  };
  areas: {
    terreno: string;
    construida: string;
    privativa: string;
    comum: string;
  };
  equipe: {
    responsavel: string;
    creaCau: string;
    observacoes: string;
  };
}

export interface UpdateEmpreendimentoInput {
  organizationId: number;
  empreendimentoId: number;
  nome?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  lote?: string;
  quadra?: string;
  matricula?: string;
}
