import { extractVaga } from "@/features/quadro-nbr/extract-vaga";

import { getUnidadeStatusLabel } from "./status";
import type { UnidadeDbStatus, UnidadeRecord, UnidadesResumo } from "./types";

function resolveVaga(vaga: string | null, observacoes: string | null): string {
  const direta = vaga?.trim();
  if (direta) return direta;

  const extraida = extractVaga(observacoes ?? "");
  return extraida || "—";
}

type UnidadeRow = {
  id: number;
  empreendimento_id: number;
  nome: string;
  torre: string | null;
  pavimento: string | null;
  tipo: string | null;
  area_privativa: number | null;
  area_comum: number | null;
  area_total: number | null;
  area_garden: number | null;
  vaga: string | null;
  fracao: string | null;
  status: string;
  confrontacoes: string | null;
  observacoes: string | null;
};

export function mapRowToUnidade(row: UnidadeRow): UnidadeRecord {
  const status = row.status as UnidadeDbStatus;
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    nome: row.nome,
    torre: row.torre ?? "—",
    pavimento: row.pavimento ?? "—",
    tipo: row.tipo ?? "—",
    areaPrivativa: Number(row.area_privativa ?? 0),
    areaComum: Number(row.area_comum ?? 0),
    areaTotal: Number(row.area_total ?? 0),
    garden: Number(row.area_garden ?? 0),
    vaga: resolveVaga(row.vaga, row.observacoes),
    fracao: row.fracao ?? "—",
    status,
    statusLabel: getUnidadeStatusLabel(status),
    confrontacoes: row.confrontacoes ?? "",
    observacoes: row.observacoes ?? "",
  };
}

export function computeResumo(unidades: UnidadeRecord[]): UnidadesResumo {
  return {
    total: unidades.length,
    validado: unidades.filter((u) => u.status === "validado").length,
    pendente: unidades.filter((u) => u.status === "pendente").length,
    inconsistencia: unidades.filter((u) => u.status === "inconsistencia").length,
    naoRevisado: unidades.filter((u) => u.status === "nao_revisado").length,
  };
}
