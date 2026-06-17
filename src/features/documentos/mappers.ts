import type { ClausulaRecord, ModeloRecord } from "./types";

type ModeloRow = {
  id: number;
  organization_id: number;
  nome: string;
  tipo: string | null;
  status: string;
  updated_at: string;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
};

type ClausulaRow = {
  id: number;
  organization_id: number;
  modelo_id: number | null;
  titulo: string;
  categoria: string | null;
  resumo: string | null;
  template: string;
  variaveis: string[] | null;
  status: string;
  ordem: number;
  updated_at: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function modeloStatusLabel(status: string): string {
  return status === "ativo" ? "Ativo" : "Rascunho";
}

function clausulaStatusLabel(status: string): string {
  return status === "publicada" ? "Publicada" : "Em revisão";
}

export function mapRowToModelo(row: ModeloRow): ModeloRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    nome: row.nome,
    tipo: row.tipo ?? "—",
    status: row.status,
    statusLabel: modeloStatusLabel(row.status),
    atualizadoEm: formatDate(row.updated_at),
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    hasTimbrado: Boolean(row.storage_path),
  };
}

export function mapRowToClausula(row: ClausulaRow): ClausulaRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    modeloId: row.modelo_id,
    titulo: row.titulo,
    categoria: row.categoria ?? "—",
    resumo: row.resumo ?? "",
    template: row.template,
    variaveis: row.variaveis ?? [],
    status: row.status,
    statusLabel: clausulaStatusLabel(row.status),
    ordem: row.ordem,
    atualizadoEm: formatDate(row.updated_at),
  };
}
