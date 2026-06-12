import type { QuadroId } from "../types";
import {
  getStickyColumnStyle,
  STICKY_COLUMN_WIDTH_PX,
  type TabelaColuna,
} from "./quadro-tabela-columns";

export interface ColHeaderMeta {
  num: string;
  short: string;
  section: string;
  group?: string;
}

export interface GroupedHeaderCell {
  label: string;
  colspan: number;
  rowspan: number;
  colId?: string;
  columnIndex?: number;
  sticky?: boolean;
  isLastSticky?: boolean;
  /** section = grupo (PISOS, CONFRONTAÇÕES); column = coluna com rowspan; leaf = subcoluna. */
  tier?: "section" | "column" | "leaf" | "group";
}

const SECTION_LABELS: Record<string, string> = {
  nao_prop: "Áreas de divisão não proporcional",
  prop: "Áreas de divisão proporcional",
  pavimento: "Área do pavimento",
  quantidade: "Quantidade (pav. idênticos)",
  unidade_areas: "Áreas da unidade autônoma",
  coef_area: "Coeficiente e área da unidade",
};

const GROUP_LABELS: Record<string, string> = {
  privativa: "Área privativa",
  uso_comum_np: "Área de uso comum",
  uso_comum_p: "Áreas de uso comum",
};

export const PAVIMENTO_HEADER_META: Record<string, ColHeaderMeta> = {
  col2: { num: "2", short: "Coberta padrão", section: "nao_prop", group: "privativa" },
  col3: { num: "3", short: "Real", section: "nao_prop", group: "privativa" },
  col4: { num: "4", short: "Equivalente", section: "nao_prop", group: "privativa" },
  col5: { num: "5", short: "Real (2+3)", section: "nao_prop", group: "privativa" },
  col6: { num: "6", short: "Equiv. padrão (2+4)", section: "nao_prop", group: "privativa" },
  col7: { num: "7", short: "Coberta padrão", section: "nao_prop", group: "uso_comum_np" },
  col8: { num: "8", short: "Real", section: "nao_prop", group: "uso_comum_np" },
  col9: { num: "9", short: "Equivalente", section: "nao_prop", group: "uso_comum_np" },
  col10: { num: "10", short: "Real (7+8)", section: "nao_prop", group: "uso_comum_np" },
  col11: { num: "11", short: "Equiv. padrão (7+9)", section: "nao_prop", group: "uso_comum_np" },
  col12: { num: "12", short: "Coberta padrão", section: "prop", group: "uso_comum_p" },
  col13: { num: "13", short: "Real", section: "prop", group: "uso_comum_p" },
  col14: { num: "14", short: "Equivalente", section: "prop", group: "uso_comum_p" },
  col15: { num: "15", short: "Real (12+13)", section: "prop", group: "uso_comum_p" },
  col16: { num: "16", short: "Equiv. padrão (12+14)", section: "prop", group: "uso_comum_p" },
  col17: { num: "17", short: "Real (5+10+15)", section: "pavimento" },
  col18: { num: "18", short: "Equiv. padrão (6+11+16)", section: "pavimento" },
  colQtd: { num: "", short: "Nº idênticos", section: "quantidade" },
};

export const ACABAMENTO_HEADER_META: Record<string, ColHeaderMeta> = {
  pisoRev: { num: "", short: "Revestimento", section: "pisos" },
  pisoAcab: { num: "", short: "Acabamento", section: "pisos" },
  pisoSoleira: { num: "", short: "Soleira", section: "pisos" },
  paredeRev: { num: "", short: "Revestimento", section: "paredes" },
  paredeAcab: { num: "", short: "Acabamento", section: "paredes" },
  paredeRodape: { num: "", short: "Rodapé", section: "paredes" },
  tetoRev: { num: "", short: "Revestimento", section: "tetos" },
  tetoAcab: { num: "", short: "Acabamento", section: "tetos" },
  peitoril: { num: "", short: "Peitoril", section: "peitoris" },
};

export const ACABAMENTO_SECTION_LABELS: Record<string, string> = {
  pisos: "PISOS",
  paredes: "PAREDES",
  tetos: "TETOS",
  peitoris: "PEITORIS",
};

