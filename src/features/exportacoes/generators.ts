import { paginatePlainText, normalizePdfText } from "./pdf-text-layout";
import type { DocumentBlock, MemorialDocument, TextRun } from "./document-types";

const LINES_PER_PAGE = 42;
const MAX_CHARS_PER_LINE = 88;

function paginateLines(body: string): string[][] {
  return paginatePlainText(body, LINES_PER_PAGE, MAX_CHARS_PER_LINE);
}

/** Literal string WinAnsi/Latin-1 compatível com Helvetica Type1. */
function pdfLiteralString(text: string): string {
  const normalized = normalizePdfText(text);
  let out = "(";

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const code = ch.charCodeAt(0);

    if (ch === "\\" || ch === "(" || ch === ")") {
      out += `\\${ch}`;
    } else if (code >= 32 && code <= 126) {
      out += ch;
    } else if (code <= 255) {
      out += `\\${code.toString(8).padStart(3, "0")}`;
    } else {
      out += "?";
    }
  }

  out += ")";
  return out;
}

function buildPageStream(lines: string[]): string {
  const commands: string[] = ["BT", "/F1 10 Tf", "50 750 Td", "14 TL"];
  let first = true;

  for (const line of lines) {
    const safe = line || " ";
    if (first) {
      commands.push(`${pdfLiteralString(safe)} Tj`);
      first = false;
    } else {
      commands.push("T*");
      commands.push(`${pdfLiteralString(safe)} Tj`);
    }
  }

  commands.push("ET");
  return commands.join("\n");
}

export function createPdfBlob(body: string): Blob {
  const pages = paginateLines(body);
  const pageCount = pages.length;

  const objects: string[] = [];

  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push(
    `2 0 obj<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pageCount} >>endobj\n`,
  );

  const fontObjId = 3 + pageCount * 2;
  let objId = 3;

  for (let i = 0; i < pageCount; i++) {
    const pageObjId = objId;
    const contentObjId = objId + 1;

    const stream = buildPageStream(pages[i]);
    objects.push(
      `${pageObjId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>endobj\n`,
    );
    objects.push(
      `${contentObjId} 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj\n`,
    );
    objId += 2;
  }

  objects.push(`${fontObjId} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function alignmentToDocx(align: DocumentBlock["align"]): string {
  if (align === "justify") return '<w:jc w:val="both"/>';
  if (align === "center") return '<w:jc w:val="center"/>';
  return "";
}

function runsToDocx(runs: TextRun[]): string {
  return runs
    .map((run) => {
      const bold = run.bold ? "<w:b/><w:bCs/>" : "";
      const text = escapeXml(run.text);
      if (!text) return "";
      return `<w:r>${bold ? `<w:rPr>${bold}</w:rPr>` : ""}<w:t xml:space="preserve">${text}</w:t></w:r>`;
    })
    .join("");
}

function blockToDocxParagraph(block: DocumentBlock): string {
  const pPr = alignmentToDocx(block.align);
  const runs = runsToDocx(block.runs);
  if (!runs) return "<w:p/>";
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ""}${runs}</w:p>`;
}

function buildDocumentXml(document: MemorialDocument): string {
  const paragraphs = document.blocks.map(blockToDocxParagraph);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs.join("")}</w:body>
</w:document>`;
}

const DOCX_CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const DOCX_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOCX_DOCUMENT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

function writeUint16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function createZipStore(entries: { name: string; data: Uint8Array }[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encodeUtf8(entry.name);
    const dataCrc = crc32(entry.data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);

    writeUint32LE(localView, 0, 0x04034b50);
    writeUint16LE(localView, 4, 20);
    writeUint16LE(localView, 6, 0);
    writeUint16LE(localView, 8, 0);
    writeUint16LE(localView, 10, 0);
    writeUint16LE(localView, 12, 0);
    writeUint32LE(localView, 14, dataCrc);
    writeUint32LE(localView, 18, entry.data.length);
    writeUint32LE(localView, 22, entry.data.length);
    writeUint16LE(localView, 26, nameBytes.length);
    writeUint16LE(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    writeUint32LE(centralView, 0, 0x02014b50);
    writeUint16LE(centralView, 4, 20);
    writeUint16LE(centralView, 6, 20);
    writeUint16LE(centralView, 8, 0);
    writeUint16LE(centralView, 10, 0);
    writeUint16LE(centralView, 12, 0);
    writeUint16LE(centralView, 14, 0);
    writeUint32LE(centralView, 16, dataCrc);
    writeUint32LE(centralView, 20, entry.data.length);
    writeUint32LE(centralView, 24, entry.data.length);
    writeUint16LE(centralView, 28, nameBytes.length);
    writeUint16LE(centralView, 30, 0);
    writeUint16LE(centralView, 32, 0);
    writeUint16LE(centralView, 34, 0);
    writeUint16LE(centralView, 36, 0);
    writeUint32LE(centralView, 38, 0);
    writeUint32LE(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const centralOffset = offset;

  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32LE(endView, 0, 0x06054b50);
  writeUint16LE(endView, 4, 0);
  writeUint16LE(endView, 6, 0);
  writeUint16LE(endView, 8, entries.length);
  writeUint16LE(endView, 10, entries.length);
  writeUint32LE(endView, 12, centralSize);
  writeUint32LE(endView, 16, centralOffset);
  writeUint16LE(endView, 20, 0);

  const totalSize =
    localParts.reduce((sum, part) => sum + part.length, 0) + centralSize + endRecord.length;
  const zip = new Uint8Array(totalSize);
  let pos = 0;

  for (const part of localParts) {
    zip.set(part, pos);
    pos += part.length;
  }
  for (const part of centralParts) {
    zip.set(part, pos);
    pos += part.length;
  }
  zip.set(endRecord, pos);

  return zip;
}

export function createDocxBlob(document: MemorialDocument): Blob {
  const documentXml = buildDocumentXml(document);
  const zip = createZipStore([
    { name: "[Content_Types].xml", data: encodeUtf8(DOCX_CONTENT_TYPES) },
    { name: "_rels/.rels", data: encodeUtf8(DOCX_RELS) },
    { name: "word/document.xml", data: encodeUtf8(documentXml) },
    { name: "word/_rels/document.xml.rels", data: encodeUtf8(DOCX_DOCUMENT_RELS) },
  ]);

  return new Blob([new Uint8Array(zip)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
