import * as XLSX from "xlsx";
import { fmtNum, formatBrDateDisplay, inferDecimalPlaces } from "@/lib/format";

export type CellMatrix = (string | number | null)[][];

export function readWorkbookFromArrayBuffer(buffer: ArrayBuffer): XLSX.WorkBook {
  return XLSX.read(buffer, { type: "array", cellDates: true });
}

/**
 * Lê a planilha combinando `sheet_to_json` (preenche células mescladas) com `cell.w`
 * (formato visual do Excel, ex.: 2.291,92 em pt-BR).
 */
export function sheetToMatrix(workbook: XLSX.WorkBook, sheetName: string): CellMatrix {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false,
  }) as CellMatrix;

  if (!sheet["!ref"]) return matrix;

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  for (let r = range.s.r; r <= range.e.r; r++) {
    const rowIdx = r - range.s.r;
    if (!matrix[rowIdx]) matrix[rowIdx] = [];

    for (let c = range.s.c; c <= range.e.c; c++) {
      const colIdx = c - range.s.c;
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];

      if (cell?.w != null && cell.w !== "") {
        matrix[rowIdx][colIdx] = cell.w;
        continue;
      }

      const current = matrix[rowIdx][colIdx];
      if (current === null || current === undefined || current === "") {
        if (cell?.t === "n" && typeof cell.v === "number") {
          matrix[rowIdx][colIdx] = cell.v;
        } else if (cell?.v != null && cell.v !== "") {
          matrix[rowIdx][colIdx] = String(cell.v);
        }
      }
    }
  }

  return matrix;
}

export function cellStr(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export interface ParsedNumericCell {
  value: number | null;
  decimals: number | null;
}

/** Conta casas decimais na representação textual da célula (formato BR ou US). */
export function countDecimalPlaces(raw: string): number {
  const cleaned = raw
    .replace(/R\$\s*/gi, "")
    .replace(/m²|m2/gi, "")
    .replace(/%/g, "")
    .trim()
    .replace(/\s/g, "");

  if (!cleaned) return 0;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastDot > lastComma) {
      const fraction = cleaned.split(".")[1] ?? "";
      return fraction.replace(/\D/g, "").length;
    }
    const fraction = cleaned.split(",")[1] ?? "";
    return fraction.replace(/\D/g, "").length;
  }

  if (hasComma) {
    const parts = cleaned.split(",");
    return (parts[parts.length - 1] ?? "").replace(/\D/g, "").length;
  }

  if (hasDot) {
    const parts = cleaned.split(".");
    if (parts.length === 2) {
      if (parts[1].length === 3 && parts[0].length <= 3) return 0;
      return parts[1].replace(/\D/g, "").length;
    }
    return 0;
  }

  return 0;
}

export function cellNumParsed(value: unknown): ParsedNumericCell {
  const raw = cellStr(value);
  if (!raw) return { value: null, decimals: null };
  const parsed = cellNum(value);
  if (parsed === null) return { value: null, decimals: null };
  return { value: parsed, decimals: countDecimalPlaces(raw) };
}

