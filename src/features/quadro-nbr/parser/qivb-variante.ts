import { cellStr, type CellMatrix } from "./sheet-utils";
import type { QuadroIvVariante } from "../types";

/** Detecta Quadro IV B.1 pela aba ou pelo cabeçalho interno da planilha. */
export function detectQivbVariante(sheetName: string, matrix: CellMatrix): QuadroIvVariante {
  const sheet = sheetName.trim();
  if (/QUADRO\s+IV\s*B[\s._-]?[1I]\b/i.test(sheet)) return "b1";
  if (/QUADRO\s+IV\s*B1\b/i.test(sheet)) return "b1";

  const header = matrix
    .slice(0, 35)
    .flat()
    .map((cell) => cellStr(cell))
    .join(" ");

  if (
    /QUADRO\s+IV\s*B[\s._-]?[1I]\b|colunas A a J|terreno de uso exclusivo|área de terreno de uso exclusivo/i.test(
      header,
    )
  ) {
    return "b1";
  }

  return "padrao";
}
