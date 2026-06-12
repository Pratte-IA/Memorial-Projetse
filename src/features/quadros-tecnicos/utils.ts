import { QUADROS_TECNICOS_BUCKET } from "./constants";

export function buildQuadroStoragePath(
  organizationId: number,
  empreendimentoId: number,
  fileName: string,
): string {
  const safeName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return `${organizationId}/${empreendimentoId}/${unique}_${safeName || "quadro.pdf"}`;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function getQuadroBucketName(): string {
  return QUADROS_TECNICOS_BUCKET;
}