export function cellNum(value: unknown): number | null {
  const raw = cellStr(value);
  if (!raw) return null;

  let normalized = raw
    .replace(/R\$\s*/gi, "")
    .replace(/m²|m2/gi, "")
    .replace(/%/g, "")
    .replace(/\s/g, "");

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    if (lastDot > lastComma) {
      normalized = normalized.replace(/,/g, "");
    } else {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    }
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Converte valores numéricos ao padrão pt-BR (ABNT): ponto para milhar, vírgula para decimal.
 * Ex.: "2,291.92" (US) → "2.291,92" | "2.291,92" (BR) → mantém.
 */
export function normalizeNumericDisplayPtBr(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  const hasM2 = /m²|m2/i.test(trimmed);
  const hasCurrency = /R\$/i.test(trimmed);
  const hasPercent = /%/.test(trimmed);

  const withoutUnits = trimmed
    .replace(/R\$\s*/gi, "")
    .replace(/m²|m2/gi, "")
    .replace(/%/g, "")
    .trim();

  if (/[a-záàâãéêíóôõúç]{2,}/i.test(withoutUnits)) return raw;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(withoutUnits)) return formatBrDateDisplay(withoutUnits);

  const { value, decimals } = cellNumParsed(trimmed);
  if (value === null) return raw;

  const dec = decimals ?? inferDecimalPlaces(value);
  const formatted = fmtNum(value, dec);

  if (hasM2) return `${formatted} m²`;
  if (hasCurrency) return `R$ ${formatted}`;
  if (hasPercent) return `${formatted}%`;
  return formatted;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Verifica se a célula inicia/descreve o item numerado NBR (ex.: "5.1.1", "6.3.4"). */
export function cellMatchesItemNumber(text: string, itemNumber: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (itemNumber === "3") {
    if (/3\.\d+\.\d+/.test(trimmed)) return false;
    return /(?:^|\s)3\.\s/.test(trimmed) && trimmed.length > 10;
  }

  if (itemNumber === "5") {
    return /(?:^|\s)5\.?\s/i.test(trimmed) && /custo básico global/i.test(trimmed);
  }

  if (itemNumber === "7") {
    return /(?:^|\s)7\.?\s/i.test(trimmed) && /1º\s*subtotal|1o\s*subtotal/i.test(trimmed);
  }

  if (itemNumber === "10") {
    return /(?:^|\s)10\.?\s/i.test(trimmed) && /2º\s*subtotal|2o\s*subtotal/i.test(trimmed);
  }

  if (itemNumber === "11") {
    return /(?:^|\s)11\.?\s/i.test(trimmed) && /construtor/i.test(trimmed);
  }

  if (itemNumber === "12") {
    return /(?:^|\s)12\.?\s/i.test(trimmed) && /incorporador/i.test(trimmed);
  }

  if (itemNumber === "13") {
    return /(?:^|\s)13\.?\s/i.test(trimmed) && /custo global da construção/i.test(trimmed);
  }

  const escaped = escapeRegExp(itemNumber);
  const pattern = new RegExp(`(?:^|\\s)${escaped}(?=\\s|(?:\\.(?!\\d))|$|-)`, "i");
  if (!pattern.test(trimmed)) return false;

  // Valores numéricos isolados (ex.: "4.2" m²) não são rótulos de item NBR.
  if (/^\d+([.,]\d+)?$/.test(trimmed)) return false;

  return true;
}

function isPercentOnlyCell(value: string): boolean {
  const cleaned = value.replace(/\s/g, "");
  return /^%?$/.test(cleaned) || /^\d+([.,]\d+)?%$/.test(cleaned);
}

/** Rótulo numerado NBR (ex.: 3.8.1) — não quantidades inteiras como 7 ou 160. */
function isItemNumberCell(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^\d+\.\d+/.test(trimmed);
}

function isBareCurrencyMarker(value: string): boolean {
  return /^R\$\s*=?$/i.test(value.trim());
}

/** Rótulo de unidade monetária (ex.: "R$ por m2 ="), não o valor do CUB. */
export function isCurrencyUnitLabel(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  return (
    /^R\$\s*por\s*m2?\s*=?\s*$/i.test(text) ||
    /^R\$\s*\/\s*m2?\s*=?$/i.test(text) ||
    (text.startsWith("R$") && /por\s*m2/i.test(text) && cellNum(text) === null)
  );
}

function readMoneyAt(row: CellMatrix[number], col: number): { valor: string; col: number } | null {
  const val = cellStr(row[col]);
  if (!val) return null;

  if (isBareCurrencyMarker(val)) {
    const next = cellStr(row[col + 1]);
    if (next && cellNum(next) !== null) {
      return { valor: `R$ ${next}`, col: col + 1 };
    }
    return null;
  }

  if (/R\$/i.test(val) && cellNum(val) !== null) {
    return { valor: val, col };
  }

  if (/R\$/i.test(val)) {
    const next = cellStr(row[col + 1]);
    if (next && cellNum(next) !== null) {
      return { valor: `${val} ${next}`.replace(/\s+/g, " ").trim(), col: col + 1 };
    }
  }

  return null;
}

function extractLastMoneyInRow(row: CellMatrix[number]): { valor: string; col: number } | null {
  for (let k = row.length - 1; k >= 0; k--) {
    const money = readMoneyAt(row, k);
    if (money) return money;
  }

  for (let k = row.length - 1; k >= 0; k--) {
    const val = cellStr(row[k]);
    if (!val || isPercentOnlyCell(val) || isItemNumberCell(val)) continue;
    if (isCurrencyUnitLabel(val)) continue;
    if (isInlineFieldLabel(val)) continue;
    if (cellNum(val) !== null) return { valor: val, col: k };
  }

  return null;
}

/** Colunas usuais do template NBR: R$ na col. 9 (ou 7) e valor na célula seguinte. */
function extractStandardMoneyColumns(row: CellMatrix[number]): { valor: string; col: number } | null {
  return readMoneyAt(row, 9) ?? readMoneyAt(row, 7);
}

function extractValueFromNumberedRow(
  row: CellMatrix[number],
  labelCol: number,
): { valor: string; col: number } | null {
  const standardMoney = extractStandardMoneyColumns(row);
  if (standardMoney) return standardMoney;

  const moneyCandidates: Array<{ valor: string; col: number }> = [];
  const numericCandidates: Array<{ valor: string; col: number }> = [];
  const textCandidates: Array<{ valor: string; col: number }> = [];

  for (let k = labelCol + 1; k < row.length; k++) {
    const val = cellStr(row[k]);
    if (!val || isPercentOnlyCell(val) || isItemNumberCell(val)) continue;
    if (isCurrencyUnitLabel(val)) continue;
    if (isInlineFieldLabel(val)) continue;

    const money = readMoneyAt(row, k);
    if (money) {
      moneyCandidates.push(money);
      if (isBareCurrencyMarker(val)) k += 1;
      continue;
    }

    const next = cellStr(row[k + 1]);
    if (cellNum(val) !== null && /m2|m²/i.test(next)) {
      return { valor: val, col: k };
    }

    if (cellNum(val) !== null) {
      numericCandidates.push({ valor: val, col: k });
      continue;
    }

    if (
      val.length > 1 &&
      !/^\/\s*m2?$/i.test(val) &&
      !isQuadroHeaderLikeValue(val) &&
      !isInlineFieldLabel(val)
    ) {
      textCandidates.push({ valor: val, col: k });
    }
  }

  if (moneyCandidates.length > 0) return moneyCandidates[moneyCandidates.length - 1];
  if (numericCandidates.length > 0) return numericCandidates[numericCandidates.length - 1];
  if (textCandidates.length > 0) return textCandidates[textCandidates.length - 1];

  return extractLastMoneyInRow(row);
}

function isStandaloneQuantityCell(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

/** Monta o rótulo descritivo de um item numerado a partir das células entre o número e o valor. */
function buildNumberedRowLabel(
  matrix: CellMatrix,
  rowIndex: number,
  labelCol: number,
  valueCol: number,
  itemNumber: string,
): string {
  const parts: string[] = [];

  const pushText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStandaloneQuantityCell(trimmed)) return;
    if (isPercentOnlyCell(trimmed)) return;
    if (isInlineFieldLabel(trimmed)) return;
    if (isQuadroHeaderLikeValue(trimmed)) return;
    parts.push(trimmed);
  };

  const row = matrix[rowIndex] ?? [];
  for (let k = labelCol; k < valueCol; k++) {
    pushText(cellStr(row[k]));
  }

  for (let k = valueCol + 1; k <= valueCol + 3; k++) {
    const text = cellStr(row[k]).trim();
    if (/^(descoberta?s?|coberta?s?)$/i.test(text)) {
      pushText(`Vagas ${text}`);
    }
  }

  for (let r = rowIndex + 1; r < Math.min(matrix.length, rowIndex + 3); r++) {
    const nextRow = matrix[r] ?? [];
    const hasOtherItem = nextRow.some((cell) => {
      const text = cellStr(cell);
      return (
        cellMatchesItemNumber(text, itemNumber) ||
        (/\b[123]\.\d+(?:\.\d+)?\b/.test(text) && !text.includes(itemNumber))
      );
    });
    if (hasOtherItem) break;

    for (let k = labelCol; k < Math.max(valueCol + 2, labelCol + 10); k++) {
      const text = cellStr(nextRow[k]).trim();
      if (!text || isStandaloneQuantityCell(text)) continue;
      if (/^(?:[123]\.\d)/.test(text)) break;
      pushText(text);
    }
  }

  return [...new Set(parts)].join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Localiza item numerado na aba Informações Preliminares, com rótulo descritivo da linha.
 */
export function findPreliminarNumberedItem(
  matrix: CellMatrix,
  itemNumber: string,
): { valor: string; rotulo: string; row: number; col: number } | null {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    let labelCol = -1;

    for (let c = 0; c < row.length; c++) {
      if (cellMatchesItemNumber(cellStr(row[c]), itemNumber)) {
        labelCol = c;
        break;
      }
    }

    if (labelCol < 0) continue;

    const extracted = extractValueFromNumberedRow(row, labelCol);
    if (!extracted) continue;

    const rotulo =
      buildNumberedRowLabel(matrix, r, labelCol, extracted.col, itemNumber) || itemNumber;

    return {
      valor: normalizeNumericDisplayPtBr(extracted.valor),
      rotulo,
      row: r,
      col: extracted.col,
    };
  }

  return null;
}

