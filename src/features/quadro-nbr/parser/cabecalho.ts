import type { CabecalhoPadrao } from "../types";
import { cellStr, findLabelValue, type CellMatrix } from "./sheet-utils";

export function parseCabecalhoPadrao(matrix: CellMatrix): CabecalhoPadrao {
  const empreendimento = findLabelValue(matrix, "empreendimento:")?.valor ?? "";
  const logradouro = findLabelValue(matrix, "logradouro:")?.valor ?? "";
  const loteQuadra = findLabelValue(matrix, "lote / quadra:")?.valor ?? "";
  const municipioUf = findLabelValue(matrix, "município / uf:")?.valor ?? "";
  const incorporadorNome = findLabelValue(matrix, "nome:")?.valor ?? "";

  const socios: string[] = [];
  for (const row of matrix.slice(0, 12)) {
    for (let c = 0; c < (row?.length ?? 0); c++) {
      if (!cellStr(row[c]).toLowerCase().includes("sócio administrador")) continue;
      for (let k = c + 1; k < (row?.length ?? 0); k++) {
        const nome = cellStr(row[k]);
        if (nome && !nome.toLowerCase().includes("sócio")) {
          socios.push(nome);
          break;
        }
      }
    }
  }

  const responsavelNome =
    findLabelValue(matrix, "registro no crea:") !== null
      ? findNthLabelBefore(matrix, "registro no crea:", "nome:")
      : "";
  const responsavelCrea = findLabelValue(matrix, "registro no crea:")?.valor ?? "";

  return {
    empreendimento,
    logradouro,
    loteQuadra,
    municipioUf,
    incorporadorNome,
    incorporadorSocios: socios,
    responsavelNome,
    responsavelCrea,
  };
}

function findNthLabelBefore(matrix: CellMatrix, anchor: string, label: string): string {
  const anchorIdx = findLabelValue(matrix, anchor);
  if (!anchorIdx) return "";

  for (let r = anchorIdx.row; r >= Math.max(0, anchorIdx.row - 3); r--) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (!cellStr(row[c]).toLowerCase().includes(label)) continue;
      for (let k = c + 1; k < row.length; k++) {
        const val = cellStr(row[k]);
        if (val) return val;
      }
    }
  }

  return "";
}
