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
  const normalized = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return (
    normalized.includes("descricao das unidades") ||
    normalized.includes("descrição das unidades")
  );
}

export function formatSecaoSumarioNumero(ordem: number): string {
  if (ordem <= 0) return "—";
  return String(ordem).padStart(2, "0");
}

/** Seção adicionada manualmente a este memorial (não vem do modelo padrão). */
export function isSecaoExtra(secao: { clausulaId: number | null }): boolean {
  return secao.clausulaId === null;
}

/** Maior número de cláusula numerada (ordem > 0) no memorial. */
export function maxNumeroClausulaMemorial(secoes: Array<{ ordem: number }>): number {
  return secoes.reduce((max, s) => (s.ordem > 0 ? Math.max(max, s.ordem) : max), 0);
}
