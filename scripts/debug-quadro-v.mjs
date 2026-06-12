import * as fs from "fs";
import * as XLSX from "xlsx";

const path =
  process.argv[2] ||
  "/Users/michelifranceisfaorogiraldi/Downloads/ABNT NBR 12721-2006 - SF Encanto Rev01 22.07.2024.xlsx";

const wb = XLSX.read(fs.readFileSync(path), { type: "buffer", cellDates: true });
const sheetName = wb.SheetNames.find((n) => /^QUADRO V$/i.test(n.trim()));
const sheet = wb.Sheets[sheetName];
const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
if (sheet["!ref"]) {
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  for (let r = range.s.r; r <= range.e.r; r++) {
    const rowIdx = r - range.s.r;
    if (!matrix[rowIdx]) matrix[rowIdx] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const colIdx = c - range.s.c;
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (cell?.w != null && cell.w !== "") matrix[rowIdx][colIdx] = cell.w;
    }
  }
}

function cellStr(v) {
  if (v == null) return "";
  return String(v).trim();
}

function findRowIndex(matrix, predicate) {
  return matrix.findIndex(predicate);
}

function findSameRowValue(row, labelCol, preferCol) {
  if (preferCol !== undefined) {
    const preferred = cellStr(row[preferCol]);
    if (preferred) return { valor: preferred, col: preferCol };
  }
  for (let k = row.length - 1; k > labelCol; k--) {
    const val = cellStr(row[k]);
    if (val) return { valor: val, col: k };
  }
  return null;
}

function readQuadroVValue(row, labelCol = 0) {
  const preferred = findSameRowValue(row, labelCol, 4);
  if (preferred?.valor) return preferred.valor;
  for (const col of [4, 2, 3, 5, 1]) {
    const val = cellStr(row[col]);
    if (val && !val.endsWith(":")) return val;
  }
  return null;
}

const startRow = findRowIndex(matrix, (row) => /d\)\s*explicitação/i.test(cellStr(row[0])));
console.log("startRow d):", startRow);
let idx = 0;
for (let r = startRow; r < matrix.length; r++) {
  const row = matrix[r] ?? [];
  const col0 = cellStr(row[0]);
  if (r > startRow) {
    if (/^e\)\s/i.test(col0) || /pavimentos especiais/i.test(col0)) break;
    if (col0 && /^[a-g]\)\s/i.test(col0)) break;
  }
  const val = readQuadroVValue(row, 0);
  if (!val) continue;
  idx++;
  console.log(`explicitacao_${idx}:`, val.slice(0, 90) + (val.length > 90 ? "..." : ""));
}
