import { c as supabase } from "./router-B3TCsBUu.mjs";
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}
function modeloStatusLabel(status) {
  return status === "ativo" ? "Ativo" : "Rascunho";
}
function clausulaStatusLabel(status) {
  return status === "publicada" ? "Publicada" : "Em revisão";
}
function mapRowToModelo(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    nome: row.nome,
    tipo: row.tipo ?? "—",
    status: row.status,
    statusLabel: modeloStatusLabel(row.status),
    atualizadoEm: formatDate(row.updated_at)
  };
}
function mapRowToClausula(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    modeloId: row.modelo_id,
    titulo: row.titulo,
    categoria: row.categoria ?? "—",
    resumo: row.resumo ?? "",
    template: row.template,
    variaveis: row.variaveis ?? [],
    status: row.status,
    statusLabel: clausulaStatusLabel(row.status),
    ordem: row.ordem,
    atualizadoEm: formatDate(row.updated_at)
  };
}
async function fetchModelos(organizationId) {
  const { data, error } = await supabase.from("modelos_documento").select("*").eq("organization_id", organizationId).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRowToModelo);
}
async function fetchClausulas(organizationId) {
  const { data, error } = await supabase.from("clausulas").select("*").eq("organization_id", organizationId).order("ordem");
  if (error) throw error;
  return (data ?? []).map(mapRowToClausula);
}
export {
  fetchClausulas as a,
  fetchModelos as f
};
