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
  QuadroResumo,
  WithFormatDecimals,
} from "../types";

export interface TabelaColuna<T> {
  id: string;
  label: string;
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

/** Largura mínima (px) das colunas fixas para empilhar `left` corretamente. */
export const STICKY_COLUMN_WIDTH_PX: Record<string, number> = {
  torre: 88,
  pavimento: 120,
  designacao: 160,
  equipamento: 140,
  dependencia: 140,
};

export interface StickyColumnStyle {
  left: number;
  minWidth: number;
  isLastSticky: boolean;
}

export function getStickyColumnStyle(
  colunas: TabelaColuna<unknown>[],
  index: number,
): StickyColumnStyle | null {
  const col = colunas[index];
  if (!col.sticky) return null;

  let left = 0;
  for (let i = 0; i < index; i++) {
    if (colunas[i].sticky) {
      left += STICKY_COLUMN_WIDTH_PX[colunas[i].id] ?? 100;
    }
  }

  const minWidth = STICKY_COLUMN_WIDTH_PX[col.id] ?? 100;
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
): TabelaColuna<T> {
  return {
    id,
    label,
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
];

const QIVB_COLS: TabelaColuna<LinhaUnidadeReal>[] = [
  textCol("designacao", "A — Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol("colB", "B — Área priv. principal", "areaPrivativaPrincipal", (r) => r.areaPrivativaPrincipal),
  numCol("colC", "C — Área priv. acessória", "areaPrivativaAcessoria", (r) => r.areaPrivativaAcessoria),
  numCol("colD", "D — Área priv. total", "areaPrivativaTotal", (r) => r.areaPrivativaTotal),
  numCol("colE", "E — Área uso comum", "areaUsoComum", (r) => r.areaUsoComum),
  numCol("colF", "F — Área real total", "areaRealTotal", (r) => r.areaRealTotal),
  numCol("colG", "G — Coef. proporcionalidade", "coeficienteProporcionalidade", (r) => r.coeficienteProporcionalidade),
  numCol("colQtd", "Qtd. idênticas", "quantidadeIdenticas", (r) => r.quantidadeIdenticas),
  {
    id: "observacoes",
    label: "Observações",
    wrap: true,
    getValue: (r) => r.observacoes || null,
  },
];

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
      wrap: true,
      getValue: (r) => r.confrontacaoNorte || null,
    },
    {
      id: "confSul",
      label: labels.sul,
      wrap: true,
      getValue: (r) => r.confrontacaoSul || null,
    },
    {
      id: "confLeste",
      label: labels.leste,
      wrap: true,
      getValue: (r) => r.confrontacaoLeste || null,
    },
    {
      id: "confOeste",
      label: labels.oeste,
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
  textCol("tipo", "Tipo / Marca", (r) => r.tipoMarca),
  textCol("acabamento", "Acabamento", (r) => r.acabamento),
];

const ACABAMENTO_COLS: TabelaColuna<LinhaAcabamento>[] = [
  textCol("dependencia", "DEPENDÊNCIAS", (r) => r.dependencia, true, false, true),
  textCol("pisoRev", "Revestimento", (r) => r.pisoRevestimento),
  textCol("pisoAcab", "Acabamento", (r) => r.pisoAcabamento),
  textCol("pisoSoleira", "Soleira", (r) => r.pisoSoleira),
  textCol("paredeRev", "Revestimento", (r) => r.paredeRevestimento),
  textCol("paredeAcab", "Acabamento", (r) => r.paredeAcabamento),
  textCol("paredeRodape", "Rodapé", (r) => r.paredeRodape),
  textCol("tetoRev", "Revestimento", (r) => r.tetoRevestimento),
  textCol("tetoAcab", "Acabamento", (r) => r.tetoAcabamento),
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
      colunas: filterColumnsWithData(linhas, allCols) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaPavimento).pavimento.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qii") {
    const linhas = quadro.linhas as LinhaUnidadeArea[];
    return {
      colunas: filterColumnsWithData(linhas, QII_COLS) as TabelaColuna<unknown>[],
      linhas,
      filtroFn: (row, filtro) =>
        (row as LinhaUnidadeArea).designacao.toLowerCase().includes(filtro.toLowerCase()),
    };
  }

  if (quadro.id === "qivb") {
    const linhas = quadro.linhas as LinhaUnidadeReal[];
    return {
      colunas: filterColumnsWithData(linhas, QIVB_COLS) as TabelaColuna<unknown>[],
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
