import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buildGroupedHeaderRows,
  getHeaderStickyStyle,
  isAcabamentoQuadro,
  isResumoQuadro,
  type GroupedHeaderCell,
} from "./quadro-grouped-header";
import {
  getColumnWidthStyle,
  getStickyColumnStyle,
  type ColumnWidthMap,
  type TabelaColuna,
} from "./quadro-tabela-columns";
import type { QuadroId } from "../types";

function stickyHeaderClass(isLastSticky: boolean): string {
  return [
    "sticky z-30 bg-muted/50 text-[10px] leading-tight",
    isLastSticky ? "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] border-r border-border/60" : "",
  ].join(" ");
}

function headerCellClass(
  quadroId: QuadroId,
  tier: GroupedHeaderCell["tier"],
  isSectionRow: boolean,
  isLeafRow: boolean,
): string {
  const resolvedTier =
    tier ?? (isSectionRow ? "section" : isLeafRow ? "leaf" : "group");

  if (isAcabamentoQuadro(quadroId) || isResumoQuadro(quadroId)) {
    if (resolvedTier === "section") {
      return "text-[10px] leading-tight text-center bg-muted/40 font-bold uppercase tracking-wide";
    }
    if (resolvedTier === "column") {
      return "text-[10px] leading-tight whitespace-nowrap text-center bg-muted/30 font-medium";
    }
    if (resolvedTier === "leaf") {
      return "text-[10px] leading-tight whitespace-nowrap text-center";
    }
    return "text-[10px] leading-tight text-center bg-muted/25 font-medium";
  }

  if (resolvedTier === "section") {
    return "text-[10px] leading-tight text-center bg-muted/30 font-semibold";
  }
  if (resolvedTier === "leaf") return "text-[10px] leading-tight whitespace-nowrap min-w-[96px]";
  return "text-[10px] leading-tight text-center bg-muted/20 font-medium";
}

interface GroupedTableHeaderProps {
  quadroId: QuadroId;
  colunas: TabelaColuna<unknown>[];
  columnWidths?: ColumnWidthMap;
}

export function GroupedTableHeader({ quadroId, colunas, columnWidths }: GroupedTableHeaderProps) {
  const rows = buildGroupedHeaderRows(quadroId, colunas);

  return (
    <TableHeader>
      {rows.map((row, rowIndex) => {
        const isSectionRow = rowIndex === 0;
        const isLeafRow = rowIndex === rows.length - 1;

        return (
          <TableRow key={rowIndex} className="hover:bg-transparent">
            {row.map((cell, cellIndex) => {
              const stickyStyle =
                cell.sticky && cell.columnIndex !== undefined
                  ? getHeaderStickyStyle(colunas, cell.columnIndex, columnWidths)
                  : null;
              const stickyMeta =
                cell.sticky && cell.columnIndex !== undefined
                  ? getStickyColumnStyle(colunas, cell.columnIndex, columnWidths)
                  : null;

              return (
                <TableHead
                  key={`${rowIndex}-${cellIndex}-${cell.label}`}
                  colSpan={cell.colspan}
                  rowSpan={cell.rowspan}
                  className={`h-auto py-1.5 px-2 align-middle font-medium text-muted-foreground border-b border-border/50 ${
                    cell.sticky
                      ? stickyHeaderClass(stickyMeta?.isLastSticky ?? false)
                      : headerCellClass(quadroId, cell.tier, isSectionRow, isLeafRow)
                  }`}
                  style={
                    stickyStyle
                      ? {
                          left: stickyStyle.left,
                          minWidth: stickyStyle.minWidth,
                          width: stickyStyle.minWidth,
                        }
                      : cell.columnIndex !== undefined
                        ? (() => {
                            const col = colunas[cell.columnIndex];
                            if (!col) return undefined;
                            return getColumnWidthStyle(col, null, columnWidths) ?? undefined;
                          })()
                        : undefined
                  }
                >
                  {cell.label}
                </TableHead>
              );
            })}
          </TableRow>
        );
      })}
    </TableHeader>
  );
}
