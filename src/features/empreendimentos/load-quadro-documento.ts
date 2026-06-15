import { parseQuadroNbrFile } from "@/features/quadro-nbr/parser";
import { QUADROS_TECNICOS_BUCKET } from "@/features/quadros-tecnicos/constants";
import { resolveQuadroContentType } from "@/features/quadros-tecnicos/mime";
import { supabase } from "@/lib/supabase/client";

import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";

async function fetchLatestQuadroRow(empreendimentoId: number) {
  const { data, error } = await supabase
    .from("quadros_tecnicos")
    .select("storage_path, file_name, mime_type")
    .eq("empreendimento_id", empreendimentoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function downloadQuadroBuffer(storagePath: string): Promise<ArrayBuffer | null> {
  const { data, error } = await supabase.storage
    .from(QUADROS_TECNICOS_BUCKET)
    .download(storagePath);

  if (error || !data) return null;
  return data.arrayBuffer();
}

export async function loadLatestQuadroDocumento(
  empreendimentoId: number,
): Promise<DocumentoNbrExtraido | null> {
  const quadro = await fetchLatestQuadroRow(empreendimentoId);
  if (!quadro) return null;

  const buffer = await downloadQuadroBuffer(quadro.storage_path);
  if (!buffer) return null;

  const file = new File([buffer], quadro.file_name, {
    type: resolveQuadroContentType(quadro.file_name, quadro.mime_type ?? undefined),
  });

  return parseQuadroNbrFile(file);
}
