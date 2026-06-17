import type { MemorialContextData } from "@/features/memorial/types";

import type { TextRun } from "./document-types";

/** Padrão Madrid (PDF R00): frases fixas em negrito no corpo do texto. */
const FIXED_BOLD_PHRASES = [
  "projeto arquitetônico",
  "elaboração dos quadros da NBR 12.721",
  "execução da obra",
] as const;

const CARDINAL_DIRECTIONS =
  /\b(Noroeste|Nordeste|Sudeste|Sudoeste|Norte|Sul|Leste|Oeste)\b/g;

export interface MadridBoldContext {
  incorporadoraRazaoSocial: string | null;
  /** Nome do empreendimento em maiúsculas — negrito somente nesta forma (ex.: RESIDENCIAL MADRID). */
  empreendimentoNomeUpper: string | null;
  imovelLote: string | null;
  imovelQuadra: string | null;
  imovelArea: string | null;
  imovelLoteamento: string | null;
  imovelComarca: string | null;
  imovelUfExtenso: string | null;
  imovelMatricula: string | null;
}

function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true;
  const t = value.trim();
  return !t || t === "—" || t === "-";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildMadridBoldContext(context: MemorialContextData): MadridBoldContext {
  const nome = context.empreendimento.nome?.trim();
  return {
    incorporadoraRazaoSocial: isPlaceholder(context.incorporadora.razaoSocial)
      ? null
      : context.incorporadora.razaoSocial.trim(),
    empreendimentoNomeUpper: nome ? nome.toUpperCase() : null,
    imovelLote: isPlaceholder(context.imovel.loteNumero) ? null : context.imovel.loteNumero.trim(),
    imovelQuadra: isPlaceholder(context.imovel.quadraNumero)
      ? null
      : context.imovel.quadraNumero.trim(),
    imovelArea: isPlaceholder(context.imovel.area) ? null : context.imovel.area.trim(),
    imovelLoteamento: isPlaceholder(context.imovel.loteamento)
      ? null
      : context.imovel.loteamento.trim(),
    imovelComarca: isPlaceholder(context.imovel.comarca) ? null : context.imovel.comarca.trim(),
    imovelUfExtenso: isPlaceholder(context.imovel.ufExtenso)
      ? null
      : context.imovel.ufExtenso.trim(),
    imovelMatricula: isPlaceholder(context.imovel.matricula)
      ? null
      : context.imovel.matricula.trim(),
  };
}

interface BoldRange {
  start: number;
  end: number;
}

function mergeRanges(ranges: BoldRange[]): BoldRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function addPhraseRanges(text: string, phrase: string, ranges: BoldRange[]): void {
  if (!phrase || phrase.length < 2) return;
  const regex = new RegExp(escapeRegex(phrase), "gi");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
}

function addRegexRanges(text: string, regex: RegExp, ranges: BoldRange[], group = 0): void {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const g = match[group];
    if (g == null) continue;
    const offset = match[0].indexOf(g);
    if (offset < 0) continue;
    ranges.push({ start: match.index + offset, end: match.index + offset + g.length });
  }
}

function buildBoldRanges(text: string, ctx: MadridBoldContext): BoldRange[] {
  const ranges: BoldRange[] = [];

  for (const phrase of FIXED_BOLD_PHRASES) {
    addPhraseRanges(text, phrase, ranges);
  }

  addRegexRanges(text, CARDINAL_DIRECTIONS, ranges);

  if (ctx.incorporadoraRazaoSocial) {
    addPhraseRanges(text, ctx.incorporadoraRazaoSocial, ranges);
  }

  if (ctx.empreendimentoNomeUpper) {
    addRegexRanges(
      text,
      new RegExp(`\\b${escapeRegex(ctx.empreendimentoNomeUpper)}\\b`, "g"),
      ranges,
    );
  }

  if (ctx.imovelLote) {
    addRegexRanges(
      text,
      new RegExp(`Lote n[º°]\\s*${escapeRegex(ctx.imovelLote)}`, "gi"),
      ranges,
      0,
    );
  }

  if (ctx.imovelQuadra) {
    addRegexRanges(
      text,
      new RegExp(`Quadra n[º°]\\s*${escapeRegex(ctx.imovelQuadra)}`, "gi"),
      ranges,
      0,
    );
  }

  if (ctx.imovelArea) {
    addPhraseRanges(text, ctx.imovelArea, ranges);
  }

  if (ctx.imovelLoteamento) {
    addRegexRanges(
      text,
      new RegExp(`(Loteamento\\s+)${escapeRegex(ctx.imovelLoteamento)}`, "gi"),
      ranges,
      2,
    );
  }

  if (ctx.imovelComarca) {
    addRegexRanges(
      text,
      new RegExp(`(Comarca de\\s+)${escapeRegex(ctx.imovelComarca)}`, "gi"),
      ranges,
      2,
    );
    addRegexRanges(
      text,
      new RegExp(`(comarca de\\s+)${escapeRegex(ctx.imovelComarca)}`, "gi"),
      ranges,
      2,
    );
  }

  if (ctx.imovelUfExtenso) {
    addRegexRanges(
      text,
      new RegExp(`(Estado do\\s+)${escapeRegex(ctx.imovelUfExtenso)}`, "gi"),
      ranges,
      2,
    );
  }

  if (ctx.imovelMatricula) {
    addRegexRanges(
      text,
      new RegExp(`(matr[ií]cula\\s+)${escapeRegex(ctx.imovelMatricula)}`, "gi"),
      ranges,
      2,
    );
  }

  return mergeRanges(ranges);
}

function rangesToRuns(text: string, ranges: BoldRange[]): TextRun[] {
  if (ranges.length === 0) return [{ text }];

  const runs: TextRun[] = [];
  let pos = 0;

  for (const range of ranges) {
    if (range.start > pos) {
      runs.push({ text: text.slice(pos, range.start) });
    }
    runs.push({ text: text.slice(range.start, range.end), bold: true });
    pos = range.end;
  }

  if (pos < text.length) {
    runs.push({ text: text.slice(pos) });
  }

  return runs;
}

function parseAsteriskMarkup(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }
    runs.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  return runs.length > 0 ? runs : [{ text }];
}

function coalesceRuns(runs: TextRun[]): TextRun[] {
  const out: TextRun[] = [];

  for (const run of runs) {
    if (!run.text) continue;
    const last = out[out.length - 1];
    if (last && Boolean(last.bold) === Boolean(run.bold)) {
      last.text += run.text;
    } else {
      out.push({ ...run });
    }
  }

  return out.length > 0 ? out : [{ text: "" }];
}

function applyMadridRulesToPlainText(text: string, ctx: MadridBoldContext): TextRun[] {
  if (!text) return [{ text: "" }];
  const ranges = buildBoldRanges(text, ctx);
  return rangesToRuns(text, ranges);
}

/**
 * Aplica negrito conforme o memorial Madrid (PDF R00).
 * Não negrita áreas genéricas, cartório, CPF/CNPJ nem o nome do empreendimento em title case.
 */
export function applyMemorialBoldRuns(text: string, ctx: MadridBoldContext): TextRun[] {
  const asteriskRuns = parseAsteriskMarkup(text);
  const result: TextRun[] = [];

  for (const run of asteriskRuns) {
    if (run.bold) {
      result.push(run);
      continue;
    }
    result.push(...applyMadridRulesToPlainText(run.text, ctx));
  }

  return coalesceRuns(result);
}
