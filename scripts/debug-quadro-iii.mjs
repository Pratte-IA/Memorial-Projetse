import * as fs from "fs";
import * as XLSX from "xlsx";

const path =
  process.argv[2] ||
  "/Users/michelifranceisfaorogiraldi/Downloads/ABNT NBR 12721-2006 - SF Encanto Rev01 22.07.2024.xlsx";

const buf = fs.readFileSync(path);
const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

function findSheetName(sheetNames, matchers) {
  for (const matcher of matchers) {
    for (const name of sheetNames) {
      const normalized = name.toUpperCase().trim();
      if (typeof matcher === "string") {
        if (normalized === matcher.toUpperCase() || normalized.includes(matcher.toUpperCase())) {
          return name;
        }
      } else if (matcher.test(name)) {
        return name;
      }
    }
  }
  return undefined;
}

function sheetToMatrix(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
  if (!sheet["!ref"]) return matrix;
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
  return matrix;
}

const sheetName = findSheetName(wb.SheetNames, [/^QUADRO III$/i]);
console.log("Sheet:", sheetName);
const sheet = wb.Sheets[sheetName];
const matrix = sheetToMatrix(wb, sheetName);

// Dump rows that look like numbered items
for (let r = 0; r < matrix.length; r++) {
  const row = matrix[r] ?? [];
  const first = String(row[0] ?? "").trim();
  const joined = row.map((c) => String(c ?? "").trim()).filter(Boolean).join(" | ");
  if (/^\d+(\.\d+)*/.test(first) || /^\d+(\.\d+)*\s/.test(joined.slice(0, 20))) {
    console.log(`R${r}: ${joined.slice(0, 200)}`);
  }
}

// Also dump rows with R$
for (let r = 0; r < matrix.length; r++) {
  const row = matrix[r] ?? [];
  const hasMoney = row.some((c) => String(c ?? "").includes("R$"));
  if (hasMoney) {
    const joined = row.map((c) => String(c ?? "").trim()).filter(Boolean).join(" | ");
    if (joined.length > 5) console.log(`$$ R${r}: ${joined.slice(0, 250)}`);
  }
}
