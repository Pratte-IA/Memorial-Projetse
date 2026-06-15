import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { QUADROS_TECNICOS_BUCKET } from "./constants";
import { resolveQuadroContentType } from "./mime";
import type { QuadroTecnicoRecord, QuadroTecnicoStatus, UploadQuadroInput } from "./types";
import { buildQuadroStoragePath } from "./utils";

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

export interface PersistQuadroOptions {
  status?: QuadroTecnicoStatus;
  processedAt?: string | null;
  auditEventType?: string;
  auditDescription?: string;
  /** Quando true, grava metadados em `quadros_tecnicos` mesmo se o storage falhar. */
  allowStorageFailure?: boolean;
}

async function uploadQuadroBlob(
  storagePath: string,
  payload: Blob | File | ArrayBuffer,
  contentType: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const body =
    payload instanceof Blob || payload instanceof File
      ? payload
      : new Blob([payload], { type: contentType });

  const { error } = await supabase.storage.from(QUADROS_TECNICOS_BUCKET).upload(storagePath, body, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function persistQuadroFile(
  input: UploadQuadroInput,
  options: PersistQuadroOptions = {},
): Promise<QuadroTecnicoRecord> {
  const status = options.status ?? "enviado";
  const processedAt = options.processedAt ?? null;
  const contentType = resolveQuadroContentType(input.file.name, input.file.type);
  const payload = input.fileBuffer ?? input.file;

  const storagePath = buildQuadroStoragePath(
    input.organizationId,
    input.empreendimentoId,
    input.file.name,
  );

  const uploadResult = await uploadQuadroBlob(storagePath, payload, contentType);
  const storageOk = uploadResult.ok;

  if (!storageOk && !options.allowStorageFailure) {
    throw new Error(
      uploadResult.message || "Não foi possível enviar o arquivo para o storage do quadro técnico.",
    );
  }

  const { data, error: insertError } = await supabase
    .from("quadros_tecnicos")
    .insert({
      empreendimento_id: input.empreendimentoId,
      storage_path: storagePath,
      file_name: input.file.name,
      mime_type: contentType,
      size_bytes: input.file.size,
      status,
      processed_at: processedAt,
      uploaded_by_profile_id: input.profileId,
    })
    .select("*")
    .single();

  if (insertError) {
    if (storageOk) {
      await supabase.storage.from(QUADROS_TECNICOS_BUCKET).remove([storagePath]);
    }
    throw insertError;
  }

  const record = mapRow(data as QuadroRow);

  if (options.auditDescription) {
    const metadata: Json = {
      quadro_tecnico_id: record.id,
      storage_path: storagePath,
      storage_uploaded: storageOk,
      ...(storageOk ? {} : { storage_error: uploadResult.ok ? null : uploadResult.message }),
    };
    const { error: auditError } = await supabase.rpc("log_audit_event", {
      p_organization_id: input.organizationId,
      p_empreendimento_id: input.empreendimentoId,
      p_event_type: options.auditEventType ?? "upload",
      p_description: options.auditDescription,
      p_metadata: metadata,
    });
    if (auditError) throw auditError;
  }

  return record;
}
