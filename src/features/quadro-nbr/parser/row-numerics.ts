import type {
  ConfrontacaoLabels,
  LinhaPavimento,
  LinhaResumo,
  LinhaUnidadeArea,
  LinhaUnidadeReal,
  WithFormatDecimals,
} from "../types";
import { cellNumParsed, cellStr, type CellMatrix } from "./sheet-utils";

export function parseNumericField(
  target: WithFormatDecimals,
  fieldKey: string,
  cell: unknown,
): number | null {
  const { value, decimals } = cellNumParsed(cell);
  if (value !== null && decimals !== null) {
    target.formatDecimals ??= {};
    target.formatDecimals[fieldKey] = decimals;
  }
  return value;
}

function assignNumericField(target: WithFormatDecimals, fieldKey: string, cell: unknown): void {
  const value = parseNumericField(target, fieldKey, cell);
  (target as Record<string, unknown>)[fieldKey] = value;
}

export function finalizeFormatDecimals(target: WithFormatDecimals): void {
  if (target.formatDecimals && Object.keys(target.formatDecimals).length === 0) {
    delete target.formatDecimals;
  }
}

const PAVIMENTO_FIELDS: Array<{ field: keyof LinhaPavimento; col: number }> = [
  { field: "areaPrivativaCobertaPadrao", col: 1 },
  { field: "areaPrivativaCobertaDiferenteReal", col: 2 },
  { field: "areaPrivativaCobertaDiferenteEquivalente", col: 3 },
  { field: "areaPrivativaTotalReal", col: 4 },
  { field: "areaPrivativaTotalEquivalente", col: 5 },
  { field: "areaUsoComumNaoPropCobertaPadrao", col: 6 },
  { field: "areaUsoComumNaoPropCobertaDiferenteReal", col: 7 },
  { field: "areaUsoComumNaoPropCobertaDiferenteEquivalente", col: 8 },
  { field: "areaUsoComumNaoPropTotalReal", col: 9 },
  { field: "areaUsoComumNaoPropTotalEquivalente", col: 10 },
  { field: "areaUsoComumPropCobertaPadrao", col: 11 },
  { field: "areaUsoComumPropCobertaDiferenteReal", col: 12 },
  { field: "areaUsoComumPropCobertaDiferenteEquivalente", col: 13 },
  { field: "areaUsoComumPropTotalReal", col: 14 },
  { field: "areaUsoComumPropTotalEquivalente", col: 15 },
  { field: "areaPavimentoReal", col: 16 },
  { field: "areaPavimentoEquivalente", col: 17 },
  { field: "quantidadePavimentosIdenticos", col: 18 },
];

export function parseLinhaPavimentoFromRow(
  row: CellMatrix[number],
  meta: { pavimento: string; torre?: string },
): LinhaPavimento {
  const linha: LinhaPavimento = {
    pavimento: meta.pavimento,
    torre: meta.torre,
    formatDecimals: {},
    areaPrivativaCobertaPadrao: null,
    areaPrivativaCobertaDiferenteReal: null,
    areaPrivativaCobertaDiferenteEquivalente: null,
    areaPrivativaTotalReal: null,
    areaPrivativaTotalEquivalente: null,
    areaUsoComumNaoPropCobertaPadrao: null,
    areaUsoComumNaoPropCobertaDiferenteReal: null,
    areaUsoComumNaoPropCobertaDiferenteEquivalente: null,
    areaUsoComumNaoPropTotalReal: null,
    areaUsoComumNaoPropTotalEquivalente: null,
    areaUsoComumPropCobertaPadrao: null,
    areaUsoComumPropCobertaDiferenteReal: null,
    areaUsoComumPropCobertaDiferenteEquivalente: null,
    areaUsoComumPropTotalReal: null,
    areaUsoComumPropTotalEquivalente: null,
    areaPavimentoReal: null,
    areaPavimentoEquivalente: null,
    quantidadePavimentosIdenticos: null,
  };

  for (const { field, col } of PAVIMENTO_FIELDS) {
    assignNumericField(linha, field, row[col]);
  }

  finalizeFormatDecimals(linha);
  return linha;
}

