import { clausulas } from "@/lib/mock-data";

/** Total de seções do memorial (preâmbulo + 12 cláusulas), conforme PDF Madrid. */
export const MEMORIAL_TOTAL_SECOES = 13;

export interface ClausulaPadraoDef {
  slug: string;
  ordem: number;
  titulo: string;
  categoria: string;
  resumo: string;
  template: string;
  variaveis: string[];
}

/** Mapeia ordem legada (1–12, numeração antiga) para ordem do PDF (0–12). */
export const LEGACY_CLAUSULA_ORDEM_TO_PDF: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
};

const TITULO_KEYWORDS: Record<string, string[]> = {
  c1: ["qualificação"],
  c2: ["propriedade"],
  c3: ["incorporação imobiliária", "incorporacao imobiliaria"],
  c4: ["composição", "composicao"],
  c5: ["aprovação", "aprovacao"],
  c6: ["descrição das unidades", "descricao das unidades"],
  c6b: ["orçamento", "orcamento"],
  c7: ["destinação", "destinacao"],
  c8: ["convenção", "convencao"],
  c9: ["regime de incorporação", "regime de incorporacao"],
  c10: ["prazo de carência", "prazo de carencia"],
  c11: ["regularidade fiscal"],
  c12: ["registro"],
};

export function getMemorialClausulasPadrao(): ClausulaPadraoDef[] {
  return clausulas
    .map((c) => ({
      slug: c.id,
      ordem: c.ordem,
      titulo: c.titulo,
      categoria: c.categoria,
      resumo: c.resumo,
      template: c.template,
      variaveis: c.variaveis,
    }))
    .sort((a, b) => a.ordem - b.ordem);
}

function normalizeTitulo(titulo: string): string {
  return titulo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function tituloMatchesKeywords(titulo: string, slug: string): boolean {
  const keywords = TITULO_KEYWORDS[slug];
  if (!keywords) return false;
  const normalized = normalizeTitulo(titulo);
  return keywords.some((kw) => normalized.includes(normalizeTitulo(kw)));
}
