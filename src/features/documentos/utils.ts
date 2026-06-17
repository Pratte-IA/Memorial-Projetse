export function buildModeloStoragePath(
  organizationId: number,
  modeloId: number,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${organizationId}/${modeloId}/${safeName}`;
}

export function isTimbradoExtension(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return ext === ".docx" || ext === ".pdf";
}

export function extractVariaveisFromTemplate(template: string): string[] {
  const matches = template.matchAll(/\{\{([^}]+)\}\}/g);
  return [...new Set([...matches].map((match) => match[1].trim()))];
}

export function wrapTextRangeWithAsterisks(
  text: string,
  start: number,
  end: number,
): { next: string; selectionStart: number; selectionEnd: number } | null {
  if (start === end) return null;

  const selected = text.slice(start, end);
  const wrapped = `*${selected}*`;

  return {
    next: text.slice(0, start) + wrapped + text.slice(end),
    selectionStart: start + 1,
    selectionEnd: start + 1 + selected.length,
  };
}

export function resolveTimbradoContentType(fileName: string, fileType?: string): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return fileType || "application/octet-stream";
}
