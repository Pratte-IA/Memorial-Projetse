import { fetchMemorial } from "@/features/memorial/api";
import { fetchUnidades } from "@/features/unidades/api";
import {
  downloadModeloTimbrado,
  fetchTimbradoPdfForExport,
} from "@/features/documentos/api";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { buildMemorialDocument } from "./build-document";
import { DOCUMENTOS_EXPORTADOS_BUCKET } from "./constants";
import { createDocxBlob } from "./generators";
import { createPdfBlobWithTimbrado } from "./pdf-timbrado";
import { mapRowToExportacao } from "./mappers";
import type {
  ExportDocumentInput,
  ExportacaoRecord,
  ExportFormato,
  PendenciasBloqueantesResumo,
} from "./types";

const EXPORT_SELECT = `
  id,
  memorial_id,
  empreendimento_id,
  tipo,
  formato,
  status,
  storage_path,
  created_at,
  profiles:created_by_profile_id ( full_name ),
  memoriais ( versao )
`;

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

function slugifyNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildStoragePath(
  organizationId: number,
  empreendimentoId: number,
  empreendimentoNome: string,
  versao: number,
  tipo: string,
  formato: ExportFormato,
): string {
  const slug = slugifyNome(empreendimentoNome) || `emp_${empreendimentoId}`;
  const stamp = Date.now();
  const ext = formato === "pdf" ? "pdf" : "docx";
  const fileName = `${slug}_v${versao}_${tipo}_${stamp}.${ext}`;
  return `${organizationId}/${empreendimentoId}/${fileName}`;
}

function mimeForFormato(formato: ExportFormato): string {
  return formato === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export async function fetchPendenciasBloqueantes(
  empreendimentoId: number,
): Promise<PendenciasBloqueantesResumo> {
  const { data, error } = await supabase
    .from("pendencias")
    .select("mensagem")
    .eq("empreendimento_id", empreendimentoId)
    .eq("status", "aberta")
    .eq("severidade", "bloqueante");

  if (error) throw error;

  const mensagens = (data ?? []).map((p) => p.mensagem);
  return { total: mensagens.length, mensagens };
}

export async function fetchExportacoes(empreendimentoId: number): Promise<ExportacaoRecord[]> {
  const { data, error } = await supabase
    .from("document_exports")
    .select(EXPORT_SELECT)
    .eq("empreendimento_id", empreendimentoId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as Parameters<typeof mapRowToExportacao>[0][])
    .map(mapRowToExportacao)
    .filter((r): r is ExportacaoRecord => r !== null);
}

export async function exportDocument(input: ExportDocumentInput): Promise<ExportacaoRecord> {
  if (input.tipo === "final") {
    const bloqueantes = await fetchPendenciasBloqueantes(input.empreendimentoId);
    if (bloqueantes.total > 0) {
      throw new Error(
        `Exportação final bloqueada: ${bloqueantes.total} pendência(s) bloqueante(s) aberta(s).`,
      );
    }
  }

  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) {
    throw new Error("Memorial não encontrado. Gere o memorial antes de exportar.");
  }

  const unidades = await fetchUnidades(input.empreendimentoId);
  const memorialDocument = buildMemorialDocument({
    empreendimentoNome: input.empreendimentoNome,
    memorial,
    tipo: input.tipo,
    unidades,
  });

  let blob: Blob;
  let timbradoModeloId: number | null = null;

  if (input.formato === "pdf") {
    const timbrado = await fetchTimbradoPdfForExport(input.organizationId);
    if (!timbrado?.storagePath) {
      throw new Error(
        "Nenhum timbrado PDF ativo cadastrado. Cadastre um modelo em Modelos de Documento.",
      );
    }

    const timbradoBytes = await downloadModeloTimbrado(timbrado.storagePath);
    blob = await createPdfBlobWithTimbrado(memorialDocument, timbradoBytes);
    timbradoModeloId = timbrado.id;
  } else {
    blob = createDocxBlob(memorialDocument);
  }

  const storagePath = buildStoragePath(
    input.organizationId,
    input.empreendimentoId,
    input.empreendimentoNome,
    memorial.versao,
    input.tipo,
    input.formato,
  );

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTOS_EXPORTADOS_BUCKET)
    .upload(storagePath, blob, {
      contentType: mimeForFormato(input.formato),
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: inserted, error: insertError } = await supabase
    .from("document_exports")
    .insert({
      memorial_id: memorial.id,
      empreendimento_id: input.empreendimentoId,
      tipo: input.tipo,
      formato: input.formato,
      storage_path: storagePath,
      status: "exportado",
      created_by_profile_id: input.profileId,
    })
    .select(EXPORT_SELECT)
    .single();

  if (insertError) throw insertError;

  const record = mapRowToExportacao(inserted as Parameters<typeof mapRowToExportacao>[0]);
  if (!record) throw new Error("Falha ao registrar exportação.");

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "exportacao",
    `Exportou memorial ${input.tipo.toUpperCase()} (${input.formato.toUpperCase()}) v${memorial.versao}.`,
    {
      export_id: record.id,
      storage_path: storagePath,
      tipo: input.tipo,
      formato: input.formato,
      modelo_id: timbradoModeloId,
    },
  );

  if (input.tipo === "final") {
    await supabase.from("memoriais").update({ status: "exportado" }).eq("id", memorial.id);
  }

  return record;
}

export async function getExportDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DOCUMENTOS_EXPORTADOS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("URL de download indisponível.");
  return data.signedUrl;
}
