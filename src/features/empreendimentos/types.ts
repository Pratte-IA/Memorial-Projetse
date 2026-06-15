import type { Empreendimento } from "@/lib/mock-data";

import type {
  IncorporadoraForm,
  ImovelView,
  CondominioEspacoComumView,
  CondominioPavimentoView,
  PendenciaVisao,
  Representante,
} from "./types/detail-types";

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

/** Modelo completo da tela de detalhe com dados jurídicos e do imóvel. */
export type EmpreendimentoView = Empreendimento & {
  incorporadoraEndereco: IncorporadoraForm;
  representantes: Representante[];
  imovel: ImovelView;
  areaPrivativaTotal: number;
  areaComumTotal: number;
  pavimentosAreas: CondominioPavimentoView[];
  espacosComuns: CondominioEspacoComumView[];
  pendenciasAbertas: PendenciaVisao[];
};

export interface WizardTorre {
  nome: string;
  pavimentos: number;
  unidadesPorPavimento: number;
  totalUnidades: number;
}

import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";

export interface CreateEmpreendimentoInput {
  organizationId: number;
  profileId: number;
  identificacao: {
    nome: string;
    incorporadora: string;
    cnpj: string;
    representante: string;
    incorporadoraEndereco: string;
    socios: string[];
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
  aprovacao: {
    alvara: string;
    dataAprovacao: string;
  };
}

export interface ArquivoQuadroImportado {
  name: string;
  type: string;
  size: number;
  buffer: ArrayBuffer;
}

export interface CreateEmpreendimentoFromNbrInput {
  documento: DocumentoNbrExtraido;
  arquivo: ArquivoQuadroImportado;
  organizationId: number;
  profileId: number;
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

export interface DeleteEmpreendimentoInput {
  organizationId: number;
  empreendimentoId: number;
  nome: string;
}