/**
 * Localiza valor de um item numerado do Quadro III (e similares NBR).
 * Prioriza colunas monetárias à direita da descrição.
 */
export function findRowValueByItemNumber(
  matrix: CellMatrix,
  itemNumber: string,
): { valor: string; row: number; col: number } | null {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    let labelCol = -1;

    for (let c = 0; c < row.length; c++) {
      if (cellMatchesItemNumber(cellStr(row[c]), itemNumber)) {
        labelCol = c;
        break;
      }
    }

    if (labelCol < 0) continue;

    const extracted = extractValueFromNumberedRow(row, labelCol);
    if (!extracted) continue;

    return {
      valor: normalizeNumericDisplayPtBr(extracted.valor),
      row: r,
      col: extracted.col,
    };
  }

  return null;
}

export function labelCellMatches(text: string, needle: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (/^\d+(\.\d+)*$/.test(needle)) {
    return cellMatchesItemNumber(trimmed, needle);
  }

  return trimmed.toLowerCase().includes(needle.toLowerCase());
}

const LABEL_HEADER_PATTERN =
  /^(designação|padrão de acabamento|número de pavimentos|área equivalente|dependências|quartos|salas|banheiros)/i;

export function isQuadroHeaderLikeValue(value: string): boolean {
  const text = value.trim();
  if (!text) return true;
  return LABEL_HEADER_PATTERN.test(text);
}