export function parseLinhaUnidadeAreaFromRow(
  row: CellMatrix[number],
  meta: { designacao: string; bloco: string },
): LinhaUnidadeArea {
  const linha: LinhaUnidadeArea = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {},
    areaPrivativaCobertaPadrao: null,
    areaPrivativaCobertaDiferenteReal: null,
    areaPrivativaCobertaDiferenteEquivalente: null,
    areaPrivativaTotalReal: null,
    areaPrivativaTotalEquivalente: null,
    areaUsoComumNaoPropCobertaPadrao: null,
    areaUsoComumNaoPropCobertaDiferenteReal: null,
    areaUsoComumNaoPropCobertaDiferenteEquivalente: null,
    areaUsoComumNaoPropTotalReal: null,
    areaUsoComumNaoPropTotalEquivalente: null,
    coeficienteProporcionalidade: null,
    areaUnidadeReal: null,
    areaUnidadeEquivalente: null,
  };

  const fields: Array<{ field: keyof LinhaUnidadeArea; col: number }> = [
    { field: "areaPrivativaCobertaPadrao", col: 1 },
    { field: "areaPrivativaCobertaDiferenteReal", col: 2 },
    { field: "areaPrivativaCobertaDiferenteEquivalente", col: 3 },
    { field: "areaPrivativaTotalReal", col: 4 },
    { field: "areaPrivativaTotalEquivalente", col: 5 },
    { field: "areaUsoComumNaoPropCobertaPadrao", col: 6 },
    { field: "areaUsoComumNaoPropCobertaDiferenteReal", col: 7 },
    { field: "areaUsoComumNaoPropCobertaDiferenteEquivalente", col: 8 },
    { field: "areaUsoComumNaoPropTotalReal", col: 9 },
    { field: "areaUsoComumNaoPropTotalEquivalente", col: 10 },
    { field: "coeficienteProporcionalidade", col: 12 },
    { field: "areaUnidadeReal", col: 18 },
    { field: "areaUnidadeEquivalente", col: 19 },
  ];

  for (const { field, col } of fields) {
    assignNumericField(linha, field, row[col]);
  }

  finalizeFormatDecimals(linha);
  return linha;
}

export function parseLinhaUnidadeRealFromRow(
  row: CellMatrix[number],
  meta: { designacao: string; bloco: string },
): LinhaUnidadeReal {
  const linha: LinhaUnidadeReal = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    observacoes: cellStr(row[8]) || "",
    formatDecimals: {},
    areaPrivativaPrincipal: null,
    areaPrivativaAcessoria: null,
    areaPrivativaTotal: null,
    areaUsoComum: null,
    areaRealTotal: null,
    coeficienteProporcionalidade: null,
    quantidadeIdenticas: null,
  };

  const fields: Array<{ field: keyof LinhaUnidadeReal; col: number }> = [
    { field: "areaPrivativaPrincipal", col: 1 },
    { field: "areaPrivativaAcessoria", col: 2 },
    { field: "areaPrivativaTotal", col: 3 },
    { field: "areaUsoComum", col: 4 },
    { field: "areaRealTotal", col: 5 },
    { field: "coeficienteProporcionalidade", col: 6 },
    { field: "quantidadeIdenticas", col: 7 },
  ];

  for (const { field, col } of fields) {
    assignNumericField(linha, field, row[col]);
  }

  finalizeFormatDecimals(linha);
  return linha;
}

const DEFAULT_CONFRONTACAO_LABELS: ConfrontacaoLabels = {
  norte: "Norte",
  sul: "Sul",
  leste: "Leste",
  oeste: "Oeste",
};

