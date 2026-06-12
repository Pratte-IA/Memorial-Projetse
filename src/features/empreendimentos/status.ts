/** Status persistidos no banco (snake_case). */
export const DB_EMPREENDIMENTO_STATUS = {
  rascunho: "rascunho",
  quadro_enviado: "quadro_enviado",
  dados_extraidos: "dados_extraidos",
  em_validacao: "em_validacao",
  pronto_para_gerar: "pronto_para_gerar",
  memorial_gerado: "memorial_gerado",
  em_revisao: "em_revisao",
  aprovado: "aprovado",
  exportado: "exportado",
} as const;

export type DbEmpreendimentoStatus =
  (typeof DB_EMPREENDIMENTO_STATUS)[keyof typeof DB_EMPREENDIMENTO_STATUS];

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  quadro_enviado: "Quadro enviado",
  dados_extraidos: "Dados extraídos",
  em_validacao: "Em validação",
  pronto_para_gerar: "Pronto para gerar",
  memorial_gerado: "Memorial gerado",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  exportado: "Exportado",
};

const LABEL_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([db, label]) => [label, db]),
);

export const STATUS_FILTER_OPTIONS = [
  { label: "Todos", dbStatus: null },
  { label: "Em revisão", dbStatus: "em_revisao" },
  { label: "Dados extraídos", dbStatus: "dados_extraidos" },
  { label: "Pronto para gerar", dbStatus: "pronto_para_gerar" },
  { label: "Aprovado", dbStatus: "aprovado" },
] as const;

export function getEmpreendimentoStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function resolveStatusLabel(status: string): string {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  if (LABEL_TO_DB[status]) return status;
  return status;
}

export function statusLabelToDb(label: string): string | null {
  if (label === "Todos") return null;
  return LABEL_TO_DB[label] ?? label;
}