/** Texto que é rótulo de campo na planilha NBR, não o valor preenchido. */
export function isInlineFieldLabel(value: string): boolean {
  const text = value.trim();
  if (!text) return true;
  if (text.endsWith(":")) return true;
  if (/^(cep|cnpj|cpf|rg|art|cau|c\.e\.p)\s*:?\s*$/i.test(text)) return true;
  if (/^número de registro profissional/i.test(text)) return true;
  if (/^registro (no|profissional)/i.test(text)) return true;
  if (
    /^(nome|cnpj|cep|endereço|logradouro|município|profissional responsável|incorporador|anotação de responsabilidade)\b/i.test(
      text,
    )
  ) {
    return true;
  }
  return false;
}

/** Valor textual na mesma linha do rótulo (ex.: classificação geral → coluna 5). */
export function findSameRowValue(
  row: CellMatrix[number],
  labelCol: number,
  preferCol?: number,
): { valor: string; col: number } | null {
  if (preferCol !== undefined) {
    const preferred = cellStr(row[preferCol]);
    if (preferred && !isQuadroHeaderLikeValue(preferred)) {
      return { valor: preferred, col: preferCol };
    }
  }

  for (let k = row.length - 1; k > labelCol; k--) {
    const val = cellStr(row[k]);
    if (!val || isQuadroHeaderLikeValue(val) || isPercentOnlyCell(val)) continue;
    if (isItemNumberCell(val)) continue;
    if (isInlineFieldLabel(val)) continue;
    return { valor: val, col: k };
  }

  return null;
}

