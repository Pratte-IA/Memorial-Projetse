import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { EmpreendimentoStatus } from "@/lib/mock-data";

import { getEmpreendimentoStatusLabel } from "./status";
import type { EmpreendimentoListItem, EmpreendimentoView } from "./types";

type IncorporadoraEmbed = { razao_social: string; cnpj: string | null } | null;
type ProfileEmbed = { full_name: string } | null;
type DadosTecnicosEmbed = {
  unidades: number | null;
  torres: number | null;
  pavimentos: number | null;
  vagas: number | null;
  area_terreno: number | null;
  area_global: number | null;
  alvara: string | null;
  data_aprovacao: string | null;
  crea_cau: string | null;
  art_rrt: string | null;
  responsavel_tecnico: string | null;
} | null;

export type EmpreendimentoRowWithJoins = {
  id: number;
  nome: string;
  cidade: string | null;
  uf: string | null;
  endereco: string | null;
  lote: string | null;
  quadra: string | null;
  matricula: string | null;
  status: string;
  progresso: number;
  pendencias_count: number;
  updated_at: string;
  incorporadoras: IncorporadoraEmbed;
  profiles: ProfileEmbed;
  dados_tecnicos: DadosTecnicosEmbed;
};

export function formatDateBr(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function mapRowToListItem(row: EmpreendimentoRowWithJoins): EmpreendimentoListItem {
  return {
    id: row.id,
    idParam: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    responsavel: row.profiles?.full_name ?? row.dados_tecnicos?.responsavel_tecnico ?? "—",
    status: row.status,
    statusLabel: getEmpreendimentoStatusLabel(row.status),
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    unidades: row.dados_tecnicos?.unidades ?? 0,
  };
}

export function mapRowToView(row: EmpreendimentoRowWithJoins): EmpreendimentoView {
  const dt = row.dados_tecnicos;
  return {
    id: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    endereco: row.endereco ?? "—",
    lote: row.lote ?? "—",
    quadra: row.quadra ?? "—",
    matricula: row.matricula ?? "—",
    responsavel: row.profiles?.full_name ?? dt?.responsavel_tecnico ?? "—",
    status: getEmpreendimentoStatusLabel(row.status) as EmpreendimentoStatus,
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    areaTerreno: Number(dt?.area_terreno ?? 0),
    areaGlobal: Number(dt?.area_global ?? 0),
    torres: dt?.torres ?? 0,
    pavimentos: dt?.pavimentos ?? 0,
    unidades: dt?.unidades ?? 0,
    vagas: dt?.vagas ?? 0,
    alvara: dt?.alvara ?? "—",
    dataAprovacao: formatDateBr(dt?.data_aprovacao),
    crea: dt?.crea_cau ?? "—",
    art: dt?.art_rrt ?? "—",
  };
}

export function parseBrNumeric(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}
