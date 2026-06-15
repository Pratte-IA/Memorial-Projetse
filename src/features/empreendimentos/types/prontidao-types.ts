import type { DadoExtraidoRecord } from "@/features/dados-extraidos/types";

export type QuadroBlocoStatusUi =
  | "validado"
  | "extraido"
  | "parcial"
  | "pendente"
  | "ausente";

export interface QuadroBlocoIntegridade {
  bloco: string;
  titulo: string;
  clausulaRef: string;
  status: QuadroBlocoStatusUi;
  totalCampos: number;
  camposConfirmados: number;
  validatedAt: string | null;
  detalhe?: string;
}

export type ProntidaoItemStatus = "ok" | "atencao" | "bloqueante" | "nao_aplicavel";

export type ProntidaoGrupo = "cadastro" | "quadros" | "unidades" | "memorial" | "anexo";

export interface ProntidaoItem {
  id: string;
  grupo: ProntidaoGrupo;
  titulo: string;
  descricao: string;
  clausula?: string;
  status: ProntidaoItemStatus;
  detalhe?: string;
}

export interface ProntidaoExportacaoView {
  quadros: QuadroBlocoIntegridade[];
  itens: ProntidaoItem[];
  progressoGeral: number;
  quadrosValidados: number;
  quadrosTotal: number;
  prontoExportacaoFinal: boolean;
}

export interface IntegridadeQuadrosInput {
  blocos: { bloco: string; titulo: string; campos: DadoExtraidoRecord[] }[];
  unidadesTotal: number;
  unidadesValidadas: number;
}
