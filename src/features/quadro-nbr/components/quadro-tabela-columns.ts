import { fmtNumWithDecimals } from "@/lib/format";
import type {
  ConfrontacaoLabels,
  LinhaAcabamento,
  LinhaEquipamento,
  LinhaPavimento,
  LinhaResumo,
  LinhaUnidadeArea,
  LinhaUnidadeReal,
  QuadroExtraido,
  QuadroIVB,
  QuadroResumo,
  WithFormatDecimals,
} from "../types";

export interface TabelaColuna<T> {
  id: string;
  label: string;
  /** Chave do campo na linha para edição inline. */
  fieldKey?: string;
  alwaysShow?: boolean;
  /** Coluna fixa ao rolar horizontalmente (identificadores: pavimento, unidade, torre). */
  sticky?: boolean;
  mono?: boolean;
  truncate?: boolean;
  /** Texto longo com quebra de linha (ex.: observações). */
  wrap?: boolean;
  getValue: (row: T) => string | number | null;
  /** Casas decimais originais do documento para esta coluna. */
  getDecimals?: (row: T) => number | undefined;
}

/** Largura mínima (px) das colunas fixas — fallback quando não há dados. */
export const STICKY_COLUMN_WIDTH_PX: Record<string, number> = {
  torre: 100,
  pavimento: 140,
  designacao: 220,
  equipamento: 140,
  dependencia: 140,
};

export const WRAP_COLUMN_DEFAULT_MIN_WIDTH_PX = 280;

export const NUMERIC_COLUMN_MIN_WIDTH_PX = 80;
export const TEXT_DATA_COL_MIN_WIDTH_PX = 72;
export const DEFAULT_DATA_COL_MIN_WIDTH_PX = NUMERIC_COLUMN_MIN_WIDTH_PX;

/** Mapa coluna → largura (px) calculada a partir do conteúdo. */
export type ColumnWidthMap = Record<string, number>;

/** ~largura de um caractere em text-xs (px), com margem para acentos e maiúsculas. */
const CHAR_PX_TEXT = 8.5;
const CHAR_PX_MONO = 8;
/** padding do input (px-3) + borda + padding da célula (p-1). */
const FIELD_PADDING_PX = 52;
/** Caracteres extras para evitar corte visual no limite. */
const WIDTH_CHAR_BUFFER = 2;

export function estimateTextWidthPx(text: string, mono = false): number {
  if (!text) return 0;
  const charPx = mono ? CHAR_PX_MONO : CHAR_PX_TEXT;
  return Math.ceil(text.length * charPx + FIELD_PADDING_PX);
}

function widthFromMaxChars(maxChars: number, mono = false): number {
  const charPx = mono ? CHAR_PX_MONO : CHAR_PX_TEXT;
  return Math.ceil((maxChars + WIDTH_CHAR_BUFFER) * charPx + FIELD_PADDING_PX);
}

function columnCellText(
  col: TabelaColuna<unknown>,
  raw: string | number | null,
  decimals?: number,
): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "number") {
    const formatted = formatCellValue(raw, true, decimals);
    return formatted === "—" ? "" : formatted;
  }
  const trimmed = raw.trim();
  return trimmed === "—" ? "" : trimmed;
}

function isAcabamentoSecaoRow(linha: unknown): boolean {
  return Boolean((linha as LinhaAcabamento).isSecao);
}

/** Calcula a largura de cada coluna com base no maior texto (cabeçalho + linhas). */
export function computeColumnContentWidths(
  colunas: TabelaColuna<unknown>[],
  linhas: unknown[],
): ColumnWidthMap {
  const widths: ColumnWidthMap = {};

  for (const col of colunas) {
    const floor = col.mono ? NUMERIC_COLUMN_MIN_WIDTH_PX : TEXT_DATA_COL_MIN_WIDTH_PX;
    let maxChars = col.label.length;

    for (const linha of linhas) {
      if (isAcabamentoSecaoRow(linha)) continue;

      const raw = col.getValue(linha);
      const text = columnCellText(col, raw, col.getDecimals?.(linha));
      maxChars = Math.max(maxChars, text.length);
    }

    widths[col.id] = Math.max(floor, widthFromMaxChars(maxChars, col.mono));
  }

  return widths;
}

