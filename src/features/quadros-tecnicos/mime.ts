const MIME_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".csv": "text/csv",
};

/** MIME aceito pelo bucket `quadros-tecnicos` — extensão tem prioridade sobre file.type genérico. */
export function resolveQuadroContentType(fileName: string, fileType?: string | null): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (MIME_BY_EXTENSION[ext]) return MIME_BY_EXTENSION[ext];

  const normalized = fileType?.trim();
  if (normalized && normalized !== "application/octet-stream") return normalized;

  return MIME_BY_EXTENSION[".pdf"];
}

export function fileFromBuffer(
  buffer: ArrayBuffer,
  name: string,
  type?: string | null,
): File {
  const contentType = resolveQuadroContentType(name, type);
  return new File([buffer], name, { type: contentType });
}
