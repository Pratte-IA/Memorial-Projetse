import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { LinhaAcabamento, QuadroExtraido } from "../types";
import { QuadroStepLayout } from "./quadro-step-layout";
import {
  buildQuadroTabelaView,
  formatCellValue,
  getStickyColumnStyle,
  type StickyColumnStyle,
  type TabelaColuna,
} from "./quadro-tabela-columns";
import { GroupedTableHeader } from "./grouped-table-header";
import { usesGroupedHeader } from "./quadro-grouped-header";

const PAGE_SIZE = 15;

interface QuadroTabelaStepProps {
  quadro: QuadroExtraido;
  alertas: import("../types").AlertaValidacao[];
  onChange?: (quadro: QuadroExtraido) => void;
  onIrParaQuadro?: (quadroId: import("../types").QuadroId) => void;
}

function numOrDash(
  value: number | null | undefined,
  decimals?: number,
): string {
  if (value === null || value === undefined) return "—";
  return formatCellValue(value, true, decimals);
}

function stickyClassNames(isHeader: boolean, isLastSticky: boolean): string {
  return [
    "sticky z-10 bg-card",
    isHeader ? "z-20 bg-muted/40" : "group-hover:bg-muted/50",
    isLastSticky ? "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] border-r border-border/60" : "",
  ].join(" ");
}

function textColumnClassNames(col: TabelaColuna<unknown>, sticky: StickyColumnStyle | null): string {
  if (sticky) return "";
  if (col.wrap) {
    return "whitespace-normal break-words align-top min-w-[12rem] max-w-[min(32rem,55vw)]";
  }
  if (col.truncate) return "max-w-[200px] truncate";
  return "";
}

export function QuadroTabelaStep({ quadro, alertas, onIrParaQuadro }: QuadroTabelaStepProps) {
  const [page, setPage] = useState(0);
  const [filtro, setFiltro] = useState("");

  const view = buildQuadroTabelaView(quadro);

  const { colunas, linhas, totalPages } = useMemo(() => {
    if (!view) return { colunas: [], linhas: [], totalPages: 1 };

    const needle = filtro.toLowerCase();
    const filtered = view.linhas.filter((row) =>
      needle ? view.filtroFn(row, needle) : true,
    );

    return {
      colunas: view.colunas,
      linhas: filtered,
      totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    };
  }, [view, filtro]);

  const pageRows = linhas.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const groupedHeader = usesGroupedHeader(quadro.id);

  return (
    <QuadroStepLayout
      titulo={quadro.titulo}
      descricao={`${linhas.length} registro(s). Exibindo ${colunas.length} coluna(s) com dados (colunas vazias ou zeradas são omitidas).`}
      alertas={alertas}
      onIrParaQuadro={onIrParaQuadro}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Filtrar por designação..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <span className="text-xs text-muted-foreground ml-auto">
          {linhas.length} registro(s) · {colunas.length} colunas visíveis
        </span>
      </div>

      <div className="rounded-md border border-border overflow-x-auto max-w-full">
        <Table className="[&>div]:overflow-visible">
          {groupedHeader ? (
            <GroupedTableHeader quadroId={quadro.id} colunas={colunas as TabelaColuna<unknown>[]} />
          ) : (
            <TableHeader>
              <TableRow>
                {colunas.map((col, colIndex) => {
                  const colDef = col as TabelaColuna<unknown>;
                  const sticky = getStickyColumnStyle(colunas as TabelaColuna<unknown>[], colIndex);
                  return (
                    <TableHead
                      key={col.id}
                      className={`text-xs ${
                        colDef.wrap ? "whitespace-normal" : "whitespace-nowrap"
                      } ${sticky ? stickyClassNames(true, sticky.isLastSticky) : textColumnClassNames(colDef, null)}`}
                      style={
                        sticky
                          ? {
                              left: sticky.left,
                              minWidth: sticky.minWidth,
                              width: sticky.minWidth,
                            }
                          : undefined
                      }
                    >
                      {col.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {pageRows.map((linha, index) => {
              const acabamentoSecao =
                (quadro.id === "qvii" || quadro.id === "qviii") &&
                (linha as LinhaAcabamento).isSecao;

              if (acabamentoSecao) {
                return (
                  <TableRow key={index} className="bg-muted/30 hover:bg-muted/40">
                    <TableCell
                      colSpan={colunas.length}
                      className="text-xs font-semibold text-foreground border-b border-border/70 py-2 px-3 underline decoration-muted-foreground/50 underline-offset-2"
                    >
                      {(linha as LinhaAcabamento).dependencia}
                    </TableCell>
                  </TableRow>
                );
              }

              return (
              <TableRow key={index} className="group">
                {colunas.map((col, colIndex) => {
                  const colDef = col as TabelaColuna<unknown>;
                  const raw = colDef.getValue(linha);
                  const decimals = colDef.getDecimals?.(linha);
                  const display = colDef.mono
                    ? formatCellValue(raw, true, decimals)
                    : formatCellValue(raw, false, decimals);
                  const sticky = getStickyColumnStyle(colunas as TabelaColuna<unknown>[], colIndex);

                  return (
                    <TableCell
                      key={col.id}
                      className={`text-xs ${colDef.mono ? "text-mono-tabular" : ""} ${textColumnClassNames(
                        colDef,
                        sticky,
                      )} ${colDef.alwaysShow || colDef.sticky ? "font-medium" : ""} ${
                        sticky ? stickyClassNames(false, sticky.isLastSticky) : ""
                      }`}
                      style={
                        sticky
                          ? { left: sticky.left, minWidth: sticky.minWidth, width: sticky.minWidth }
                          : undefined
                      }
                    >
                      {display}
                    </TableCell>
                  );
                })}
              </TableRow>
              );
            })}
            {!pageRows.length && (
              <TableRow>
                <TableCell
                  colSpan={colunas.length || 1}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}

      {(quadro.id === "qi" || quadro.id === "qcomp") && "totais" in quadro && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-sm">
          {quadro.totais.areaRealGlobal !== null && quadro.totais.areaRealGlobal !== 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Área real global</p>
              <p className="font-medium text-mono-tabular">
                {numOrDash(quadro.totais.areaRealGlobal)}
              </p>
            </div>
          )}
          {quadro.totais.areaEquivalenteGlobal !== null &&
            quadro.totais.areaEquivalenteGlobal !== 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Área equivalente global</p>
                <p className="font-medium text-mono-tabular">
                  {numOrDash(quadro.totais.areaEquivalenteGlobal)}
                </p>
              </div>
            )}
        </div>
      )}
    </QuadroStepLayout>
  );
}