export const RESUMO_HEADER_META: Record<string, ColHeaderMeta> = {
  confNorte: { num: "", short: "", section: "confrontacoes" },
  confSul: { num: "", short: "", section: "confrontacoes" },
  confLeste: { num: "", short: "", section: "confrontacoes" },
  confOeste: { num: "", short: "", section: "confrontacoes" },
};

export const RESUMO_SECTION_LABELS: Record<string, string> = {
  confrontacoes: "CONFRONTAÇÕES",
};

export const QII_HEADER_META: Record<string, ColHeaderMeta> = {
  col20: { num: "20", short: "Coberta padrão", section: "unidade_areas", group: "privativa" },
  col21: { num: "21", short: "Real", section: "unidade_areas", group: "privativa" },
  col22: { num: "22", short: "Equivalente", section: "unidade_areas", group: "privativa" },
  col23: { num: "23", short: "Real (20+21)", section: "unidade_areas", group: "privativa" },
  col24: { num: "24", short: "Equiv. padrão (20+22)", section: "unidade_areas", group: "privativa" },
  col25: { num: "25", short: "Coberta padrão", section: "unidade_areas", group: "uso_comum_np" },
  col26: { num: "26", short: "Real", section: "unidade_areas", group: "uso_comum_np" },
  col27: { num: "27", short: "Equivalente", section: "unidade_areas", group: "uso_comum_np" },
  col28: { num: "28", short: "Real (25+26)", section: "unidade_areas", group: "uso_comum_np" },
  col29: { num: "29", short: "Equiv. padrão (25+27)", section: "unidade_areas", group: "uso_comum_np" },
  col31: { num: "31", short: "Coef. proporcionalidade", section: "coef_area" },
  col37: { num: "37", short: "Área unidade real", section: "coef_area" },
  col38: { num: "38", short: "Área unidade equiv.", section: "coef_area" },
};

export function usesGroupedHeader(quadroId: QuadroId): boolean {
  return (
    quadroId === "qi" ||
    quadroId === "qcomp" ||
    quadroId === "qii" ||
    quadroId === "qvii" ||
    quadroId === "qviii" ||
    quadroId === "resumo"
  );
}

function getMetaMap(quadroId: QuadroId): Record<string, ColHeaderMeta> {
  if (quadroId === "qii") return QII_HEADER_META;
  if (quadroId === "qvii" || quadroId === "qviii") return ACABAMENTO_HEADER_META;
  if (quadroId === "resumo") return RESUMO_HEADER_META;
  return PAVIMENTO_HEADER_META;
}

function getSectionLabels(quadroId: QuadroId): Record<string, string> {
  if (quadroId === "qvii" || quadroId === "qviii") return ACABAMENTO_SECTION_LABELS;
  if (quadroId === "resumo") return RESUMO_SECTION_LABELS;
  return SECTION_LABELS;
}

export function isResumoQuadro(quadroId: QuadroId): boolean {
  return quadroId === "resumo";
}

export function isAcabamentoQuadro(quadroId: QuadroId): boolean {
  return quadroId === "qvii" || quadroId === "qviii";
}

function sectionColCount(enriched: EnrichedCol[], sectionKey: string): number {
  return enriched.filter((e) => !e.col.sticky && e.meta?.section === sectionKey).length;
}

function leafCoveredBySectionRow(enriched: EnrichedCol[], meta: ColHeaderMeta): boolean {
  const count = sectionColCount(enriched, meta.section);
  return count === 1 && !meta.group;
}

interface EnrichedCol {
  col: TabelaColuna<unknown>;
  index: number;
  meta?: ColHeaderMeta;
}

function spanCells(
  items: EnrichedCol[],
  level: "section" | "group",
  labels: Record<string, string>,
): GroupedHeaderCell[] {
  const cells: GroupedHeaderCell[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    if (item.col.sticky) {
      i++;
      continue;
    }

    if (!item.meta) {
      i++;
      continue;
    }

    const key =
      level === "section" ? item.meta.section : item.meta.group ?? item.meta.section;

    if (level === "group" && !item.meta.group) {
      i++;
      continue;
    }

    let j = i;
    while (j < items.length) {
      const next = items[j];
      if (next.col.sticky || !next.meta) break;
      const nextKey =
        level === "section" ? next.meta.section : next.meta.group ?? next.meta.section;
      if (nextKey !== key) break;
      j++;
    }

    const count = j - i;
    const label = labels[key] ?? key;
    cells.push({ label, colspan: count, rowspan: 1, tier: "group" });
    i = j;
  }

  return cells;
}

