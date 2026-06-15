import type {
  ConfrontacaoLabels,
  LinhaPavimento,
  LinhaResumo,
  LinhaUnidadeArea,
  LinhaUnidadeReal,
  WithFormatDecimals,
} from "../types";
import { cellNumParsed, cellStr, findRowIndex, type CellMatrix } from "./sheet-utils";

/** Índices das colunas do Quadro IV B (letras A–I do template CFMD). */
export interface QivbColumnMap {
  areaPrivativaPrincipal: number;
  areaPrivativaAcessoria: number;
  areaPrivativaTotal: number;
  areaUsoComum: number;
  areaRealTotal: number;
  coeficienteProporcionalidade: number;
  quantidadeIdenticas: number;
  observacoes: number;
  /** Quadro IV B.1 — coluna G */
  areaTerrenoExclusivo?: number;
  /** Quadro IV B.1 — coluna H */
  areaTerrenoComum?: number;
  /** Quadro IV B.1 — coluna J */
  coeficienteTerreno?: number;
}

const DEFAULT_QIVB_COLUMN_MAP: QivbColumnMap = {
  areaPrivativaPrincipal: 1,
  areaPrivativaAcessoria: 2,
  areaPrivativaTotal: 3,
  areaUsoComum: 4,
  areaRealTotal: 5,
  coeficienteProporcionalidade: 6,
  quantidadeIdenticas: 7,
  observacoes: 8,
};

const OBSERVACOES_HEADER = /observa[çc][oõeê]s?|observa[çc][aã]o|obs\.?\b/i;
const OBSERVACOES_VAGA_HINT = /direito\s+de\s+uso|\bvaga\b/i;

function isObservacoesText(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  return OBSERVACOES_VAGA_HINT.test(text);
}

function resolveObservacoesFromRow(row: CellMatrix[number], columnMap: QivbColumnMap): string {
  const mapped = cellStr(row[columnMap.observacoes]).trim();
  if (mapped) return mapped;

  if (columnMap.quantidadeIdenticas >= 0) {
    const qtdCell = cellStr(row[columnMap.quantidadeIdenticas]).trim();
    if (qtdCell && isObservacoesText(qtdCell) && cellNumParsed(row[columnMap.quantidadeIdenticas]).value === null) {
      return qtdCell;
    }
  }

  const startCol =
    Math.max(
      columnMap.coeficienteTerreno ?? -1,
      columnMap.quantidadeIdenticas ?? -1,
      columnMap.coeficienteProporcionalidade ?? 6,
    ) + 1;

  for (let c = Math.max(startCol, 0); c < row.length; c++) {
    const text = cellStr(row[c]).trim();
    if (text && isObservacoesText(text)) return text;
  }

  for (let c = 7; c < row.length; c++) {
    if (c === columnMap.observacoes || c === columnMap.quantidadeIdenticas) continue;
    const text = cellStr(row[c]).trim();
    if (text && isObservacoesText(text)) return text;
  }

  return "";
}

function findColumnByHeader(
  matrix: CellMatrix,
  pattern: RegExp,
  startCol = 0,
): number {
  for (let r = 0; r < Math.min(matrix.length, 60); r++) {
    const row = matrix[r] ?? [];
    for (let c = startCol; c < row.length; c++) {
      if (pattern.test(cellStr(row[c]))) return c;
    }
  }
  return -1;
}

/** Mapeia letras de coluna (A–J) e rótulos QUANTIDADE / OBSERVAÇÕES do Quadro IV B. */
export function buildQivbColumnMap(matrix: CellMatrix, letterRowHint?: number): QivbColumnMap {
  const letters: Record<string, number> = {};

  let letterRow = letterRowHint ?? -1;
  if (letterRow < 0) {
    letterRow = findRowIndex(
      matrix,
      (row) =>
        cellStr(row[0]).toUpperCase() === "A" && cellStr(row[1]).toUpperCase() === "B",
    );
  }

  if (letterRow >= 0) {
    const row = matrix[letterRow] ?? [];
    for (let c = 0; c < row.length; c++) {
      const letter = cellStr(row[c]).toUpperCase();
      if (/^[A-J]$/.test(letter) && letters[letter] === undefined) {
        letters[letter] = c;
      }
    }
  }

  const col = (letter: string, fallback: number) => letters[letter] ?? fallback;
  const afterG = col("G", 6) + 1;

  let qtdCol = findColumnByHeader(
    matrix,
    /quantidade.*(?:unidades|número).*idênticas|número de unidades idênticas/i,
    afterG,
  );
  let obsCol = findColumnByHeader(
    matrix,
    OBSERVACOES_HEADER,
    qtdCol >= 0 ? qtdCol + 1 : afterG,
  );

  if (qtdCol < 0) qtdCol = col("H", 7);
  if (obsCol < 0) obsCol = col("I", 8);

  return {
    areaPrivativaPrincipal: col("B", 1),
    areaPrivativaAcessoria: col("C", 2),
    areaPrivativaTotal: col("D", 3),
    areaUsoComum: col("E", 4),
    areaRealTotal: col("F", 5),
    coeficienteProporcionalidade: col("G", 6),
    quantidadeIdenticas: qtdCol,
    observacoes: obsCol,
  };
}

