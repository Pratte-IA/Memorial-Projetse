import type { ClausulaRecord } from "@/features/documentos/types";

import type { SecaoRecord } from "./types";

const UNIDADE_ORDINAL = [
  "",
  "Primeira",
  "Segunda",
  "Terceira",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sétima",
  "Oitava",
  "Nona",
  "Décima",
] as const;

const DECIMA_UNIDADE: Record<number, string> = {
  1: "Primeira",
  2: "Segunda",
  3: "Terceira",
  4: "Quarta",
  5: "Quinta",
  6: "Sexta",
  7: "Sétima",
  8: "Oitava",
  9: "Nona",
};

/** Feminino ordinal usado nos títulos das cláusulas (1 = Primeira, 11 = Décima Primeira). */
export function ordemToClausulaOrdinal(ordem: number): string {
  if (ordem < 1 || !Number.isFinite(ordem)) return "";
  if (ordem <= 10) return UNIDADE_ORDINAL[ordem];
  if (ordem <= 19) {
    const resto = ordem - 10;
    return resto === 0 ? "Décima" : `Décima ${DECIMA_UNIDADE[resto]}`;
  }
  if (ordem === 20) return "Vigésima";
  if (ordem <= 29) {
    const resto = ordem - 20;
    return resto === 0 ? "Vigésima" : `Vigésima ${DECIMA_UNIDADE[resto]}`;
  }
  return `${ordem}ª`;
}

const ORDINAL_PREFIXES = [
  "Vigésima Nona",
  "Vigésima Oitava",
  "Vigésima Sétima",
  "Vigésima Sexta",
  "Vigésima Quinta",
  "Vigésima Quarta",
  "Vigésima Terceira",
  "Vigésima Segunda",
  "Vigésima Primeira",
  "Vigésima",
  "Décima Nona",
  "Décima Oitava",
  "Décima Sétima",
  "Décima Sexta",
  "Décima Quinta",
  "Décima Quarta",
  "Décima Terceira",
  "Décima Segunda",
  "Décima Primeira",
  "Décima",
  "Nona",
  "Oitava",
  "Sétima",
  "Setima",
  "Sexta",
  "Quinta",
  "Quarta",
  "Terceira",
  "Segunda",
  "Primeira",
];

/** Extrai o sufixo após o ordinal (ex.: "Do Orçamento da Edificação"). */
export function extrairSufixoTituloClausula(titulo: string): string | null {
  const trimmed = titulo.trim();
  for (const prefix of ORDINAL_PREFIXES) {
    const match = trimmed.match(new RegExp(`^${prefix}\\s*[–—-]\\s*(.+)$`, "iu"));
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export function montarTituloClausula(ordem: number, sufixo: string): string {
  return `${ordemToClausulaOrdinal(ordem)} – ${sufixo}`;
}

function buildSuffixByClausulaId(clausulas: ClausulaRecord[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const clausula of clausulas) {
    const sufixo = extrairSufixoTituloClausula(clausula.titulo);
    if (sufixo) map.set(clausula.id, sufixo);
  }
  return map;
}

export function tituloRenumeradoParaSecao(
  secao: Pick<SecaoRecord, "ordem" | "clausulaId" | "titulo">,
  suffixByClausulaId: Map<number, string>,
): string | null {
  if (secao.ordem <= 0) return null;

  if (secao.clausulaId === null) {
    return tituloRenumeradoParaSecaoExtra(secao);
  }

  const sufixo =
    suffixByClausulaId.get(secao.clausulaId) ?? extrairSufixoTituloClausula(secao.titulo);
  if (!sufixo) return null;

  return montarTituloClausula(secao.ordem, sufixo);
}

/** Renumera cláusula extra com ordinal por extenso + assunto informado pelo usuário. */
export function tituloRenumeradoParaSecaoExtra(
  secao: Pick<SecaoRecord, "ordem" | "titulo">,
): string | null {
  if (secao.ordem <= 0) return null;
  const sufixo = extrairSufixoTituloClausula(secao.titulo) ?? secao.titulo.trim();
  if (!sufixo) return null;
  return montarTituloClausula(secao.ordem, sufixo);
}

/** Monta título completo para nova cláusula extra a partir do assunto digitado. */
export function montarTituloClausulaExtra(ordem: number, assunto: string): string {
  const assuntoLimpo = assunto.trim();
  const sufixo = extrairSufixoTituloClausula(assuntoLimpo) ?? assuntoLimpo;
  return montarTituloClausula(ordem, sufixo);
}

export function listarRenumeracoesTitulo(
  secoes: SecaoRecord[],
  clausulas: ClausulaRecord[],
): Array<{ id: number; titulo: string }> {
  const suffixByClausulaId = buildSuffixByClausulaId(clausulas);
  const updates: Array<{ id: number; titulo: string }> = [];

  for (const secao of secoes) {
    const novoTitulo = tituloRenumeradoParaSecao(secao, suffixByClausulaId);
    if (novoTitulo && novoTitulo !== secao.titulo) {
      updates.push({ id: secao.id, titulo: novoTitulo });
    }
  }

  return updates;
}
