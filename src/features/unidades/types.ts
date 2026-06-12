export type UnidadeDbStatus = "validado" | "pendente" | "inconsistencia" | "nao_revisado";

export interface UnidadeRecord {
  id: number;
  empreendimentoId: number;
  nome: string;
  torre: string;
  pavimento: string;
  tipo: string;
  areaPrivativa: number;
  areaComum: number;
  areaTotal: number;
  garden: number;
  vaga: string;
  fracao: string;
  status: UnidadeDbStatus;
  statusLabel: string;
  confrontacoes: string;
  observacoes: string;
}

export interface UnidadesResumo {
  total: number;
  validado: number;
  pendente: number;
  inconsistencia: number;
  naoRevisado: number;
}

export interface UpdateUnidadeInput {
  id: number;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  patch: {
    nome?: string;
    torre?: string;
    pavimento?: string;
    tipo?: string;
    vaga?: string;
    fracao?: string;
    confrontacoes?: string;
    areaPrivativa?: number;
    areaComum?: number;
    areaTotal?: number;
    areaGarden?: number;
  };
}