/** Mapeia colunas A–J do Quadro IV B.1 (terreno exclusivo + comum). */
export function buildQivb1ColumnMap(matrix: CellMatrix, letterRowHint?: number): QivbColumnMap {
  const letters: Record<string, number> = {};

  let letterRow = letterRowHint ?? -1;
  if (letterRow < 0) {
    letterRow = findRowIndex(
      matrix,
      (row) =>
        cellStr(row[0]).toUpperCase() === "A" && cellStr(row[1]).toUpperCase() === "B",
    );
  }

  if (letterRow >= 0) {
    const row = matrix[letterRow] ?? [];
    for (let c = 0; c < row.length; c++) {
      const letter = cellStr(row[c]).toUpperCase();
      if (/^[A-J]$/.test(letter) && letters[letter] === undefined) {
        letters[letter] = c;
      }
    }
  }

  const col = (letter: string, fallback: number) => letters[letter] ?? fallback;
  const afterJ = col("J", 9) + 1;

  let qtdCol = findColumnByHeader(
    matrix,
    /quantidade.*(?:unidades|número).*idênticas|número de unidades idênticas/i,
    afterJ,
  );
  let obsCol = findColumnByHeader(
    matrix,
    OBSERVACOES_HEADER,
    qtdCol >= 0 ? qtdCol + 1 : afterJ,
  );

  if (qtdCol < 0) {
    qtdCol = findColumnByHeader(matrix, /quantidade/i, afterJ);
  }

  if (obsCol < 0) obsCol = col("K", 10);
  if (obsCol < 0) obsCol = col("L", 11);

  return {
    areaPrivativaPrincipal: col("B", 1),
    areaPrivativaAcessoria: col("C", 2),
    areaPrivativaTotal: col("D", 3),
    areaUsoComum: col("E", 4),
    areaRealTotal: col("F", 5),
    areaTerrenoExclusivo: col("G", 6),
    areaTerrenoComum: col("H", 7),
    coeficienteProporcionalidade: col("I", 8),
    coeficienteTerreno: col("J", 9),
    quantidadeIdenticas: qtdCol >= 0 ? qtdCol : col("K", 10),
    observacoes: obsCol >= 0 ? obsCol : col("L", 11),
  };
}

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
  columnMap: QivbColumnMap = DEFAULT_QIVB_COLUMN_MAP,
): LinhaUnidadeReal {
  const linha: LinhaUnidadeReal = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    observacoes: resolveObservacoesFromRow(row, columnMap),
    formatDecimals: {},
    areaPrivativaPrincipal: null,
    areaPrivativaAcessoria: null,
    areaPrivativaTotal: null,
    areaUsoComum: null,
    areaRealTotal: null,
    coeficienteProporcionalidade: null,
    quantidadeIdenticas: null,
  };

  const fields: Array<{ field: keyof LinhaUnidadeReal; col: number | undefined }> = [
    { field: "areaPrivativaPrincipal", col: columnMap.areaPrivativaPrincipal },
    { field: "areaPrivativaAcessoria", col: columnMap.areaPrivativaAcessoria },
    { field: "areaPrivativaTotal", col: columnMap.areaPrivativaTotal },
    { field: "areaUsoComum", col: columnMap.areaUsoComum },
    { field: "areaRealTotal", col: columnMap.areaRealTotal },
    { field: "coeficienteProporcionalidade", col: columnMap.coeficienteProporcionalidade },
    { field: "quantidadeIdenticas", col: columnMap.quantidadeIdenticas },
    { field: "areaTerrenoExclusivo", col: columnMap.areaTerrenoExclusivo },
    { field: "areaTerrenoComum", col: columnMap.areaTerrenoComum },
    { field: "coeficienteTerreno", col: columnMap.coeficienteTerreno },
  ];

  for (const { field, col } of fields) {
    if (col === undefined) continue;
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

const MADRID_CONFRONTACAO_LABELS: ConfrontacaoLabels = {
  norte: "Noroeste",
  sul: "Sudoeste",
  leste: "Nordeste",
  oeste: "Sudeste",
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
      if (/NOROESTE|NORTE|SUDOESTE|SUL|NORDESTE|SUDESTE/i.test(first)) {
        return {
          norte: cellStr(row[12]) || MADRID_CONFRONTACAO_LABELS.norte,
          sul: cellStr(row[13]) || MADRID_CONFRONTACAO_LABELS.sul,
          leste: cellStr(row[14]) || MADRID_CONFRONTACAO_LABELS.leste,
          oeste: cellStr(row[15]) || MADRID_CONFRONTACAO_LABELS.oeste,
        };
      }
    }
    return { ...MADRID_CONFRONTACAO_LABELS };
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
    linha.confrontacaoLeste = cellStr(row[14]);
    linha.confrontacaoOeste = cellStr(row[15]);
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
