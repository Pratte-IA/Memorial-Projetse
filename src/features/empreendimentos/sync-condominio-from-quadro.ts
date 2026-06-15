import {
  mapDocumentoToCondominioPavimentos,
  mapDocumentoToEspacosComuns,
} from "@/features/quadro-nbr/mapper";
import { parseQuadroNbrFile } from "@/features/quadro-nbr/parser";
import { QUADROS_TECNICOS_BUCKET } from "@/features/quadros-tecnicos/constants";
import { resolveQuadroContentType } from "@/features/quadros-tecnicos/mime";
import { supabase } from "@/lib/supabase/client";

import type { CondominioEspacoComumView, CondominioPavimentoView } from "./types/detail-types";
import { mapCondominioEspacosComunsEmbed, mapCondominioPavimentosEmbed } from "./mappers";

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

async function replaceCondominioComposicao(
  empreendimentoId: number,
  pavimentos: ReturnType<typeof mapDocumentoToCondominioPavimentos>,
  espacosComuns: ReturnType<typeof mapDocumentoToEspacosComuns>,
): Promise<void> {
  const { error: deletePavError } = await supabase
    .from("condominio_pavimentos")
    .delete()
    .eq("empreendimento_id", empreendimentoId);

  if (deletePavError) throw deletePavError;

  const { error: deleteEspError } = await supabase
    .from("condominio_espacos_comuns")
    .delete()
    .eq("empreendimento_id", empreendimentoId);

  if (deleteEspError) throw deleteEspError;

  if (pavimentos.length > 0) {
    const { error } = await supabase.from("condominio_pavimentos").insert(
      pavimentos.map((p) => ({
        empreendimento_id: empreendimentoId,
        torre: p.torre,
        nome: p.nome,
        area_real: p.areaReal,
        area_equivalente: p.areaEquivalente,
        ordem: p.ordem,
        fonte_quadro: p.fonteQuadro,
      })),
    );

    if (error) throw error;
  }

  if (espacosComuns.length > 0) {
    const { error } = await supabase.from("condominio_espacos_comuns").insert(
      espacosComuns.map((e) => ({
        empreendimento_id: empreendimentoId,
        nome: e.nome,
        ordem: e.ordem,
        fonte_quadro: e.fonteQuadro,
      })),
    );

    if (error) throw error;
  }
}

export async function syncCondominioComposicaoFromDocumento(
  empreendimentoId: number,
  documento: Parameters<typeof mapDocumentoToCondominioPavimentos>[0],
): Promise<{ pavimentos: CondominioPavimentoView[]; espacosComuns: CondominioEspacoComumView[] }> {
  const pavimentos = mapDocumentoToCondominioPavimentos(documento);
  const espacosComuns = mapDocumentoToEspacosComuns(documento);

  await replaceCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);

  const [{ data: pavRows, error: pavError }, { data: espRows, error: espError }] =
    await Promise.all([
      supabase
        .from("condominio_pavimentos")
        .select("id, torre, nome, area_real, area_equivalente, ordem")
        .eq("empreendimento_id", empreendimentoId)
        .order("ordem"),
      supabase
        .from("condominio_espacos_comuns")
        .select("id, nome, ordem")
        .eq("empreendimento_id", empreendimentoId)
        .order("ordem"),
    ]);

  if (pavError) throw pavError;
  if (espError) throw espError;

  return {
    pavimentos: mapCondominioPavimentosEmbed(pavRows),
    espacosComuns: mapCondominioEspacosComunsEmbed(espRows),
  };
}

/** Reprocessa o último quadro técnico enviado e persiste QI/QCOMP + QVIII. */
export async function backfillCondominioComposicaoFromQuadro(
  empreendimentoId: number,
): Promise<{ pavimentos: CondominioPavimentoView[]; espacosComuns: CondominioEspacoComumView[] } | null> {
  const quadro = await fetchLatestQuadroRow(empreendimentoId);
  if (!quadro) return null;

  const buffer = await downloadQuadroBuffer(quadro.storage_path);
  if (!buffer) return null;

  const file = new File([buffer], quadro.file_name, {
    type: resolveQuadroContentType(quadro.file_name, quadro.mime_type ?? undefined),
  });

  const documento = await parseQuadroNbrFile(file);
  const synced = await syncCondominioComposicaoFromDocumento(empreendimentoId, documento);

  if (synced.pavimentos.length === 0 && synced.espacosComuns.length === 0) {
    return null;
  }

  return synced;
}
