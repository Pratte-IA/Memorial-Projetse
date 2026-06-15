import {
  buildQivbVagaLookup,
  buildQivbVagaLookupFromObservacoesCampos,
  mergeVagaLookups,
} from "@/features/quadro-nbr/extract-vaga";

import { loadLatestQuadroDocumento } from "./load-quadro-documento";
import { resolveVagaFromLookup } from "./vaga-lookup";
import { supabase } from "@/lib/supabase/client";

import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";

export { loadLatestQuadroDocumento } from "./load-quadro-documento";

/** Preenche `vaga` (e `observacoes`, se ausente) a partir do Quadro IV B / B.1. */
export async function backfillUnidadesVagasFromDocumento(
  empreendimentoId: number,
  documento: DocumentoNbrExtraido,
): Promise<number> {
  const { data: qivbDados, error: dadosError } = await supabase
    .from("dados_extraidos")
    .select("campo, valor")
    .eq("empreendimento_id", empreendimentoId)
    .eq("bloco", "qivb")
    .like("campo", "observacoes__%");

  if (dadosError) throw dadosError;

  const merged = mergeVagaLookups(
    buildQivbVagaLookup(documento),
    buildQivbVagaLookupFromObservacoesCampos(qivbDados ?? []),
  );
  if (merged.size === 0) return 0;

  const { data: unidades, error } = await supabase
    .from("unidades_autonomas")
    .select("id, nome, torre, vaga, observacoes")
    .eq("empreendimento_id", empreendimentoId);

  if (error) throw error;

  let updated = 0;

  for (const unidade of unidades ?? []) {
    if (unidade.vaga?.trim()) continue;

    const resolved = resolveVagaFromLookup(
      merged,
      unidade.nome,
      unidade.torre,
      unidade.observacoes,
    );
    if (!resolved) continue;

    const patch: { vaga: string; observacoes?: string } = { vaga: resolved.vaga };
    if (resolved.observacoes && !unidade.observacoes?.trim()) {
      patch.observacoes = resolved.observacoes;
    }

    const { error: updateError } = await supabase
      .from("unidades_autonomas")
      .update(patch)
      .eq("id", unidade.id);

    if (!updateError) updated += 1;
  }

  return updated;
}

/** Preenche `vaga` (e `observacoes`, se ausente) a partir do Quadro IV B / B.1 do último quadro técnico. */
export async function backfillUnidadesVagasFromQuadro(empreendimentoId: number): Promise<number> {
  const documento = await loadLatestQuadroDocumento(empreendimentoId);
  if (!documento) return 0;
  return backfillUnidadesVagasFromDocumento(empreendimentoId, documento);
}
