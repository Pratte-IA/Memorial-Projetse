import { mapDocumentoToUnidades } from "@/features/quadro-nbr/mapper";
import {
  buildQivbVagaLookup,
  buildQivbVagaLookupFromObservacoesCampos,
  mergeVagaLookups,
} from "@/features/quadro-nbr/extract-vaga";
import { resolvePosicaoUnidadeFromDocumento } from "@/features/quadro-nbr/resolve-posicao-unidade";

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

function unidadeLookupKey(nome: string, torre: string | null): string {
  return `${nome}::${torre ?? "—"}`;
}

function medidasPrecisamAtualizar(
  atual: {
    fracao: string | null;
    area_garden: number | null;
    area_garagem: number | null;
  },
  esperado: ReturnType<typeof mapDocumentoToUnidades>[number],
): boolean {
  const fracaoAtual = atual.fracao?.trim() ?? "";
  const fracaoNova = esperado.fracao?.trim() ?? "";
  if (fracaoNova && fracaoAtual !== fracaoNova) return true;

  const garden = Number(atual.area_garden ?? 0);
  const garagem = Number(atual.area_garagem ?? 0);
  if (esperado.areaGarden != null && Math.abs(garden - esperado.areaGarden) > 0.0001) return true;
  if (esperado.areaGaragem != null && Math.abs(garagem - esperado.areaGaragem) > 0.0001) {
    return true;
  }

  return false;
}

/** Atualiza fração territorial e áreas de terreno (garden/garagem) a partir do Quadro Resumo + IV B.1. */
export async function backfillUnidadesMedidasFromDocumento(
  empreendimentoId: number,
  documento: DocumentoNbrExtraido,
): Promise<number> {
  const payload = mapDocumentoToUnidades(documento);
  if (!payload.length) return 0;

  const byKey = new Map(payload.map((u) => [unidadeLookupKey(u.nome, u.torre), u]));

  const { data: unidades, error } = await supabase
    .from("unidades_autonomas")
    .select("id, nome, torre, fracao, area_garden, area_garagem")
    .eq("empreendimento_id", empreendimentoId);

  if (error) throw error;

  let updated = 0;

  for (const unidade of unidades ?? []) {
    const esperado = byKey.get(unidadeLookupKey(unidade.nome, unidade.torre));
    if (!esperado || !medidasPrecisamAtualizar(unidade, esperado)) continue;

    const { error: updateError } = await supabase
      .from("unidades_autonomas")
      .update({
        fracao: esperado.fracao,
        area_garden: esperado.areaGarden,
        area_garagem: esperado.areaGaragem,
      })
      .eq("id", unidade.id);

    if (!updateError) updated += 1;
  }

  return updated;
}

/** Preenche posição na torre a partir das explicitações do Quadro V. */
export async function backfillUnidadesPosicaoFromDocumento(
  empreendimentoId: number,
  documento: DocumentoNbrExtraido,
): Promise<number> {
  const payload = mapDocumentoToUnidades(documento);
  if (!payload.length) return 0;

  const byKey = new Map(payload.map((u) => [unidadeLookupKey(u.nome, u.torre), u]));

  const { data: unidades, error } = await supabase
    .from("unidades_autonomas")
    .select("id, nome, torre, posicao")
    .eq("empreendimento_id", empreendimentoId);

  if (error) throw error;

  let updated = 0;

  for (const unidade of unidades ?? []) {
    if (unidade.posicao?.trim()) continue;

    const esperado = byKey.get(unidadeLookupKey(unidade.nome, unidade.torre));
    const posicao =
      esperado?.posicao?.trim() ||
      resolvePosicaoUnidadeFromDocumento(documento, unidade.nome, unidade.torre ?? "—");
    if (!posicao) continue;

    const { error: updateError } = await supabase
      .from("unidades_autonomas")
      .update({ posicao })
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
