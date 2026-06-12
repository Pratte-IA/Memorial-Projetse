import type { ExportacaoRecord } from "./types";

type ExportRow = {
  id: number;
  memorial_id: number;
  empreendimento_id: number;
  tipo: string;
  formato: string;
  status: string;
  storage_path: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
  memoriais: { versao: number } | null;
};

export function mapRowToExportacao(row: ExportRow): ExportacaoRecord | null {
  if (!row.storage_path) return null;

  const fileName = row.storage_path.split("/").pop() ?? row.storage_path;

  return {
    id: row.id,
    memorialId: row.memorial_id,
    empreendimentoId: row.empreendimento_id,
    tipo: row.tipo as ExportacaoRecord["tipo"],
    formato: row.formato as ExportacaoRecord["formato"],
    status: row.status,
    storagePath: row.storage_path,
    fileName,
    memorialVersao: row.memoriais?.versao ?? null,
    createdAt: row.created_at,
    createdByName: row.profiles?.full_name ?? "—",
  };
}
