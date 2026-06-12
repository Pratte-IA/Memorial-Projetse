import type { UnidadeDbStatus } from "./types";

const STATUS_LABELS: Record<UnidadeDbStatus, string> = {
  validado: "Validado",
  pendente: "Pendente",
  inconsistencia: "Inconsistência",
  nao_revisado: "Não revisado",
};

const LABEL_TO_DB: Record<string, UnidadeDbStatus> = {
  Validado: "validado",
  Pendente: "pendente",
  Inconsistência: "inconsistencia",
  "Não revisado": "nao_revisado",
};

export const UNIDADE_STATUS_FILTROS = [
  { label: "Todos", dbStatus: null },
  { label: "Validado", dbStatus: "validado" as const },
  { label: "Pendente", dbStatus: "pendente" as const },
  { label: "Inconsistência", dbStatus: "inconsistencia" as const },
] as const;

export function getUnidadeStatusLabel(status: UnidadeDbStatus | string): string {
  return STATUS_LABELS[status as UnidadeDbStatus] ?? status;
}

export function resolveUnidadeStatusLabel(status: string): string {
  if (STATUS_LABELS[status as UnidadeDbStatus]) return STATUS_LABELS[status as UnidadeDbStatus];
  if (LABEL_TO_DB[status]) return status;
  return status;
}

export function statusLabelToDb(label: string): UnidadeDbStatus | null {
  if (label === "Todos") return null;
  return LABEL_TO_DB[label] ?? null;
}
