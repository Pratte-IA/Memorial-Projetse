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

export function resolveTimbradoContentType(fileName: string, fileType?: string): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return fileType || "application/octet-stream";
}
