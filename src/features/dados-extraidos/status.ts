import type { DadoExtraidoStatus } from "./types";

const STATUS_LABELS: Record<DadoExtraidoStatus, string> = {
  confirmado: "Confirmado",
  extraido: "Extraído",
  editado: "Editado",
  baixa_confianca: "Baixa confiança",
  pendente: "Pendente",
};

const BLOCO_TITULOS: Record<string, string> = {
  empreendimento: "Empreendimento",
  incorporadora: "Incorporadora",
  areas: "Áreas",
  aprovacao: "Aprovação",
};

export const BLOCOS_ORDEM = ["empreendimento", "incorporadora", "areas", "aprovacao"] as const;

export function getDadoStatusLabel(status: DadoExtraidoStatus | string): string {
  return STATUS_LABELS[status as DadoExtraidoStatus] ?? status;
}

export function getBlocoTitulo(bloco: string): string {
  return BLOCO_TITULOS[bloco] ?? bloco;
}

export function isCampoConfirmado(status: DadoExtraidoStatus): boolean {
  return status === "confirmado";
}