/** Rótulos das colunas de confrontação (NORTE, NOROESTE, etc.) na linha abaixo do cabeçalho UNIDADE. */
export function parseResumoConfrontacaoLabels(
  matrix: CellMatrix,
  headerRow: number,
  madridLayout: boolean,
): ConfrontacaoLabels {
  if (madridLayout) {
    for (let r = headerRow + 1; r <= headerRow + 3; r++) {
      const row = matrix[r] ?? [];
      const first = cellStr(row[12]).toUpperCase();
      if (/NOROESTE|NORTE|SUDOESTE|SUL/i.test(first)) {
        return {
          norte: cellStr(row[12]) || "Noroeste",
          sul: cellStr(row[13]) || "Sudoeste",
          leste: cellStr(row[14]) || DEFAULT_CONFRONTACAO_LABELS.leste,
          oeste: cellStr(row[15]) || DEFAULT_CONFRONTACAO_LABELS.oeste,
        };
      }
    }
    return { norte: "Noroeste", sul: "Sudoeste", leste: "Leste", oeste: "Oeste" };
  }

  for (let r = headerRow + 1; r <= headerRow + 3; r++) {
    const row = matrix[r] ?? [];
    const first = cellStr(row[8]).toUpperCase();
    if (/^(NORTE|NOROESTE|SUL|SUDOESTE|LESTE|OESTE)/i.test(first)) {
      return {
        norte: cellStr(row[8]) || DEFAULT_CONFRONTACAO_LABELS.norte,
        sul: cellStr(row[9]) || DEFAULT_CONFRONTACAO_LABELS.sul,
        leste: cellStr(row[10]) || DEFAULT_CONFRONTACAO_LABELS.leste,
        oeste: cellStr(row[11]) || DEFAULT_CONFRONTACAO_LABELS.oeste,
      };
    }
  }

  return { ...DEFAULT_CONFRONTACAO_LABELS };
}

export function parseLinhaResumoFromRow(
  row: CellMatrix[number],
  meta: { designacao: string; bloco: string },
  madridLayout: boolean,
): LinhaResumo {
  const linha: LinhaResumo = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {},
    confrontacaoNorte: "",
    confrontacaoSul: "",
    confrontacaoLeste: "",
    confrontacaoOeste: "",
    areaPrivativaPrincipal: null,
    areaPrivativaAcessoria: null,
    areaComum: null,
    areaTotal: null,
    fracaoPredial: null,
    fracaoTerrenoPercentual: null,
    fracaoTerrenoM2: null,
    valorUnidade: null,
  };

  if (madridLayout) {
    const fields: Array<{ field: keyof LinhaResumo; col: number }> = [
      { field: "areaPrivativaPrincipal", col: 1 },
      { field: "areaPrivativaAcessoria", col: 7 },
      { field: "areaComum", col: 4 },
      { field: "areaTotal", col: 5 },
      { field: "fracaoPredial", col: 9 },
      { field: "fracaoTerrenoM2", col: 10 },
      { field: "valorUnidade", col: 11 },
    ];
    for (const { field, col } of fields) {
      assignNumericField(linha, field, row[col]);
    }
    linha.confrontacaoNorte = cellStr(row[12]);
    linha.confrontacaoSul = cellStr(row[13]);
    linha.confrontacaoLeste = "";
    linha.confrontacaoOeste = "";
  } else {
    const fields: Array<{ field: keyof LinhaResumo; col: number }> = [
      { field: "areaPrivativaPrincipal", col: 1 },
      { field: "areaPrivativaAcessoria", col: 2 },
      { field: "areaComum", col: 3 },
      { field: "areaTotal", col: 4 },
      { field: "fracaoTerrenoPercentual", col: 5 },
      { field: "fracaoTerrenoM2", col: 6 },
      { field: "valorUnidade", col: 7 },
    ];
    for (const { field, col } of fields) {
      assignNumericField(linha, field, row[col]);
    }
    linha.confrontacaoNorte = cellStr(row[8]);
    linha.confrontacaoSul = cellStr(row[9]);
    linha.confrontacaoLeste = cellStr(row[10]);
    linha.confrontacaoOeste = cellStr(row[11]);
  }

  finalizeFormatDecimals(linha);
  return linha;
}

export function parseQivaLinhaFromRow(
  row: CellMatrix[number],
  meta: { designacao: string; bloco: string },
): WithFormatDecimals & {
  designacao: string;
  bloco: string;
  areaEquivalente: number | null;
  custo: number | null;
  coeficienteProporcionalidade: number | null;
  quantidadeIdenticas: number | null;
} {
  const linha = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {} as Record<string, number>,
    areaEquivalente: null as number | null,
    custo: null as number | null,
    coeficienteProporcionalidade: null as number | null,
    quantidadeIdenticas: null as number | null,
  };

  const fields: Array<{ field: string; col: number }> = [
    { field: "areaEquivalente", col: 1 },
    { field: "custo", col: 2 },
    { field: "coeficienteProporcionalidade", col: 3 },
    { field: "quantidadeIdenticas", col: 11 },
  ];

  for (const { field, col } of fields) {
    assignNumericField(linha, field, row[col]);
  }

  finalizeFormatDecimals(linha);
  return linha;
}
