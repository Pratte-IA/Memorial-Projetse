import { getMemorialStatusLabel, getSecaoStatusLabel } from "./status";
import type { MemorialDbStatus, MemorialRecord, SecaoDbStatus, SecaoRecord } from "./types";

type SecaoRow = {
  id: number;
  memorial_id: number;
  clausula_id: number | null;
  titulo: string;
  conteudo: string | null;
  status: string;
  ordem: number;
  updated_at: string;
};

type MemorialRow = {
  id: number;
  empreendimento_id: number;
  versao: number;
  status: string;
  memorial_secoes: SecaoRow[];
};

export function mapRowToSecao(row: SecaoRow): SecaoRecord {
  const status = row.status as SecaoDbStatus;
  return {
    id: row.id,
    memorialId: row.memorial_id,
    clausulaId: row.clausula_id,
    titulo: row.titulo,
    conteudo: row.conteudo ?? "",
    status,
    statusLabel: getSecaoStatusLabel(status),
    ordem: row.ordem,
    updatedAt: row.updated_at,
  };
}

export function mapRowToMemorial(row: MemorialRow): MemorialRecord {
  const status = row.status as MemorialDbStatus;
  const secoes = (row.memorial_secoes ?? []).map(mapRowToSecao).sort((a, b) => a.ordem - b.ordem);

  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    versao: row.versao,
    status,
    statusLabel: getMemorialStatusLabel(status),
    secoes,
  };
}
