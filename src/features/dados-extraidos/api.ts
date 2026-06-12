import { fetchEmpreendimentoDetail } from "@/features/empreendimentos/api";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import type { Empreendimento } from "@/lib/mock-data";

import { validateCampoValor } from "./schemas";
import { BLOCOS_ORDEM, getBlocoTitulo } from "./status";
import { buildSeedFieldsFromEmpreendimento } from "./seed-template";
import type { DadoExtraidoRecord, DadoExtraidoStatus, DadosExtraidosView } from "./types";

type DadoRow = {
  id: number;
  empreendimento_id: number;
  quadro_tecnico_id: number | null;
  bloco: string;
  campo: string;
  valor: string | null;
  confianca: number | null;
  status: string;
  reviewed_at: string | null;
  reviewed_by_profile_id: number | null;
};

function mapRow(row: DadoRow): DadoExtraidoRecord {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    quadroTecnicoId: row.quadro_tecnico_id,
    bloco: row.bloco,
    campo: row.campo,
    valor: row.valor ?? "",
    confianca: row.confianca,
    status: row.status as DadoExtraidoStatus,
    reviewedAt: row.reviewed_at,
    reviewedByProfileId: row.reviewed_by_profile_id,
  };
}

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

function groupIntoView(records: DadoExtraidoRecord[]): DadosExtraidosView {
  const blocoMap = new Map<string, DadoExtraidoRecord[]>();

  for (const record of records) {
    const list = blocoMap.get(record.bloco) ?? [];
    list.push(record);
    blocoMap.set(record.bloco, list);
  }

  const blocos = BLOCOS_ORDEM.filter((b) => blocoMap.has(b)).map((bloco) => ({
    bloco,
    titulo: getBlocoTitulo(bloco),
    campos: blocoMap.get(bloco) ?? [],
  }));

  const totalCampos = records.length;
  const camposConfirmados = records.filter((r) => r.status === "confirmado").length;
  const progressoValidacao =
    totalCampos > 0 ? Math.round((camposConfirmados / totalCampos) * 100) : 0;

  return { blocos, progressoValidacao, totalCampos, camposConfirmados };
}

export async function fetchDadosExtraidos(empreendimentoId: number): Promise<DadosExtraidosView> {
  const { data, error } = await supabase
    .from("dados_extraidos")
    .select("*")
    .eq("empreendimento_id", empreendimentoId)
    .order("bloco")
    .order("campo");

  if (error) throw error;

  return groupIntoView((data as DadoRow[]).map(mapRow));
}

export async function seedDadosExtraidos(input: {
  empreendimentoId: number;
  quadroTecnicoId: number;
  emp: Empreendimento;
}): Promise<void> {
  const fields = buildSeedFieldsFromEmpreendimento(input.emp);

  await supabase
    .from("dados_extraidos")
    .delete()
    .eq("empreendimento_id", input.empreendimentoId)
    .eq("quadro_tecnico_id", input.quadroTecnicoId);

  const { error } = await supabase.from("dados_extraidos").insert(
    fields.map((f) => ({
      empreendimento_id: input.empreendimentoId,
      quadro_tecnico_id: input.quadroTecnicoId,
      bloco: f.bloco,
      campo: f.campo,
      valor: f.valor,
      confianca: f.confianca,
      status: f.status,
    })),
  );

  if (error) throw error;
}

async function fetchLatestQuadroProcessadoId(empreendimentoId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("quadros_tecnicos")
    .select("id, status")
    .eq("empreendimento_id", empreendimentoId)
    .eq("status", "processado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function ensureDadosExtraidosSeeded(empreendimentoId: number): Promise<void> {
  const { count, error: countError } = await supabase
    .from("dados_extraidos")
    .select("id", { count: "exact", head: true })
    .eq("empreendimento_id", empreendimentoId);

  if (countError) throw countError;
  if ((count ?? 0) > 0) return;

  const quadroId = await fetchLatestQuadroProcessadoId(empreendimentoId);
  if (!quadroId) return;

  const emp = await fetchEmpreendimentoDetail(empreendimentoId);
  if (!emp) return;

  await seedDadosExtraidos({
    empreendimentoId,
    quadroTecnicoId: quadroId,
    emp,
  });
}

export async function updateDadoExtraido(input: {
  id: number;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  campo: string;
  valor: string;
  valorAnterior: string;
  statusAtual: DadoExtraidoStatus;
}): Promise<void> {
  const validationError = validateCampoValor(input.campo, input.valor);
  if (validationError) {
    throw new Error(validationError);
  }

  const valorAlterado = input.valor.trim() !== input.valorAnterior.trim();
  if (!valorAlterado) return;

  const status: DadoExtraidoStatus = input.statusAtual === "confirmado" ? "confirmado" : "editado";

  const { error } = await supabase
    .from("dados_extraidos")
    .update({
      valor: input.valor.trim(),
      status,
      reviewed_by_profile_id: input.profileId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) throw error;

  if (status === "editado" || status === "confirmado") {
    await logAudit(
      input.organizationId,
      input.empreendimentoId,
      "edicao",
      `Campo "${input.campo}" editado na validação de dados extraídos.`,
      { dado_extraido_id: input.id, campo: input.campo },
    );
  }
}

export async function confirmarBlocoDados(input: {
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  bloco: string;
  campoIds: number[];
  valores: { id: number; campo: string; valor: string }[];
}): Promise<void> {
  if (input.campoIds.length === 0) return;

  for (const campo of input.valores) {
    const validationError = validateCampoValor(campo.campo, campo.valor);
    if (validationError) {
      throw new Error(`${campo.campo}: ${validationError}`);
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("dados_extraidos")
    .update({
      status: "confirmado",
      reviewed_by_profile_id: input.profileId,
      reviewed_at: now,
    })
    .eq("empreendimento_id", input.empreendimentoId)
    .eq("bloco", input.bloco)
    .in("id", input.campoIds);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "validacao",
    `Bloco "${input.bloco}" confirmado na validação técnica.`,
    { bloco: input.bloco, campos: input.campoIds.length },
  );

  const view = await fetchDadosExtraidos(input.empreendimentoId);
  if (view.progressoValidacao >= 100) {
    await supabase
      .from("empreendimentos")
      .update({ status: "em_validacao", progresso: 55 })
      .eq("id", input.empreendimentoId);
  }
}
