import type { DocumentBlock, TextRun } from "./document-types";

const CAPITULO_PATTERN = /^Capítulo\s+/i;
const ARTIGO_PATTERN = /^(Artigo\s+\d+\.?)\s*(.*)$/s;
const TORRE_PATTERN = /^TORRE\s+\d+/i;
const PAVIMENTO_PATTERN =
  /^(PAVIMENTO\s+TÉRREO|PRIMEIRO\s+PAVIMENTO|SEGUNDO\s+PAVIMENTO|TERCEIRO\s+PAVIMENTO|QUARTO\s+PAVIMENTO)$/i;
const UNIT_PREFIX_PATTERN = /^(.+?\([^)]+\)),\s*(.*)$/s;

export function blockFromSectionTitle(title: string): DocumentBlock {
  return {
    runs: [{ text: title, bold: true }],
    align: "left",
  };
}

export function blockFromUnitDescription(text: string): DocumentBlock {
  const match = text.match(UNIT_PREFIX_PATTERN);
  if (match) {
    const runs: TextRun[] = [{ text: `${match[1]}, `, bold: true }];
    if (match[2]) runs.push({ text: match[2] });
    return { runs, align: "justify" };
  }
  return {
    runs: [{ text, bold: true }],
    align: "justify",
  };
}

export function blockFromContentLine(line: string): DocumentBlock {
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
        runs: [
          { text: `${prefix} `, bold: true },
          { text: body.trimStart() },
        ],
        align: "justify",
      };
    }
    return {
      runs: [{ text: trimmed, bold: true }],
      align: "left",
    };
  }

  return {
    runs: [{ text: trimmed }],
    align: "justify",
  };
}

export function blocksFromContent(conteudo: string): DocumentBlock[] {
  return conteudo.split("\n").map((line) => blockFromContentLine(line));
}

export function blockFromPlainLine(line: string, options?: { bold?: boolean; align?: DocumentBlock["align"] }): DocumentBlock {
  if (!line) {
    return { runs: [{ text: "" }], align: "left" };
  }

  return {
    runs: [{ text: line, bold: options?.bold }],
    align: options?.align ?? "left",
  };
}
