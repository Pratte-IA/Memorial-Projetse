import { seedDadosExtraidos } from "@/features/dados-extraidos/api";
import { fetchEmpreendimentoDetail } from "@/features/empreendimentos/api";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { QUADROS_TECNICOS_BUCKET } from "./constants";
import { persistQuadroFile } from "./persist-quadro";
import type { QuadroTecnicoRecord, QuadroTecnicoStatus, UploadQuadroInput } from "./types";

type QuadroRow = {
  id: number;
  empreendimento_id: number;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: string;
  uploaded_by_profile_id: number | null;
  created_at: string;
  processed_at: string | null;
};

function mapRow(row: QuadroRow): QuadroTecnicoRecord {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status as QuadroTecnicoStatus,
    uploadedByProfileId: row.uploaded_by_profile_id,
    createdAt: row.created_at,
    processedAt: row.processed_at,
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

export async function fetchLatestQuadroTecnico(
  empreendimentoId: number,
): Promise<QuadroTecnicoRecord | null> {
  const { data, error } = await supabase
    .from("quadros_tecnicos")
    .select("*")
    .eq("empreendimento_id", empreendimentoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data as QuadroRow);
}

export async function uploadQuadroTecnico(input: UploadQuadroInput): Promise<QuadroTecnicoRecord> {
  return persistQuadroFile(input, {
    auditDescription: `Quadro técnico "${input.file.name}" enviado.`,
  });
}

export async function updateQuadroTecnicoStatus(
  quadroId: number,
  status: QuadroTecnicoStatus,
  processedAt?: string | null,
): Promise<void> {
  const patch: { status: QuadroTecnicoStatus; processed_at?: string | null } = { status };
  if (processedAt !== undefined) patch.processed_at = processedAt;

  const { error } = await supabase.from("quadros_tecnicos").update(patch).eq("id", quadroId);
  if (error) throw error;
}

export async function processarQuadroTecnico(input: {
  quadroId: number;
  empreendimentoId: number;
  organizationId: number;
  unidadesCount: number;
}): Promise<void> {
  await updateQuadroTecnicoStatus(input.quadroId, "processando");

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "processamento",
    "Processamento do quadro técnico iniciado.",
    { quadro_tecnico_id: input.quadroId },
  );

  // Simulação até EPIC-07 conectar extração real (Edge Function).
  await new Promise((resolve) => setTimeout(resolve, 4200));

  await updateQuadroTecnicoStatus(input.quadroId, "processado", new Date().toISOString());

  await supabase
    .from("empreendimentos")
    .update({ status: "dados_extraidos", progresso: 35 })
    .eq("id", input.empreendimentoId);

  const emp = await fetchEmpreendimentoDetail(input.empreendimentoId);
  if (emp) {
    await seedDadosExtraidos({
      empreendimentoId: input.empreendimentoId,
      quadroTecnicoId: input.quadroId,
      emp,
    });
  }

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "processamento",
    `Quadro técnico processado. ${input.unidadesCount} unidades identificadas (simulação).`,
    { quadro_tecnico_id: input.quadroId },
  );
}

export async function createQuadroSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(QUADROS_TECNICOS_BUCKET)
    .createSignedUrl(storagePath, 300);

  if (error) throw error;
  return data.signedUrl;
}

export async function removeQuadroTecnico(
  quadro: QuadroTecnicoRecord,
  organizationId: number,
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(QUADROS_TECNICOS_BUCKET)
    .remove([quadro.storagePath]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("quadros_tecnicos")
    .delete()
    .eq("id", quadro.id);

  if (deleteError) throw deleteError;

  await logAudit(
    organizationId,
    quadro.empreendimentoId,
    "remocao",
    `Quadro técnico "${quadro.fileName}" removido.`,
    { quadro_tecnico_id: quadro.id },
  );
}