export function sumColumnWidths(
  colunas: TabelaColuna<unknown>[],
  columnWidths: ColumnWidthMap,
): number {
  return colunas.reduce(
    (total, col) => total + (columnWidths[col.id] ?? getColumnMinWidth(col, columnWidths)),
    0,
  );
}

export function inputSizeChars(value: string, label: string, mono = false): number {
  const longest = Math.max(value.length, label.length, mono ? 4 : 6);
  return longest + WIDTH_CHAR_BUFFER;
}

export function getColumnMinWidth(
  col: TabelaColuna<unknown>,
  columnWidths?: ColumnWidthMap,
): number {
  if (columnWidths?.[col.id]) {
    return columnWidths[col.id];
  }
  if (col.sticky) {
    return STICKY_COLUMN_WIDTH_PX[col.id] ?? 120;
  }
  if (col.mono) return NUMERIC_COLUMN_MIN_WIDTH_PX;
  if (col.wrap) return WRAP_COLUMN_DEFAULT_MIN_WIDTH_PX;
  return TEXT_DATA_COL_MIN_WIDTH_PX;
}

export function getColumnWidthStyle(
  col: TabelaColuna<unknown>,
  sticky: StickyColumnStyle | null,
  columnWidths?: ColumnWidthMap,
): { minWidth: number; width?: number; left?: number } | undefined {
  const contentWidth = columnWidths?.[col.id];

  if (sticky) {
    const width = contentWidth ?? sticky.minWidth;
    return { left: sticky.left, minWidth: width, width };
  }

  if (contentWidth) {
    if (col.mono) {
      return { minWidth: contentWidth, width: contentWidth };
    }
    return { minWidth: contentWidth, width: contentWidth };
  }

  if (col.mono) {
    return { minWidth: NUMERIC_COLUMN_MIN_WIDTH_PX, width: NUMERIC_COLUMN_MIN_WIDTH_PX };
  }

  return undefined;
}

export interface StickyColumnStyle {
  left: number;
  minWidth: number;
  isLastSticky: boolean;
}

export function getStickyColumnStyle(
  colunas: TabelaColuna<unknown>[],
  index: number,
  columnWidths?: ColumnWidthMap,
): StickyColumnStyle | null {
  const col = colunas[index];
  if (!col.sticky) return null;

  const widthFor = (c: TabelaColuna<unknown>) =>
    columnWidths?.[c.id] ?? STICKY_COLUMN_WIDTH_PX[c.id] ?? 100;

  let left = 0;
  for (let i = 0; i < index; i++) {
    if (colunas[i].sticky) {
      left += widthFor(colunas[i]);
    }
  }

  const minWidth = widthFor(col);
  const isLastSticky = !colunas.slice(index + 1).some((c) => c.sticky);

  return { left, minWidth, isLastSticky };
}

export function cellHasData(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  return value.trim().length > 0;
}

export function filterColumnsWithData<T>(rows: T[], columns: TabelaColuna<T>[]): TabelaColuna<T>[] {
  return columns.filter(
    (col) => col.alwaysShow || rows.some((row) => cellHasData(col.getValue(row))),
  );
}

export function formatCellValue(
  value: string | number | null,
  _mono = false,
  decimals?: number,
): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return fmtNumWithDecimals(value, decimals);
  }
  const text = value.trim();
  return text || "—";
}

function numCol<T extends WithFormatDecimals>(
  id: string,
  label: string,
  fieldKey: string,
  getValue: (row: T) => number | null,
  alwaysShow?: boolean,
): TabelaColuna<T> {
  return {
    id,
    label,
    fieldKey,
    alwaysShow,
    mono: true,
    getValue,
    getDecimals: (row) => row.formatDecimals?.[fieldKey],
  };
}