export function findRowIndex(matrix: CellMatrix, predicate: (row: CellMatrix[number]) => boolean): number {
  return matrix.findIndex(predicate);
}

export function findLabelValue(
  matrix: CellMatrix,
  labelIncludes: string,
  startRow = 0,
): { valor: string; row: number; col: number } | null {
  const isNumericLabel = /^\d+(\.\d+)*$/.test(labelIncludes.trim());

  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const text = cellStr(row[c]);
      if (!labelCellMatches(text, labelIncludes)) continue;

      if (isNumericLabel || /r\$\s*por\s*m2/i.test(labelIncludes)) {
        const extracted = extractValueFromNumberedRow(row, c);
        if (extracted) {
          return {
            valor: normalizeNumericDisplayPtBr(extracted.valor),
            row: r,
            col: extracted.col,
          };
        }
        continue;
      }

      for (let k = c + 1; k < row.length; k++) {
        const candidate = cellStr(row[k]);
        if (!candidate || isItemNumberCell(candidate)) continue;
        if (isInlineFieldLabel(candidate)) continue;
        if (isQuadroHeaderLikeValue(candidate)) continue;
        if (isCurrencyUnitLabel(candidate)) continue;

        const money = readMoneyAt(row, k);
        if (money) {
          return {
            valor: normalizeNumericDisplayPtBr(money.valor),
            row: r,
            col: money.col,
          };
        }

        if (cellNum(candidate) !== null) {
          return { valor: normalizeNumericDisplayPtBr(candidate), row: r, col: k };
        }

        return { valor: normalizeNumericDisplayPtBr(candidate), row: r, col: k };
      }
    }
  }

  return null;
}

export function findAllLabelValues(matrix: CellMatrix, labelIncludes: string): string[] {
  const needle = labelIncludes.toLowerCase();
  const values: string[] = [];

  for (const row of matrix) {
    for (let c = 0; c < (row?.length ?? 0); c++) {
      const text = cellStr(row[c]).toLowerCase();
      if (!text.includes(needle)) continue;

      for (let k = c + 1; k < (row?.length ?? 0); k++) {
        const candidate = cellStr(row[k]);
        if (candidate) {
          values.push(normalizeNumericDisplayPtBr(candidate));
          break;
        }
      }
    }
  }

  return values;
}

export function extractFolhaInfo(matrix: CellMatrix): { folha: number | null; totalFolhas: number | null } {
  const folhaRaw = findLabelValue(matrix, "folha");
  const totalRaw = findLabelValue(matrix, "total de folhas");

  return {
    folha: folhaRaw ? cellNum(folhaRaw.valor) : null,
    totalFolhas: totalRaw ? cellNum(totalRaw.valor) : null,
  };
}

export function slicePreview(matrix: CellMatrix, maxRows = 28): string[][] {
  return matrix.slice(0, maxRows).map((row) =>
    (row ?? []).slice(0, 14).map((cell) => {
      const text = normalizeNumericDisplayPtBr(cellStr(cell));
      return text.length > 48 ? `${text.slice(0, 45)}…` : text;
    }),
  );
}

export function isBlocoRow(designacao: string): boolean {
  return /^bloco\s+\d+/i.test(designacao);
}

export function isTorreRow(designacao: string): boolean {
  return /^torre\s+\d+/i.test(designacao);
}

export function isTorreOuBlocoRow(designacao: string): boolean {
  return isBlocoRow(designacao) || isTorreRow(designacao);
}

