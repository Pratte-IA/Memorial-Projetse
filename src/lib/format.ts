// Helpers de formatação numérica padrão pt-BR
// Ponto como separador de milhar e vírgula como separador decimal.

import { loteQuadraPorExtenso, stripLoteQuadraPrefix } from "./numero-extenso";

export function fmtNum(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formata número respeitando casas decimais explícitas (ex.: do documento original). */
export function fmtNumWithDecimals(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return "—";
  if (decimals !== undefined) return fmtNum(value, decimals);
  return fmtNum(value, inferDecimalPlaces(value));
}

/** Inferência de casas decimais quando o documento não registrou o formato. */
export function inferDecimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return 2;
  if (Number.isInteger(value)) return 0;
  const fixed = value.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
  const dot = fixed.indexOf(".");
  return dot >= 0 ? fixed.length - dot - 1 : 0;
}

// Áreas: 2 casas por padrão (ex.: 3.113,58 m²). Para áreas privativas/comuns
// das unidades use 3 casas (ex.: 43,300 m²).
export function fmtArea(value: number, decimals = 2): string {
  return `${fmtNum(value, decimals)} m²`;
}

export function fmtInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function isEmptyField(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed === "—";
}

/** Separa texto combinado do NBR (ex.: "Lote 12-A, Quadra 0503") em lote e quadra. */
export function parseLoteQuadra(raw: string): { lote: string; quadra: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { lote: "", quadra: "" };

  const match = trimmed.match(/^lote\s*(?:n[º°]?\s*)?([^,]+?)(?:,\s*quadra\s*(?:n[º°]?\s*)?(.+))?$/i);
  if (match) {
    return {
      lote: stripLoteQuadraPrefix(match[1]),
      quadra: stripLoteQuadraPrefix(match[2] ?? ""),
    };
  }

  return { lote: stripLoteQuadraPrefix(trimmed), quadra: "" };
}

/** Normaliza lote/quadra separados e gera por extenso quando ausente no banco. */
export function normalizeLoteQuadraFields(
  loteRaw: string,
  quadraRaw: string,
  loteExtensoRaw?: string | null,
  quadraExtensoRaw?: string | null,
): {
  lote: string;
  quadra: string;
  loteExtenso: string;
  quadraExtenso: string;
} {
  let lote = stripLoteQuadraPrefix(loteRaw);
  let quadra = stripLoteQuadraPrefix(quadraRaw);

  if (!quadra && (/^lote\s/i.test(loteRaw.trim()) || /quadra/i.test(loteRaw))) {
    const parsed = parseLoteQuadra(loteRaw);
    lote = parsed.lote;
    quadra = parsed.quadra;
  }

  const loteExtenso = loteExtensoRaw?.trim() || (lote ? loteQuadraPorExtenso(lote) : "");
  const quadraExtenso = quadraExtensoRaw?.trim() || (quadra ? loteQuadraPorExtenso(quadra) : "");

  return { lote, quadra, loteExtenso, quadraExtenso };
}

/** Converte texto pt-BR (com ou sem unidade) em número. */
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

/** Exibe lote e quadra sem barra solta quando um dos campos está vazio. */
export function formatLoteQuadra(lote: string, quadra: string): string {
  const l = lote.trim();
  const q = quadra.trim();

  if (isEmptyField(l) && isEmptyField(q)) return "—";
  if (isEmptyField(l)) return q;
  if (isEmptyField(q)) return l;
  if (/quadra/i.test(l)) return l;
  return `${l} / ${q}`;
}

const UF_NOME_EXTENSO: Record<string, string> = {
  AC: "ACRE",
  AL: "ALAGOAS",
  AP: "AMAPÁ",
  AM: "AMAZONAS",
  BA: "BAHIA",
  CE: "CEARÁ",
  DF: "DISTRITO FEDERAL",
  ES: "ESPÍRITO SANTO",
  GO: "GOIÁS",
  MA: "MARANHÃO",
  MT: "MATO GROSSO",
  MS: "MATO GROSSO DO SUL",
  MG: "MINAS GERAIS",
  PA: "PARÁ",
  PB: "PARAÍBA",
  PR: "PARANÁ",
  PE: "PERNAMBUCO",
  PI: "PIAUÍ",
  RJ: "RIO DE JANEIRO",
  RN: "RIO GRANDE DO NORTE",
  RS: "RIO GRANDE DO SUL",
  RO: "RONDÔNIA",
  RR: "RORAIMA",
  SC: "SANTA CATARINA",
  SP: "SÃO PAULO",
  SE: "SERGIPE",
  TO: "TOCANTINS",
};

/** Nome do estado por extenso a partir da UF (ex.: PR → PARANÁ). */
export function ufPorExtenso(uf: string): string {
  const key = uf.trim().toUpperCase();
  return UF_NOME_EXTENSO[key] ?? "";
}

export interface ParsedBrDate {
  day: number;
  month: number;
  year: number;
}

function expandTwoDigitYear(year: number): number {
  if (year >= 100) return year;
  return year >= 70 ? 1900 + year : 2000 + year;
}

/** Interpreta datas em DD/MM/AAAA, MM/DD/AA (Excel US) ou ISO. */
export function parseFlexibleDate(value: string): ParsedBrDate | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { day, month, year };
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!slashMatch) return null;

  const part1 = Number(slashMatch[1]);
  const part2 = Number(slashMatch[2]);
  const year = expandTwoDigitYear(Number(slashMatch[3]));

  let day: number;
  let month: number;
  if (part1 > 12) {
    day = part1;
    month = part2;
  } else if (part2 > 12) {
    month = part1;
    day = part2;
  } else {
    day = part1;
    month = part2;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year };
}

/** Exibe data no padrão DD/MM/AAAA. */
export function formatBrDateDisplay(value: string): string {
  const parsed = parseFlexibleDate(value);
  if (!parsed) return value;
  const { day, month, year } = parsed;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** Máscara de digitação DD/MM/AAAA. */
export function maskBrDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte data dd/mm/aaaa (ou ISO) para ISO yyyy-mm-dd. */
export function parseBrDate(value: string): string | null {
  const parsed = parseFlexibleDate(value);
  if (!parsed) return null;
  const { day, month, year } = parsed;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Exibe UF com nome do estado, sem traço duplicado quando o extenso está vazio. */
export function formatEstadoUf(uf: string, estadoExtenso?: string): string {
  const sigla = uf.trim();
  if (!sigla || sigla === "—") return "—";

  const extensoRaw = estadoExtenso?.trim() ?? "";
  const extenso =
    extensoRaw && extensoRaw !== "—" ? extensoRaw : ufPorExtenso(sigla);

  if (!extenso || extenso.toUpperCase() === sigla.toUpperCase()) return sigla;
  return `${sigla} — ${extenso}`;
}
