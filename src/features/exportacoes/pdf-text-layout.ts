const DEFAULT_LINES_PER_PAGE = 42;
const DEFAULT_MAX_CHARS_PER_LINE = 88;

const PDF_CHAR_REPLACEMENTS: Record<string, string> = {
  "\u2014": "-",
  "\u2013": "-",
  "\u00B7": ".",
  "\u2022": "*",
  "\u201C": '"',
  "\u201D": '"',
  "\u2018": "'",
  "\u2019": "'",
};

export function normalizePdfText(text: string): string {
  let out = text;
  for (const [from, to] of Object.entries(PDF_CHAR_REPLACEMENTS)) {
    out = out.split(from).join(to);
  }
  return out;
}

/** WinAnsi/Latin-1 compatível com Helvetica embutida (pdf-lib e Type1). */
export function sanitizePdfFontText(text: string): string {
  return normalizePdfText(text).replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "?");
}

function wrapLine(line: string, maxCharsPerLine: number): string[] {
  if (line.length <= maxCharsPerLine) return [line];
  const parts: string[] = [];
  let rest = line;
  while (rest.length > maxCharsPerLine) {
    let cut = rest.lastIndexOf(" ", maxCharsPerLine);
    if (cut < 40) cut = maxCharsPerLine;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}

export function paginatePlainText(
  body: string,
  linesPerPage = DEFAULT_LINES_PER_PAGE,
  maxCharsPerLine = DEFAULT_MAX_CHARS_PER_LINE,
): string[][] {
  const flat: string[] = [];
  for (const line of body.split("\n")) {
    flat.push(...wrapLine(line, maxCharsPerLine));
  }

  const pages: string[][] = [];
  let current: string[] = [];

  for (const line of flat) {
    if (current.length >= linesPerPage) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([""]);
  return pages;
}