export function findSheetName(
  sheetNames: string[],
  matchers: Array<string | RegExp>,
): string | undefined {
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

export function isDataEndRow(firstCell: string): boolean {
  const upper = firstCell.toUpperCase();
  return (
    upper.startsWith("TOTAIS") ||
    upper.startsWith("TOTAL GERAL") ||
    upper.startsWith("OBSERVA") ||
    upper.startsWith("ÁREA REAL GLOBAL")
  );
}

/** Cabeçalho repetido entre folhas do mesmo quadro no Excel. */
export function isQuadroSheetHeaderRow(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return (
    /^informações para arquivo/i.test(t) ||
    /^\(?lei\s+4\.591/i.test(t) ||
    /^quadro\s+(i{1,3}|iv|v|vi{1,3}|resumo)/i.test(t) ||
    /^local do imóvel/i.test(t) ||
    /^empreendimento:/i.test(t) ||
    /^logradouro:/i.test(t) ||
    /^lote\s*\/\s*quadra:/i.test(t) ||
    /^município\s*\/\s*uf:/i.test(t) ||
    /^designação da unidade/i.test(t) ||
    /^profissional responsável/i.test(t) ||
    /^incorporador/i.test(t) ||
    /^folha\s*n[oº°]/i.test(t) ||
    /^total de folhas:/i.test(t) ||
    /^unidade$/i.test(t) ||
    /^cálculo das áreas/i.test(t) ||
    /^resumo das áreas reais/i.test(t)
  );
}

/** Marcador de coluna do template (A, B, … G) — não é unidade. */
export function isColunaMarkerRow(text: string): boolean {
  return /^[A-G]$/i.test(text.trim());
}

const UNIDADE_DESIGNACAO_PATTERNS = [
  /^apartamento\s+\S+/i,
  /^vaga\s+autônoma\s+n[º°]?\s*\S+/i,
  /^vaga\s+autônoma\s/i,
  /^vaga\s+n[º°]?\s*\S+/i,
  /^vaga\s+\S+/i,
  /^sala\s+comercial\b/i,
  /^dep[óo]sito\s+\S+/i,
  /^garden\s+\S+/i,
  /^loja\s+\S+/i,
  /^garagem\s+\S+/i,
  /^box\s+\S+/i,
  /^cobertura\s+\S+/i,
  /^unidade\s+\S+/i,
];

/** Designação reconhecível de unidade autônoma (ex.: Apartamento 101). */
export function isUnidadeDesignacaoValida(designacao: string): boolean {
  const t = designacao.trim();
  if (!t) return false;
  if (isQuadroSheetHeaderRow(t)) return false;
  if (isColunaMarkerRow(t)) return false;
  if (isDataEndRow(t)) return false;
  if (isTorreOuBlocoRow(t)) return false;
  if (/^coluna\s+\d+/i.test(t)) return false;
  return UNIDADE_DESIGNACAO_PATTERNS.some((pattern) => pattern.test(t));
}

/** Rótulo curto para alertas e listas (ex.: Apartamento 101). */
export function designacaoParaExibicao(designacao: string): string {
  const t = designacao.trim().replace(/\s+/g, " ");
  const extrair = [
    /^(apartamento\s+[\w./-]+)/i,
    /^(vaga\s+autônoma\s*n[º°]?\s*[\w./-]+)/i,
    /^(vaga\s+[\w./-]+)/i,
    /^(sala\s+comercial(?:\s+[\w./-]+)?)/i,
    /^(dep[óo]sito\s+[\w./-]+)/i,
    /^(garden(?:\s+[\w./-]+)?)/i,
    /^(loja\s+[\w./-]+)/i,
    /^(garagem\s+[\w./-]+)/i,
    /^(box\s+[\w./-]+)/i,
    /^(cobertura\s+[\w./-]+)/i,
  ];

  for (const pattern of extrair) {
    const match = t.match(pattern);
    if (match) return match[1];
  }

  if (t.length <= 48) return t;
  return `${t.slice(0, 45)}…`;
}
