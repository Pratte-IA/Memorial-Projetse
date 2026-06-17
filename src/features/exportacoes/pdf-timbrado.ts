import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import {
  justifyLineWords,
  layoutDocument,
  lineToWords,
  paginateLayoutLines,
} from "./document-layout";
import type { LayoutLine, MemorialDocument } from "./document-types";
import { sanitizePdfFontText } from "./pdf-text-layout";

const TIMBRADO_MARGINS = {
  top: 120,
  bottom: 70,
  left: 50,
  right: 50,
} as const;

const FONT_SIZE = 10;
const LINE_HEIGHT = 17;

function resolveTemplatePageIndex(contentPageIndex: number, templatePageCount: number): number {
  if (templatePageCount <= 1) return 0;
  return contentPageIndex === 0 ? 0 : Math.min(1, templatePageCount - 1);
}

function layoutForPageSize(width: number, height: number) {
  const contentWidth = width - TIMBRADO_MARGINS.left - TIMBRADO_MARGINS.right;
  const contentHeight = height - TIMBRADO_MARGINS.top - TIMBRADO_MARGINS.bottom;
  const linesPerPage = Math.max(10, Math.floor(contentHeight / LINE_HEIGHT));

  return { contentWidth, linesPerPage };
}

function drawLayoutLine(
  page: PDFPage,
  line: LayoutLine,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
): void {
  const words = lineToWords(line);
  if (words.length === 0) return;

  const shouldJustify =
    line.align === "justify" && !line.isLastLineOfParagraph && words.length > 1;

  if (shouldJustify) {
    const positioned = justifyLineWords(words, maxWidth, font, boldFont, FONT_SIZE);
    for (const item of positioned) {
      const activeFont = item.bold ? boldFont : font;
      page.drawText(sanitizePdfFontText(item.text), {
        x: x + item.x,
        y,
        size: FONT_SIZE,
        font: activeFont,
        color: rgb(0, 0, 0),
      });
    }
    return;
  }

  let cursorX = x;
  for (const run of line.runs) {
    const activeFont = run.bold ? boldFont : font;
    const text = sanitizePdfFontText(run.text);
    if (!text) continue;
    page.drawText(text, {
      x: cursorX,
      y,
      size: FONT_SIZE,
      font: activeFont,
      color: rgb(0, 0, 0),
    });
    cursorX += activeFont.widthOfTextAtSize(text, FONT_SIZE);
  }
}

export async function createPdfBlobWithTimbrado(
  document: MemorialDocument,
  timbradoPdfBytes: ArrayBuffer | Uint8Array,
): Promise<Blob> {
  const templateDoc = await PDFDocument.load(timbradoPdfBytes);
  const outputDoc = await PDFDocument.create();
  const font = await outputDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await outputDoc.embedFont(StandardFonts.HelveticaBold);

  const templatePages = templateDoc.getPages();
  if (templatePages.length === 0) {
    throw new Error("O arquivo de timbrado não contém páginas.");
  }

  const firstTemplatePage = templatePages[0];
  const { width, height } = firstTemplatePage.getSize();
  const { contentWidth, linesPerPage } = layoutForPageSize(width, height);
  const layoutLines = layoutDocument(document, contentWidth, font, boldFont, FONT_SIZE);
  const contentPages = paginateLayoutLines(layoutLines, linesPerPage);

  const embeddedTemplates = await outputDoc.embedPages(templatePages);

  for (let pageIndex = 0; pageIndex < contentPages.length; pageIndex++) {
    const templateIndex = resolveTemplatePageIndex(pageIndex, templatePages.length);
    const page = outputDoc.addPage([width, height]);

    page.drawPage(embeddedTemplates[templateIndex], {
      x: 0,
      y: 0,
      width,
      height,
    });

    let y = height - TIMBRADO_MARGINS.top;
    for (const line of contentPages[pageIndex]) {
      drawLayoutLine(
        page,
        line,
        TIMBRADO_MARGINS.left,
        y - FONT_SIZE,
        contentWidth,
        font,
        boldFont,
      );
      y -= LINE_HEIGHT;
    }
  }

  const pdfBytes = await outputDoc.save();
  const buffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  return new Blob([buffer], { type: "application/pdf" });
}
