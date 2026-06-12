const LINES_PER_PAGE = 42;
const MAX_CHARS_PER_LINE = 88;

function wrapLine(line: string): string[] {
  if (line.length <= MAX_CHARS_PER_LINE) return [line];
  const parts: string[] = [];
  let rest = line;
  while (rest.length > MAX_CHARS_PER_LINE) {
    let cut = rest.lastIndexOf(" ", MAX_CHARS_PER_LINE);
    if (cut < 40) cut = MAX_CHARS_PER_LINE;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}

function paginateLines(body: string): string[][] {
  const flat: string[] = [];
  for (const line of body.split("\n")) {
    flat.push(...wrapLine(line));
  }

  const pages: string[][] = [];
  let current: string[] = [];

  for (const line of flat) {
    if (current.length >= LINES_PER_PAGE) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([""]);
  return pages;
}

function encodePdfUtf16Hex(text: string): string {
  const chars: string[] = ["FEFF"];
  for (let i = 0; i < text.length; i++) {
    chars.push(text.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0"));
  }
  return chars.join("");
}

function pdfHexText(text: string): string {
  return `<${encodePdfUtf16Hex(text)}>`;
}

function buildPageStream(lines: string[]): string {
  const commands: string[] = ["BT", "/F1 10 Tf", "50 750 Td", "14 TL"];
  let first = true;

  for (const line of lines) {
    const safe = line || " ";
    if (first) {
      commands.push(`${pdfHexText(safe)} Tj`);
      first = false;
    } else {
      commands.push("T*");
      commands.push(`${pdfHexText(safe)} Tj`);
    }
  }

  commands.push("ET");
  return commands.join("\n");
}

export function createPdfBlob(body: string): Blob {
  const pages = paginateLines(body);
  const pageCount = pages.length;

  const objects: string[] = [];
  const kids: string[] = [];

  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push(
    `2 0 obj<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pageCount} >>endobj\n`,
  );

  const fontObjId = 3 + pageCount * 2;
  let objId = 3;

  for (let i = 0; i < pageCount; i++) {
    const contentId = objId + 1;
    kids.push(`${objId} 0 R`);

    const stream = buildPageStream(pages[i]);
    objects.push(
      `${contentId} 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj\n`,
    );
    objects.push(
      `${objId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>endobj\n`,
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

function toRtfText(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (ch === "\\" || ch === "{" || ch === "}") {
      out += `\\${ch}`;
    } else if (ch === "\n") {
      out += "\\par ";
    } else if (code > 127) {
      out += `\\u${code}?`;
    } else {
      out += ch;
    }
  }
  return out;
}

export function createDocxBlob(body: string): Blob {
  const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs22 ${toRtfText(body)}}`;
  return new Blob([rtf], { type: "application/rtf" });
}
