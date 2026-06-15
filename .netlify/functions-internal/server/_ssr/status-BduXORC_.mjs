const MEMORIAL_LABELS = {
  rascunho: "Rascunho",
  gerado: "Memorial gerado",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  exportado: "Exportado"
};
const SECAO_LABELS = {
  nao_gerada: "Não gerada",
  gerada: "Gerada",
  em_revisao: "Em revisão",
  com_pendencia: "Com pendência",
  aprovada: "Aprovada"
};
const SECAO_LABEL_TO_DB = {
  "Não gerada": "nao_gerada",
  Gerada: "gerada",
  "Em revisão": "em_revisao",
  "Com pendência": "com_pendencia",
  Aprovada: "aprovada"
};
function getMemorialStatusLabel(status) {
  return MEMORIAL_LABELS[status] ?? status;
}
function getSecaoStatusLabel(status) {
  return SECAO_LABELS[status] ?? status;
}
function resolveSecaoStatusLabel(status) {
  if (SECAO_LABELS[status]) return SECAO_LABELS[status];
  if (SECAO_LABEL_TO_DB[status]) return status;
  return status;
}
function isUnidadesSection(titulo) {
  const normalized = titulo.toLowerCase().normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "");
  return normalized.includes("descricao das unidades") || normalized.includes("descrição das unidades");
}
function formatSecaoSumarioNumero(ordem) {
  if (ordem <= 0) return "—";
  return String(ordem).padStart(2, "0");
}
const STATUS_LABELS = {
  validado: "Validado",
  pendente: "Pendente",
  inconsistencia: "Inconsistência",
  nao_revisado: "Não revisado"
};
const LABEL_TO_DB = {
  Validado: "validado",
  Pendente: "pendente",
  Inconsistência: "inconsistencia",
  "Não revisado": "nao_revisado"
};
function getUnidadeStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}
function resolveUnidadeStatusLabel(status) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  if (LABEL_TO_DB[status]) return status;
  return status;
}
export {
  resolveUnidadeStatusLabel as a,
  getMemorialStatusLabel as b,
  getUnidadeStatusLabel as c,
  formatSecaoSumarioNumero as f,
  getSecaoStatusLabel as g,
  isUnidadesSection as i,
  resolveSecaoStatusLabel as r
};