function textCol<T>(
  id: string,
  label: string,
  getValue: (row: T) => string,
  alwaysShow?: boolean,
  truncate?: boolean,
  sticky?: boolean,
  fieldKey?: string,
): TabelaColuna<T> {
  return {
    id,
    label,
    fieldKey: fieldKey ?? id,
    alwaysShow,
    truncate,
    sticky: sticky ?? alwaysShow ?? false,
    getValue: (row) => getValue(row) || null,
  };
}

const PAVIMENTO_COLS: TabelaColuna<LinhaPavimento>[] = [
  numCol("col2", "2 — Coberta padrão", "areaPrivativaCobertaPadrao", (r) => r.areaPrivativaCobertaPadrao),
  numCol("col3", "3 — Real", "areaPrivativaCobertaDiferenteReal", (r) => r.areaPrivativaCobertaDiferenteReal),
  numCol("col4", "4 — Equivalente", "areaPrivativaCobertaDiferenteEquivalente", (r) => r.areaPrivativaCobertaDiferenteEquivalente),
  numCol("col5", "5 — Total real", "areaPrivativaTotalReal", (r) => r.areaPrivativaTotalReal),
  numCol("col6", "6 — Total equiv. padrão", "areaPrivativaTotalEquivalente", (r) => r.areaPrivativaTotalEquivalente),
  numCol("col7", "7 — Coberta padrão", "areaUsoComumNaoPropCobertaPadrao", (r) => r.areaUsoComumNaoPropCobertaPadrao),
  numCol("col8", "8 — Real", "areaUsoComumNaoPropCobertaDiferenteReal", (r) => r.areaUsoComumNaoPropCobertaDiferenteReal),
  numCol("col9", "9 — Equivalente", "areaUsoComumNaoPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumNaoPropCobertaDiferenteEquivalente),
  numCol("col10", "10 — Total real", "areaUsoComumNaoPropTotalReal", (r) => r.areaUsoComumNaoPropTotalReal),
  numCol("col11", "11 — Total equiv. padrão", "areaUsoComumNaoPropTotalEquivalente", (r) => r.areaUsoComumNaoPropTotalEquivalente),
  numCol("col12", "12 — Coberta padrão", "areaUsoComumPropCobertaPadrao", (r) => r.areaUsoComumPropCobertaPadrao),
  numCol("col13", "13 — Real", "areaUsoComumPropCobertaDiferenteReal", (r) => r.areaUsoComumPropCobertaDiferenteReal),
  numCol("col14", "14 — Equivalente", "areaUsoComumPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumPropCobertaDiferenteEquivalente),
  numCol("col15", "15 — Total real", "areaUsoComumPropTotalReal", (r) => r.areaUsoComumPropTotalReal),
  numCol("col16", "16 — Total equiv. padrão", "areaUsoComumPropTotalEquivalente", (r) => r.areaUsoComumPropTotalEquivalente),
  numCol("col17", "17 — Real", "areaPavimentoReal", (r) => r.areaPavimentoReal),
  numCol("col18", "18 — Equiv. padrão", "areaPavimentoEquivalente", (r) => r.areaPavimentoEquivalente),
  numCol("colQtd", "Qtd. idênticos", "quantidadePavimentosIdenticos", (r) => r.quantidadePavimentosIdenticos),
];

function buildPavimentoColumns(includeTorre: boolean): TabelaColuna<LinhaPavimento>[] {
  const base: TabelaColuna<LinhaPavimento>[] = [];
  if (includeTorre) {
    base.push(textCol("torre", "Torre", (r) => r.torre ?? "", false, false, true));
  }
  base.push(textCol("pavimento", "Pavimento", (r) => r.pavimento, true, false, true));
  return [...base, ...PAVIMENTO_COLS];
}

const QII_COLS: TabelaColuna<LinhaUnidadeArea>[] = [
  textCol("designacao", "Unidade (19)", (r) => r.designacao, true, false, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol("col20", "20 — Coberta padrão", "areaPrivativaCobertaPadrao", (r) => r.areaPrivativaCobertaPadrao),
  numCol("col21", "21 — Real", "areaPrivativaCobertaDiferenteReal", (r) => r.areaPrivativaCobertaDiferenteReal),
  numCol("col22", "22 — Equivalente", "areaPrivativaCobertaDiferenteEquivalente", (r) => r.areaPrivativaCobertaDiferenteEquivalente),
  numCol("col23", "23 — Total real", "areaPrivativaTotalReal", (r) => r.areaPrivativaTotalReal),
  numCol("col24", "24 — Total equiv. padrão", "areaPrivativaTotalEquivalente", (r) => r.areaPrivativaTotalEquivalente),
  numCol("col25", "25 — Coberta padrão", "areaUsoComumNaoPropCobertaPadrao", (r) => r.areaUsoComumNaoPropCobertaPadrao),
  numCol("col26", "26 — Real", "areaUsoComumNaoPropCobertaDiferenteReal", (r) => r.areaUsoComumNaoPropCobertaDiferenteReal),
  numCol("col27", "27 — Equivalente", "areaUsoComumNaoPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumNaoPropCobertaDiferenteEquivalente),
  numCol("col28", "28 — Total real", "areaUsoComumNaoPropTotalReal", (r) => r.areaUsoComumNaoPropTotalReal),
  numCol("col29", "29 — Total equiv. padrão", "areaUsoComumNaoPropTotalEquivalente", (r) => r.areaUsoComumNaoPropTotalEquivalente),
  numCol("col31", "31 — Coef. proporcionalidade", "coeficienteProporcionalidade", (r) => r.coeficienteProporcionalidade),
  numCol("col37", "37 — Área unidade real", "areaUnidadeReal", (r) => r.areaUnidadeReal),
  numCol("col38", "38 — Área unidade equiv.", "areaUnidadeEquivalente", (r) => r.areaUnidadeEquivalente),
  numCol(
    "colQtdUnidades",
    "Qtd. idênticas",
    "quantidadeIdenticas",
    (r) => r.quantidadeIdenticas,
  ),
];

const QIVB_COLS: TabelaColuna<LinhaUnidadeReal>[] = [
  textCol("designacao", "A — Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol(
    "colB",
    "B — Área priv. principal",
    "areaPrivativaPrincipal",
    (r) => r.areaPrivativaPrincipal,
    true,
  ),
  numCol(
    "colC",
    "C — Área priv. acessória",
    "areaPrivativaAcessoria",
    (r) => r.areaPrivativaAcessoria,
    true,
  ),
  numCol(
    "colD",
    "D — Área priv. total",
    "areaPrivativaTotal",
    (r) => r.areaPrivativaTotal,
    true,
  ),
  numCol("colE", "E — Área uso comum", "areaUsoComum", (r) => r.areaUsoComum, true),
  numCol("colF", "F — Área real total", "areaRealTotal", (r) => r.areaRealTotal, true),
  numCol(
    "colG",
    "G — Coef. proporcionalidade",
    "coeficienteProporcionalidade",
    (r) => r.coeficienteProporcionalidade,
    true,
  ),
  numCol(
    "colH",
    "H — Qtd. idênticas",
    "quantidadeIdenticas",
    (r) => r.quantidadeIdenticas,
    true,
  ),
  {
    id: "colI",
    label: "I — Observações",
    fieldKey: "observacoes",
    alwaysShow: true,
    wrap: true,
    getValue: (r) => r.observacoes || null,
  },
];

const QIVB1_COLS: TabelaColuna<LinhaUnidadeReal>[] = [
  textCol("designacao", "A — Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol(
    "colB",
    "B — Área priv. principal",
    "areaPrivativaPrincipal",
    (r) => r.areaPrivativaPrincipal,
    true,
  ),
  numCol(
    "colC",
    "C — Área priv. acessória",
    "areaPrivativaAcessoria",
    (r) => r.areaPrivativaAcessoria,
    true,
  ),
  numCol(
    "colD",
    "D — Área priv. total",
    "areaPrivativaTotal",
    (r) => r.areaPrivativaTotal,
    true,
  ),
  numCol("colE", "E — Área uso comum", "areaUsoComum", (r) => r.areaUsoComum, true),
  numCol("colF", "F — Área real total", "areaRealTotal", (r) => r.areaRealTotal, true),
  numCol(
    "colG",
    "G — Terreno exclusivo",
    "areaTerrenoExclusivo",
    (r) => r.areaTerrenoExclusivo ?? null,
    true,
  ),
  numCol(
    "colH",
    "H — Terreno comum (prop.)",
    "areaTerrenoComum",
    (r) => r.areaTerrenoComum ?? null,
    true,
  ),
  numCol(
    "colI",
    "I — Coef. proporcionalidade",
    "coeficienteProporcionalidade",
    (r) => r.coeficienteProporcionalidade,
    true,
  ),
  numCol(
    "colJ",
    "J — Coef. terreno",
    "coeficienteTerreno",
    (r) => r.coeficienteTerreno ?? null,
    true,
  ),
  numCol(
    "colQtd",
    "Qtd. idênticas",
    "quantidadeIdenticas",
    (r) => r.quantidadeIdenticas,
    true,
  ),
  {
    id: "observacoes",
    label: "Observações",
    fieldKey: "observacoes",
    alwaysShow: true,
    wrap: true,
    getValue: (r) => r.observacoes || null,
  },
];

function buildQivbColumns(quadro: QuadroIVB): TabelaColuna<LinhaUnidadeReal>[] {
  return quadro.variante === "b1" ? QIVB1_COLS : QIVB_COLS;
}

function buildResumoCols(labels: ConfrontacaoLabels): TabelaColuna<LinhaResumo>[] {
  return [
    textCol("designacao", "Unidade", (r) => r.designacao, true, false, true),
    textCol("bloco", "Bloco / Torre", (r) => r.bloco),
    numCol(
      "areaPrivPrincipal",
      "Área priv. principal",
      "areaPrivativaPrincipal",
      (r) => r.areaPrivativaPrincipal,
    ),
    numCol(
      "areaPrivAcess",
      "Área priv. acessória",
      "areaPrivativaAcessoria",
      (r) => r.areaPrivativaAcessoria,
    ),
    numCol("areaComum", "Área comum", "areaComum", (r) => r.areaComum),
    numCol("areaTotal", "Área total", "areaTotal", (r) => r.areaTotal),
    numCol(
      "fracaoPredial",
      "Fração predial",
      "fracaoPredial",
      (r) => r.fracaoPredial,
    ),
    numCol(
      "fracaoTerrenoPct",
      "Fração de terreno (%)",
      "fracaoTerrenoPercentual",
      (r) => r.fracaoTerrenoPercentual,
    ),
    numCol(
      "fracaoTerrenoM2",
      "Fração de terreno (m²)",
      "fracaoTerrenoM2",
      (r) => r.fracaoTerrenoM2,
    ),
    numCol("valor", "Valor unidade (R$)", "valorUnidade", (r) => r.valorUnidade),
    {
      id: "confNorte",
      label: labels.norte,
      fieldKey: "confrontacaoNorte",
      wrap: true,
      getValue: (r) => r.confrontacaoNorte || null,
    },
    {
      id: "confSul",
      label: labels.sul,
      fieldKey: "confrontacaoSul",
      wrap: true,
      getValue: (r) => r.confrontacaoSul || null,
    },
    {
      id: "confLeste",
      label: labels.leste,
      fieldKey: "confrontacaoLeste",
      wrap: true,
      getValue: (r) => r.confrontacaoLeste || null,
    },
    {
      id: "confOeste",
      label: labels.oeste,
      fieldKey: "confrontacaoOeste",
      wrap: true,
      getValue: (r) => r.confrontacaoOeste || null,
    },
  ];
}

interface QivaLinha extends WithFormatDecimals {
  designacao: string;
  bloco: string;
  areaEquivalente: number | null;
  custo: number | null;
  coeficienteProporcionalidade: number | null;
  quantidadeIdenticas: number | null;
}

const QIVA_COLS: TabelaColuna<QivaLinha>[] = [
  textCol("designacao", "Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol("areaEquiv", "Área equivalente", "areaEquivalente", (r) => r.areaEquivalente),
  numCol("custo", "Custo", "custo", (r) => r.custo),
  numCol("coef", "Coef. proporcionalidade", "coeficienteProporcionalidade", (r) => r.coeficienteProporcionalidade),
  numCol("qtd", "Qtd. idênticas", "quantidadeIdenticas", (r) => r.quantidadeIdenticas),
];

const QVI_COLS: TabelaColuna<LinhaEquipamento>[] = [
  textCol("equipamento", "Equipamento", (r) => r.equipamento, true),
  textCol("tipo", "Tipo / Marca", (r) => r.tipoMarca, false, false, false, "tipoMarca"),
  textCol("acabamento", "Acabamento", (r) => r.acabamento),
];

const ACABAMENTO_COLS: TabelaColuna<LinhaAcabamento>[] = [
  textCol("dependencia", "DEPENDÊNCIAS", (r) => r.dependencia, true, false, true),
  textCol("pisoRev", "Revestimento", (r) => r.pisoRevestimento, false, false, false, "pisoRevestimento"),
  textCol("pisoAcab", "Acabamento", (r) => r.pisoAcabamento, false, false, false, "pisoAcabamento"),
  textCol("pisoSoleira", "Soleira", (r) => r.pisoSoleira),
  textCol("paredeRev", "Revestimento", (r) => r.paredeRevestimento, false, false, false, "paredeRevestimento"),
  textCol("paredeAcab", "Acabamento", (r) => r.paredeAcabamento, false, false, false, "paredeAcabamento"),
  textCol("paredeRodape", "Rodapé", (r) => r.paredeRodape),
  textCol("tetoRev", "Revestimento", (r) => r.tetoRevestimento, false, false, false, "tetoRevestimento"),
  textCol("tetoAcab", "Acabamento", (r) => r.tetoAcabamento, false, false, false, "tetoAcabamento"),
  textCol("peitoril", "Peitoril", (r) => r.peitoril),
];

export interface QuadroTabelaViewModel {
  colunas: TabelaColuna<unknown>[];
  linhas: unknown[];
  filtroFn: (row: unknown, filtro: string) => boolean;
}

export function buildQuadroTabelaView(quadro: QuadroExtraido): QuadroTabelaViewModel | null {
  if (quadro.id === "qi" || quadro.id === "qcomp") {
    const linhas = quadro.linhas as LinhaPavimento[];
    const allCols = buildPavimentoColumns(quadro.id === "qcomp");
    return {
      // Grade NBR fixa (col. 2–18 + qtd.): cabeçalho agrupado depende de todas as colunas.
      colunas: allCols as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaPavimento).pavimento.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qii") {
    const linhas = quadro.linhas as LinhaUnidadeArea[];
    return {
      colunas: QII_COLS as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaUnidadeArea).designacao.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qivb") {
    const linhas = quadro.linhas as LinhaUnidadeReal[];
    const allCols = buildQivbColumns(quadro);
    return {
      colunas: filterColumnsWithData(linhas, allCols) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaUnidadeReal).designacao.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "resumo") {
    const resumo = quadro as QuadroResumo;
    const linhas = resumo.linhas;
    const allCols = buildResumoCols(resumo.confrontacaoLabels);
    return {
      colunas: filterColumnsWithData(linhas, allCols) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaResumo).designacao.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qiva") {
    const linhas = quadro.linhas;
    return {
      colunas: filterColumnsWithData(linhas, QIVA_COLS) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as QivaLinha).designacao.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qvi") {
    const linhas = quadro.linhas as LinhaEquipamento[];
    return {
      colunas: filterColumnsWithData(linhas, QVI_COLS) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaEquipamento).equipamento.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qvii" || quadro.id === "qviii") {
    const linhas = quadro.linhas as LinhaAcabamento[];
    const linhasComDados = linhas.filter((l) => !l.isSecao);
    return {
      colunas: filterColumnsWithData(linhasComDados, ACABAMENTO_COLS) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaAcabamento).dependencia.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  return null;
}
