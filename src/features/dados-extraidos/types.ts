export type DadoExtraidoStatus =
  | "extraido"
  | "confirmado"
  | "editado"
  | "baixa_confianca"
  | "pendente";

export interface DadoExtraidoRecord {
  id: number;
  empreendimentoId: number;
  quadroTecnicoId: number | null;
  bloco: string;
  campo: string;
  valor: string;
  confianca: number | null;
  status: DadoExtraidoStatus;
  reviewedAt: string | null;
  reviewedByProfileId: number | null;
}

export interface DadoExtraidoBloco {
  bloco: string;
  titulo: string;
  campos: DadoExtraidoRecord[];
}

export interface DadosExtraidosView {
  blocos: DadoExtraidoBloco[];
  progressoValidacao: number;
  totalCampos: number;
  camposConfirmados: number;
}
