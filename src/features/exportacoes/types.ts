export type ExportTipo = "revisao" | "final";
export type ExportFormato = "docx" | "pdf";

export interface ExportacaoRecord {
  id: number;
  memorialId: number;
  empreendimentoId: number;
  tipo: ExportTipo;
  formato: ExportFormato;
  status: string;
  storagePath: string;
  fileName: string;
  memorialVersao: number | null;
  createdAt: string;
  createdByName: string;
}

export interface ExportDocumentInput {
  empreendimentoId: number;
  empreendimentoNome: string;
  organizationId: number;
  profileId: number;
  tipo: ExportTipo;
  formato: ExportFormato;
}

export interface PendenciasBloqueantesResumo {
  total: number;
  mensagens: string[];
}
