export interface ModeloRecord {
  id: number;
  organizationId: number;
  nome: string;
  tipo: string;
  status: string;
  statusLabel: string;
  atualizadoEm: string;
  storagePath: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  hasTimbrado: boolean;
}

export interface CreateModeloTimbradoInput {
  organizationId: number;
  nome: string;
  tipo: string;
  file: File;
}

export interface ClausulaRecord {
  id: number;
  organizationId: number;
  modeloId: number | null;
  titulo: string;
  categoria: string;
  resumo: string;
  template: string;
  variaveis: string[];
  status: string;
  statusLabel: string;
  ordem: number;
  atualizadoEm: string;
}

export type ClausulaStatus = "publicada" | "em_revisao";

export interface UpdateClausulaInput {
  id: number;
  organizationId: number;
  titulo: string;
  categoria: string;
  resumo: string;
  template: string;
  status: ClausulaStatus;
}

export interface DuplicateClausulaInput {
  source: ClausulaRecord;
  maxOrdem: number;
}
