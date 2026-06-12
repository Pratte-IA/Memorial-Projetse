import type { MemorialDbStatus, SecaoDbStatus } from "./types";

const MEMORIAL_LABELS: Record<MemorialDbStatus, string> = {
  rascunho: "Rascunho",
  gerado: "Memorial gerado",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  exportado: "Exportado",
};

const SECAO_LABELS: Record<SecaoDbStatus, string> = {
  nao_gerada: "Não gerada",
  gerada: "Gerada",
  em_revisao: "Em revisão",
  com_pendencia: "Com pendência",
  aprovada: "Aprovada",
};

const SECAO_LABEL_TO_DB: Record<string, SecaoDbStatus> = {
  "Não gerada": "nao_gerada",
  Gerada: "gerada",
  "Em revisão": "em_revisao",
  "Com pendência": "com_pendencia",
  Aprovada: "aprovada",
};

export function getMemorialStatusLabel(status: MemorialDbStatus | string): string {
  return MEMORIAL_LABELS[status as MemorialDbStatus] ?? status;
}

export function getSecaoStatusLabel(status: SecaoDbStatus | string): string {
  return SECAO_LABELS[status as SecaoDbStatus] ?? status;
}

export function resolveSecaoStatusLabel(status: string): string {
  if (SECAO_LABELS[status as SecaoDbStatus]) return SECAO_LABELS[status as SecaoDbStatus];
  if (SECAO_LABEL_TO_DB[status]) return status;
  return status;
}

export function isUnidadesSection(titulo: string): boolean {
  return titulo.toLowerCase().includes("unidades autônomas");
}
