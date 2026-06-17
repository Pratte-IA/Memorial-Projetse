import type { DocumentBlock, TextRun } from "./document-types";
import { applyMemorialBoldRuns, type MadridBoldContext } from "./memorial-bold";

const CAPITULO_PATTERN = /^Capítulo\s+/i;
const ARTIGO_PATTERN = /^(Artigo\s+\d+\.?)\s*(.*)$/s;
const TORRE_PATTERN = /^TORRE\s+\d+/i;
const PAVIMENTO_PATTERN =
  /^(PAVIMENTO\s+TÉRREO|PRIMEIRO\s+PAVIMENTO|SEGUNDO\s+PAVIMENTO|TERCEIRO\s+PAVIMENTO|QUARTO\s+PAVIMENTO)$/i;
const UNIT_PREFIX_PATTERN = /^(.+?\([^)]+\)),\s*(.*)$/s;

export interface DocumentFormatOptions {
  madridBold?: MadridBoldContext;
}

function withMemorialBold(text: string, madridBold?: MadridBoldContext): TextRun[] {
  if (madridBold) {
    return applyMemorialBoldRuns(text, madridBold);
  }
  return [{ text }];
}

export function blockFromSectionTitle(title: string): DocumentBlock {
  return {
    runs: [{ text: title, bold: true }],
    align: "left",
  };
}

export function blockFromUnitDescription(text: string, options?: DocumentFormatOptions): DocumentBlock {
  const match = text.match(UNIT_PREFIX_PATTERN);
  if (match) {
    const runs: TextRun[] = [{ text: `${match[1]}, `, bold: true }];
    if (match[2]) {
      runs.push(...withMemorialBold(match[2], options?.madridBold));
    }
    return { runs: coalesceAdjacentRuns(runs), align: "justify" };
  }

  return {
    runs: withMemorialBold(text, options?.madridBold).map((run, index) =>
      index === 0 ? { ...run, bold: true } : run,
    ),
    align: "justify",
  };
}

export function blockFromContentLine(line: string, options?: DocumentFormatOptions): DocumentBlock {
  const trimmed = line.trim();

  if (!trimmed) {
    return { runs: [{ text: "" }], align: "left" };
  }

  if (CAPITULO_PATTERN.test(trimmed) || TORRE_PATTERN.test(trimmed) || PAVIMENTO_PATTERN.test(trimmed)) {
    return {
      runs: [{ text: trimmed, bold: true }],
      align: "left",
    };
  }

  const artigoMatch = trimmed.match(ARTIGO_PATTERN);
  if (artigoMatch) {
    const [, prefix, body] = artigoMatch;
    if (body.trim()) {
      return {
        runs: coalesceAdjacentRuns([
          { text: `${prefix} `, bold: true },
          ...withMemorialBold(body.trimStart(), options?.madridBold),
        ]),
        align: "justify",
      };
    }
    return {
      runs: [{ text: trimmed, bold: true }],
      align: "left",
    };
  }

  return {
    runs: withMemorialBold(trimmed, options?.madridBold),
    align: "justify",
  };
}

export function blocksFromContent(conteudo: string, options?: DocumentFormatOptions): DocumentBlock[] {
  return conteudo.split("\n").map((line) => blockFromContentLine(line, options));
}

export function blockFromPlainLine(
  line: string,
  options?: { bold?: boolean; align?: DocumentBlock["align"]; madridBold?: MadridBoldContext },
): DocumentBlock {
  if (!line) {
    return { runs: [{ text: "" }], align: "left" };
  }

  if (options?.bold) {
    return {
      runs: [{ text: line, bold: true }],
      align: options?.align ?? "left",
    };
  }

  return {
    runs: withMemorialBold(line, options?.madridBold),
    align: options?.align ?? "left",
  };
}

function coalesceAdjacentRuns(runs: TextRun[]): TextRun[] {
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
