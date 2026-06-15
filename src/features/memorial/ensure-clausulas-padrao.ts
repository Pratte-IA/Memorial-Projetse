import { fetchClausulas } from "@/features/documentos/api";
import type { ClausulaRecord } from "@/features/documentos/types";
import { supabase } from "@/lib/supabase/client";

import {
  LEGACY_CLAUSULA_ORDEM_TO_PDF,
  getMemorialClausulasPadrao,
  tituloMatchesKeywords,
  type ClausulaPadraoDef,
} from "./clausulas-estrutura";

async function fetchModeloMemorialId(organizationId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("modelos_documento")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("tipo", "%Memorial%")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

function findClausulaForDef(
  existing: ClausulaRecord[],
  def: ClausulaPadraoDef,
  usedIds: Set<number>,
): ClausulaRecord | null {
  const bySlug = existing.find(
    (c) => !usedIds.has(c.id) && tituloMatchesKeywords(c.titulo, def.slug),
  );
  if (bySlug) return bySlug;

  const legacyOrdem = Object.entries(LEGACY_CLAUSULA_ORDEM_TO_PDF).find(
    ([, pdfOrdem]) => pdfOrdem === def.ordem,
  )?.[0];

  if (legacyOrdem) {
    const byLegacy = existing.find(
      (c) => !usedIds.has(c.id) && c.ordem === Number(legacyOrdem),
    );
    if (byLegacy) return byLegacy;
  }

  const byOrdem = existing.find((c) => !usedIds.has(c.id) && c.ordem === def.ordem);
  if (byOrdem) return byOrdem;

  return null;
}

/** Garante que a biblioteca de cláusulas reflita o modelo padrão (estrutura PDF Madrid). */
export async function ensureClausulasMemorialPadrao(organizationId: number): Promise<boolean> {
  const [padrao, existing, modeloId] = await Promise.all([
    Promise.resolve(getMemorialClausulasPadrao()),
    fetchClausulas(organizationId),
    fetchModeloMemorialId(organizationId),
  ]);

  const usedIds = new Set<number>();
  let changed = false;

  for (const def of padrao) {
    const current = findClausulaForDef(existing, def, usedIds);

    if (!current) {
      const { error } = await supabase.from("clausulas").insert({
        organization_id: organizationId,
        modelo_id: modeloId,
        titulo: def.titulo,
        categoria: def.categoria,
        resumo: def.resumo,
        template: def.template,
        variaveis: def.variaveis,
        status: "publicada",
        ordem: def.ordem,
      });
      if (error) throw error;
      changed = true;
      continue;
    }

    usedIds.add(current.id);

    const needsUpdate =
      current.titulo !== def.titulo ||
      current.template !== def.template ||
      current.ordem !== def.ordem ||
      current.categoria !== def.categoria ||
      current.resumo !== def.resumo ||
      JSON.stringify(current.variaveis) !== JSON.stringify(def.variaveis);

    if (!needsUpdate) continue;

    const { error } = await supabase
      .from("clausulas")
      .update({
        titulo: def.titulo,
        categoria: def.categoria,
        resumo: def.resumo,
        template: def.template,
        variaveis: def.variaveis,
        ordem: def.ordem,
        status: "publicada",
        modelo_id: current.modeloId ?? modeloId,
      })
      .eq("id", current.id);

    if (error) throw error;
    changed = true;
  }

  return changed;
}
