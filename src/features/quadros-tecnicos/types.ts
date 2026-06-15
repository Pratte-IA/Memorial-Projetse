export type QuadroTecnicoStatus = "enviado" | "processando" | "processado" | "erro";

export interface QuadroTecnicoRecord {
  id: number;
  empreendimentoId: number;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: QuadroTecnicoStatus;
  uploadedByProfileId: number | null;
  createdAt: string;
  processedAt: string | null;
}

export interface UploadQuadroInput {
  file: File;
  /** Buffer original garante re-upload fiel após parse no wizard. */
  fileBuffer?: ArrayBuffer;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}
