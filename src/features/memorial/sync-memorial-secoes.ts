import { fetchClausulas } from "@/features/documentos/api";
import type { ClausulaRecord } from "@/features/documentos/types";
import { supabase } from "@/lib/supabase/client";

import { tituloMatchesKeywords } from "./clausulas-estrutura";
import type { MemorialRecord } from "./types";

type SecaoInsertRow = {
  memorial_id: number;
  clausula_id: number | null;
  titulo: string;
  conteudo: null;
  status: "nao_gerada";
  ordem: number;
};

function normalizeTitulo(titulo: string): string {
  return titulo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function buildMemorialSecoesRows(
  memorialId: number,
  clausulas: ClausulaRecord[],
): SecaoInsertRow[] {
  const publicadas = clausulas
    .filter((c) => c.status === "publicada")
    .sort((a, b) => a.ordem - b.ordem);

  return publicadas.map((c) => ({
    memorial_id: memorialId,
    clausula_id: c.id,
    titulo: c.titulo,
    conteudo: null,
    status: "nao_gerada",
    ordem: c.ordem,
  }));
}

function findClausulaForSecao(
  secaoTitulo: string,
  clausulaId: number | null,
  publicadas: ClausulaRecord[],
): ClausulaRecord | null {
  if (clausulaId) {
    return publicadas.find((c) => c.id === clausulaId) ?? null;
  }

  const normalized = normalizeTitulo(secaoTitulo);
  return (
    publicadas.find((c) => normalizeTitulo(c.titulo) === normalized) ??
    publicadas.find((c) => {
      const slug = c.titulo.includes("Qualificação")
        ? "c1"
        : c.titulo.includes("Propriedade")
          ? "c2"
          : c.titulo.includes("Incorporação Imobiliária")
            ? "c3"
            : c.titulo.includes("Composição")
              ? "c4"
              : c.titulo.includes("Aprovação")
                ? "c5"
                : c.titulo.includes("Descrição das Unidades")
                  ? "c6"
                  : c.titulo.includes("Orçamento")
                    ? "c6b"
                    : c.titulo.includes("Destinação")
                      ? "c7"
                      : null;
      return slug ? tituloMatchesKeywords(secaoTitulo, slug) : false;
    }) ??
    null
  );
}

/** Sincroniza seções com a biblioteca de cláusulas (insere faltantes e reconcilia título/ordem). */
export async function syncMemorialSecoesWithClausulas(
  memorial: MemorialRecord,
  organizationId: number,
): Promise<boolean> {
  const clausulas = await fetchClausulas(organizationId);
  const publicadas = clausulas.filter((c) => c.status === "publicada");

  let changed = false;

  const linkedClausulaIds = new Set<number>();

  for (const secao of memorial.secoes) {
    const clausula = findClausulaForSecao(secao.titulo, secao.clausulaId, publicadas);
    if (clausula) linkedClausulaIds.add(clausula.id);

    if (!clausula) continue;

    const patch: {
      titulo?: string;
      ordem?: number;
      clausula_id?: number;
    } = {};

    if (secao.titulo !== clausula.titulo) patch.titulo = clausula.titulo;
    if (secao.ordem !== clausula.ordem) patch.ordem = clausula.ordem;
    if (secao.clausulaId !== clausula.id) patch.clausula_id = clausula.id;

    if (Object.keys(patch).length === 0) continue;

    const { error } = await supabase.from("memorial_secoes").update(patch).eq("id", secao.id);
    if (error) throw error;
    changed = true;
  }

  const missing: SecaoInsertRow[] = [];

  for (const clausula of publicadas) {
    if (linkedClausulaIds.has(clausula.id)) continue;

    missing.push({
      memorial_id: memorial.id,
      clausula_id: clausula.id,
      titulo: clausula.titulo,
      conteudo: null,
      status: "nao_gerada",
      ordem: clausula.ordem,
    });
  }

  if (missing.length > 0) {
    const { error } = await supabase.from("memorial_secoes").insert(missing);
    if (error) throw error;
    changed = true;
  }

  return changed;
}
