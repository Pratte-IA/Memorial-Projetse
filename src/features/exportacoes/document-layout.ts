import type { PDFFont } from "pdf-lib";

import type { DocumentBlock, LayoutLine, MemorialDocument, TextRun } from "./document-types";

interface WordToken {
  text: string;
  bold: boolean;
}

function tokenizeRuns(runs: TextRun[]): WordToken[] {
  const tokens: WordToken[] = [];

  for (const run of runs) {
    const parts = run.text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) continue;
      tokens.push({ text: part, bold: Boolean(run.bold) });
    }
  }

  return tokens;
}

function measureText(text: string, bold: boolean, font: PDFFont, boldFont: PDFFont, fontSize: number): number {
  const activeFont = bold ? boldFont : font;
  return activeFont.widthOfTextAtSize(text, fontSize);
}

function measureWords(
  words: WordToken[],
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number,
): number {
  if (words.length === 0) return 0;
  let width = 0;
  for (let i = 0; i < words.length; i++) {
    width += measureText(words[i].text, words[i].bold, font, boldFont, fontSize);
    if (i < words.length - 1) {
      width += measureText(" ", false, font, boldFont, fontSize);
    }
  }
  return width;
}

function wrapBlockToLines(
  block: DocumentBlock,
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number,
): LayoutLine[] {
  const words = tokenizeRuns(block.runs);
  if (words.length === 0) {
    return [{ runs: [{ text: "" }], align: block.align, isLastLineOfParagraph: true }];
  }

  const spaceWidth = measureText(" ", false, font, boldFont, fontSize);
  const lines: WordToken[][] = [];
  let current: WordToken[] = [];
  let currentWidth = 0;

  for (const word of words) {
    const wordWidth = measureText(word.text, word.bold, font, boldFont, fontSize);
    const extra = current.length > 0 ? spaceWidth : 0;

    if (current.length > 0 && currentWidth + extra + wordWidth > maxWidth) {
      lines.push(current);
      current = [word];
      currentWidth = wordWidth;
    } else {
      current.push(word);
      currentWidth += extra + wordWidth;
    }
  }

  if (current.length > 0) lines.push(current);

  return lines.map((lineWords, index) => ({
    runs: wordsToRuns(lineWords),
    align: block.align,
    isLastLineOfParagraph: index === lines.length - 1,
  }));
}

function wordsToRuns(words: WordToken[]): TextRun[] {
  const runs: TextRun[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const text = i < words.length - 1 ? `${word.text} ` : word.text;
    const last = runs[runs.length - 1];
    if (last && Boolean(last.bold) === word.bold) {
      last.text += text;
    } else {
      runs.push({ text, bold: word.bold });
    }
  }
  return runs.length > 0 ? runs : [{ text: "" }];
}

export function layoutDocument(
  document: MemorialDocument,
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number,
): LayoutLine[] {
  const lines: LayoutLine[] = [];

  for (const block of document.blocks) {
    if (block.runs.length === 1 && block.runs[0].text === "") {
      lines.push({ runs: [{ text: "" }], align: "left", isLastLineOfParagraph: true });
      continue;
    }

    if (block.align === "justify") {
      lines.push(...wrapBlockToLines(block, maxWidth, font, boldFont, fontSize));
      continue;
    }

    const text = block.runs.map((r) => r.text).join("");
    if (measureText(text, Boolean(block.runs[0]?.bold), font, boldFont, fontSize) <= maxWidth) {
      lines.push({
        runs: block.runs,
        align: block.align,
        isLastLineOfParagraph: true,
      });
      continue;
    }

    lines.push(
      ...wrapBlockToLines(
        { ...block, align: "left" },
        maxWidth,
        font,
        boldFont,
        fontSize,
      ),
    );
  }

  return lines;
}

export function paginateLayoutLines(lines: LayoutLine[], linesPerPage: number): LayoutLine[][] {
  const pages: LayoutLine[][] = [];
  let current: LayoutLine[] = [];

  for (const line of lines) {
    if (current.length >= linesPerPage) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }

  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([]);
  return pages;
}

export function justifyLineWords(
  words: WordToken[],
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number,
): Array<{ text: string; bold: boolean; x: number }> {
  if (words.length <= 1) {
    return words.map((word, index) => ({
      text: word.text,
      bold: word.bold,
      x: index === 0 ? 0 : measureText(words[0].text, words[0].bold, font, boldFont, fontSize),
    }));
  }

  const spaceWidth = measureText(" ", false, font, boldFont, fontSize);
  const wordsWidth = words.reduce(
    (sum, word) => sum + measureText(word.text, word.bold, font, boldFont, fontSize),
    0,
  );
  const gaps = words.length - 1;
  const extra = Math.max(0, maxWidth - wordsWidth);
  const gapWidth = gaps > 0 ? extra / gaps : 0;

  const positioned: Array<{ text: string; bold: boolean; x: number }> = [];
  let x = 0;

  for (let i = 0; i < words.length; i++) {
    positioned.push({ text: words[i].text, bold: words[i].bold, x });
    x += measureText(words[i].text, words[i].bold, font, boldFont, fontSize);
    if (i < words.length - 1) x += gapWidth > 0 ? gapWidth : spaceWidth;
  }

  return positioned;
}

export function lineToWords(line: LayoutLine): WordToken[] {
  return tokenizeRuns(line.runs);
}
