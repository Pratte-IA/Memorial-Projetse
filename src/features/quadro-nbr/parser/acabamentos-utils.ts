import type { LinhaAcabamento } from "../types";
import { cellStr, type CellMatrix } from "./sheet-utils";

/** Colunas de acabamento no template NBR (piso, parede, teto, peitoril, etc.). */
const ACABAMENTO_DATA_COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function rowHasAcabamentoData(row: CellMatrix[number]): boolean {
  return ACABAMENTO_DATA_COLS.some((col) => cellStr(row[col]).length > 0);
}

/** Linha só com rótulo de grupo (sublinhado no Excel), sem revestimentos/acabamentos. */
export function isAcabamentoSecaoRow(row: CellMatrix[number], dependencia: string): boolean {
  if (!dependencia.trim()) return false;
  return !rowHasAcabamentoData(row);
}

export function parseLinhaAcabamentoFromRow(row: CellMatrix[number]): LinhaAcabamento | null {
  const dependencia = cellStr(row[0]);
  if (!dependencia || dependencia.toUpperCase() === "DEPENDÊNCIAS") return null;

  const isSecao = isAcabamentoSecaoRow(row, dependencia);

  return {
    dependencia,
    isSecao,
    pisoRevestimento: isSecao ? "" : cellStr(row[2]),
    pisoAcabamento: isSecao ? "" : cellStr(row[3]),
    pisoSoleira: isSecao ? "" : cellStr(row[4]),
    paredeRevestimento: isSecao ? "" : cellStr(row[5]),
    paredeAcabamento: isSecao ? "" : cellStr(row[6]),
    paredeRodape: isSecao ? "" : cellStr(row[7]),
    tetoRevestimento: isSecao ? "" : cellStr(row[8]),
    tetoAcabamento: isSecao ? "" : cellStr(row[9]),
    peitoril: isSecao ? "" : cellStr(row[10]),
  };
}
