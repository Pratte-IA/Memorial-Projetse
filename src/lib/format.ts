// Helpers de formatação numérica padrão pt-BR
// Ponto como separador de milhar e vírgula como separador decimal.

export function fmtNum(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
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
