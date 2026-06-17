import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { MODELO_TIPO_PADRAO, MODELOS_DOCUMENTO_BUCKET } from "./constants";
import { mapRowToClausula, mapRowToModelo } from "./mappers";
import type {
  ClausulaRecord,
  CreateModeloTimbradoInput,
  DuplicateClausulaInput,
  ModeloRecord,
  UpdateClausulaInput,
} from "./types";
import {
  buildModeloStoragePath,
  extractVariaveisFromTemplate,
  resolveTimbradoContentType,
} from "./utils";

async function logAudit(
  organizationId: number,
  eventType: string,
  description: string,
  metadata?: Json,
) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: null as unknown as number,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null,
  });
  if (error) throw error;
}

export async function fetchModelos(organizationId: number): Promise<ModeloRecord[]> {
  const { data, error } = await supabase
    .from("modelos_documento")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRowToModelo);
}

export async function createModeloTimbrado(
  input: CreateModeloTimbradoInput,
): Promise<ModeloRecord> {
  const { data: inserted, error: insertError } = await supabase
    .from("modelos_documento")
    .insert({
      organization_id: input.organizationId,
      nome: input.nome.trim(),
      tipo: input.tipo.trim() || MODELO_TIPO_PADRAO,
      status: "ativo",
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  const modeloId = inserted.id as number;
  const storagePath = buildModeloStoragePath(input.organizationId, modeloId, input.file.name);
  const contentType = resolveTimbradoContentType(input.file.name, input.file.type);

  const { error: uploadError } = await supabase.storage
    .from(MODELOS_DOCUMENTO_BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (uploadError) {
    await supabase.from("modelos_documento").delete().eq("id", modeloId);
    throw uploadError;
  }

  const { data: updated, error: updateError } = await supabase
    .from("modelos_documento")
    .update({
      storage_path: storagePath,
      file_name: input.file.name,
      mime_type: contentType,
      size_bytes: input.file.size,
    })
    .eq("id", modeloId)
    .select("*")
    .single();

  if (updateError) {
    await supabase.storage.from(MODELOS_DOCUMENTO_BUCKET).remove([storagePath]);
    await supabase.from("modelos_documento").delete().eq("id", modeloId);
    throw updateError;
  }

  const record = mapRowToModelo(updated);

  await logAudit(
    input.organizationId,
    "modelo",
    `Timbrado "${input.nome}" cadastrado.`,
    { modelo_id: modeloId, storage_path: storagePath },
  );

  return record;
}

export async function deleteModelo(modelo: ModeloRecord): Promise<void> {
  if (modelo.storagePath) {
    const { error: storageError } = await supabase.storage
      .from(MODELOS_DOCUMENTO_BUCKET)
      .remove([modelo.storagePath]);

    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase
    .from("modelos_documento")
    .delete()
    .eq("id", modelo.id);

  if (deleteError) throw deleteError;

  await logAudit(
    modelo.organizationId,
    "modelo",
    `Modelo "${modelo.nome}" excluído.`,
    { modelo_id: modelo.id },
  );
}

export async function getModeloSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MODELOS_DOCUMENTO_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("URL de download indisponível.");
  return data.signedUrl;
}

function isPdfTimbrado(modelo: ModeloRecord): boolean {
  if (!modelo.hasTimbrado || !modelo.storagePath) return false;
  if (modelo.mimeType === "application/pdf") return true;
  return modelo.fileName?.toLowerCase().endsWith(".pdf") ?? false;
}

/** Timbrado PDF ativo mais recente da organização (para exportação). */
export async function fetchTimbradoPdfForExport(
  organizationId: number,
): Promise<ModeloRecord | null> {
  const modelos = await fetchModelos(organizationId);
  return modelos.find((modelo) => modelo.status === "ativo" && isPdfTimbrado(modelo)) ?? null;
}

export async function downloadModeloTimbrado(storagePath: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from(MODELOS_DOCUMENTO_BUCKET)
    .download(storagePath);

  if (error) throw error;
  if (!data) throw new Error("Timbrado não encontrado no storage.");

  return data.arrayBuffer();
}

export async function fetchClausulas(organizationId: number): Promise<ClausulaRecord[]> {
  const { data, error } = await supabase
    .from("clausulas")
    .select("*")
    .eq("organization_id", organizationId)
    .order("ordem");

  if (error) throw error;
  return (data ?? []).map(mapRowToClausula);
}

export async function fetchClausulaById(id: number): Promise<ClausulaRecord | null> {
  const { data, error } = await supabase.from("clausulas").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToClausula(data) : null;
}

export async function updateClausula(input: UpdateClausulaInput): Promise<ClausulaRecord> {
  const variaveis = extractVariaveisFromTemplate(input.template);

  const { data, error } = await supabase
    .from("clausulas")
    .update({
      titulo: input.titulo.trim(),
      categoria: input.categoria.trim(),
      resumo: input.resumo.trim(),
      template: input.template,
      variaveis,
      status: input.status,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;

  const record = mapRowToClausula(data);

  await logAudit(
    input.organizationId,
    "clausula",
    `Cláusula "${record.titulo}" atualizada.`,
    { clausula_id: record.id },
  );

  return record;
}

export async function duplicateClausula(input: DuplicateClausulaInput): Promise<ClausulaRecord> {
  const { source, maxOrdem } = input;

  const { data, error } = await supabase
    .from("clausulas")
    .insert({
      organization_id: source.organizationId,
      modelo_id: source.modeloId,
      titulo: `${source.titulo} (cópia)`,
      categoria: source.categoria,
      resumo: source.resumo,
      template: source.template,
      variaveis: source.variaveis,
      status: "em_revisao",
      ordem: maxOrdem + 1,
    })
    .select("*")
    .single();

  if (error) throw error;

  const record = mapRowToClausula(data);

  await logAudit(
    source.organizationId,
    "clausula",
    `Cláusula "${source.titulo}" duplicada.`,
    { clausula_id: record.id, source_clausula_id: source.id },
  );

  return record;
}