export function buildGroupedHeaderRows(
  quadroId: QuadroId,
  colunas: TabelaColuna<unknown>[],
): GroupedHeaderCell[][] {
  const metaMap = getMetaMap(quadroId);
  const sectionLabels = getSectionLabels(quadroId);
  const enriched: EnrichedCol[] = colunas.map((col, index) => ({
    col,
    index,
    meta: metaMap[col.id],
  }));

  const groupCells = spanCells(enriched, "group", GROUP_LABELS);
  const headerRowCount = groupCells.length > 0 ? 3 : 2;
  const sectionRowspanWhenNoGroup = headerRowCount - 1;

  const stickyCells: GroupedHeaderCell[] = [];
  for (const item of enriched) {
    if (!item.col.sticky) break;
    const stickyStyle = getStickyColumnStyle(colunas, item.index);
    stickyCells.push({
      label: item.col.label,
      colspan: 1,
      rowspan: headerRowCount,
      colId: item.col.id,
      columnIndex: item.index,
      sticky: true,
      isLastSticky: stickyStyle?.isLastSticky ?? false,
    });
  }

  const leafCells: GroupedHeaderCell[] = enriched
    .filter((item) => !item.col.sticky && item.meta)
    .filter((item) => item.meta && !leafCoveredBySectionRow(enriched, item.meta))
    .map((item) => {
      const label = item.meta
        ? item.meta.num
          ? `${item.meta.num} — ${item.meta.short}`
          : item.meta.short || item.col.label
        : item.col.label;

      return {
        label,
        colspan: 1,
        rowspan: 1,
        colId: item.col.id,
        columnIndex: item.index,
        tier: "leaf" as const,
      };
    });

  const sectionRow: GroupedHeaderCell[] = [...stickyCells];
  let dataIdx = 0;
  while (dataIdx < enriched.length) {
    const item = enriched[dataIdx];
    if (item.col.sticky) {
      dataIdx++;
      continue;
    }
    if (!item.meta) {
      sectionRow.push({
        label: item.col.label,
        colspan: 1,
        rowspan: leafCells.length > 0 ? headerRowCount : 1,
        tier: "column",
      });
      dataIdx++;
      continue;
    }

    const sectionKey = item.meta.section;
    let j = dataIdx;
    while (j < enriched.length) {
      const next = enriched[j];
      if (next.col.sticky || !next.meta || next.meta.section !== sectionKey) break;
      j++;
    }
    const count = j - dataIdx;
    const hasGroup = enriched.slice(dataIdx, j).some((e) => e.meta?.group);
    const singleColSection = count === 1 && !hasGroup;
    sectionRow.push({
      label: sectionLabels[sectionKey] ?? sectionKey,
      colspan: count,
      rowspan: hasGroup ? 1 : singleColSection ? sectionRowspanWhenNoGroup : 1,
      tier: "section",
    });
    dataIdx = j;
  }

  const rows: GroupedHeaderCell[][] = [sectionRow];
  if (groupCells.length > 0) rows.push(groupCells);
  if (leafCells.length > 0) rows.push(leafCells);

  return rows;
}

export function getHeaderStickyStyle(
  colunas: TabelaColuna<unknown>[],
  columnIndex: number,
): { left: number; minWidth: number } | null {
  const sticky = getStickyColumnStyle(colunas, columnIndex);
  if (!sticky) return null;
  return { left: sticky.left, minWidth: sticky.minWidth };
}

export const DEFAULT_DATA_COL_MIN_WIDTH = 96;

export function getDataColumnMinWidth(colId: string): number {
  return STICKY_COLUMN_WIDTH_PX[colId] ?? DEFAULT_DATA_COL_MIN_WIDTH;
}
