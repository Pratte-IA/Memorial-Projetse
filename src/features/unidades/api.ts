import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { computeResumo, mapRowToUnidade } from "./mappers";
import { updateUnidadeSchema } from "./schemas";
import type { UnidadeDbStatus, UnidadeRecord, UnidadesResumo, UpdateUnidadeInput } from "./types";

async function logAudit(
  organizationId: number,
  empreendimentoId: number,
  eventType: string,
  description: string,
  metadata?: Json,
) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null,
  });
  if (error) throw error;
}

export async function fetchUnidades(empreendimentoId: number): Promise<UnidadeRecord[]> {
  const { data, error } = await supabase
    .from("unidades_autonomas")
    .select("*")
    .eq("empreendimento_id", empreendimentoId)
    .order("torre")
    .order("pavimento")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map(mapRowToUnidade);
}

export async function fetchUnidadesResumo(empreendimentoId: number): Promise<UnidadesResumo> {
  const unidades = await fetchUnidades(empreendimentoId);
  return computeResumo(unidades);
}

export async function updateUnidade(input: UpdateUnidadeInput): Promise<void> {
  const parsed = updateUnidadeSchema.safeParse({
    nome: input.patch.nome,
    torre: input.patch.torre,
    pavimento: input.patch.pavimento,
    tipo: input.patch.tipo,
    vaga: input.patch.vaga,
    fracao: input.patch.fracao,
    confrontacoes: input.patch.confrontacoes,
    areaPrivativa: input.patch.areaPrivativa,
    areaComum: input.patch.areaComum,
    areaTotal: input.patch.areaTotal,
    areaGarden: input.patch.areaGarden,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const v = parsed.data;

  const { error } = await supabase
    .from("unidades_autonomas")
    .update({
      nome: v.nome,
      torre: v.torre,
      pavimento: v.pavimento,
      tipo: v.tipo,
      vaga: v.vaga,
      fracao: v.fracao,
      confrontacoes: v.confrontacoes,
      area_privativa: v.areaPrivativa,
      area_comum: v.areaComum,
      area_total: v.areaTotal,
      area_garden: v.areaGarden,
    })
    .eq("id", input.id);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Unidade "${v.nome}" atualizada.`,
    { unidade_id: input.id },
  );
}

export async function updateUnidadeStatus(input: {
  ids: number[];
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  status: UnidadeDbStatus;
  descricaoAuditoria: string;
}): Promise<void> {
  if (input.ids.length === 0) return;

  const { error } = await supabase
    .from("unidades_autonomas")
    .update({ status: input.status })
    .eq("empreendimento_id", input.empreendimentoId)
    .in("id", input.ids);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "validacao",
    input.descricaoAuditoria,
    { unidade_ids: input.ids, status: input.status },
  );
}

export async function validarUnidadesEmMassa(input: {
  ids: number[];
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<number> {
  const pendentes = input.ids;
  if (pendentes.length === 0) return 0;

  await updateUnidadeStatus({
    ...input,
    ids: pendentes,
    status: "validado",
    descricaoAuditoria: `${pendentes.length} unidade(s) validada(s) em massa.`,
  });

  return pendentes.length;
}
