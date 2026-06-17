const UNITS = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];
const TEENS = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const HUNDREDS = [
  "",
  "cem",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function belowThousand(value: number): string {
  if (value === 0) return "";
  if (value === 100) return "cem";
  if (value < 10) return UNITS[value];
  if (value < 20) return TEENS[value - 10];
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const unit = value % 10;
    return unit ? `${TENS[tens]} e ${UNITS[unit]}` : TENS[tens];
  }

  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const hundredWord = hundreds === 1 && rest > 0 ? "cento" : HUNDREDS[hundreds];
  return rest ? `${hundredWord} e ${belowThousand(rest)}` : hundredWord;
}

function belowMillion(value: number, joinThousands = " e "): string {
  if (value === 0) return "";
  if (value < 1000) return belowThousand(value);

  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  const thousandWord = thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
  return rest ? `${thousandWord}${joinThousands}${belowThousand(rest)}` : thousandWord;
}

function integerFromBillions(value: number): string {
  const billions = Math.floor(value / 1_000_000_000);
  const rest = value % 1_000_000_000;
  const billionWord = billions === 1 ? "um bilhão" : `${belowThousand(billions)} bilhões`;
  if (rest === 0) return billionWord;
  return `${billionWord}, ${integerFromMillions(rest)}`;
}

function integerFromMillions(value: number): string {
  const millions = Math.floor(value / 1_000_000);
  const rest = value % 1_000_000;
  const millionWord = millions === 1 ? "um milhão" : `${belowThousand(millions)} milhões`;
  if (rest === 0) return millionWord;
  return `${millionWord}, ${belowMillion(rest)}`;
}

/** Parte inteira com vírgula após milhares (padrão memorial). */
function integerPartPorExtenso(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";
  if (value === 0) return "zero";
  if (value >= 1_000_000_000) return integerFromBillions(value);
  if (value >= 1_000_000) return integerFromMillions(value);
  if (value < 1000) return belowThousand(value);

  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  const thousandWord = thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
  return rest ? `${thousandWord}, ${belowThousand(rest)}` : thousandWord;
}

/** Converte inteiro para palavras em português (suporta milhões e bilhões). */
export function integerToPortuguese(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "zero";
  if (value < 0) return String(value);
  if (value >= 1_000_000_000) return integerFromBillions(value);
  if (value >= 1_000_000) return integerFromMillions(value);
  return belowMillion(value);
}

/** Valor monetário por extenso (ex.: 11943030 → "onze milhões... trinta reais"). */
export function valorMonetarioPorExtenso(
  valor: number,
  options?: { capitalize?: boolean },
): string {
  if (!Number.isFinite(valor) || valor < 0) return "";

  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);
  let texto = `${integerToPortuguese(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (centavos > 0) {
    texto += ` e ${integerToPortuguese(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  }
  if (options?.capitalize) {
    texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  return texto;
}

/** Área em m² por extenso (ex.: 2.089,92 → "dois mil, oitenta e nove metros quadrados e noventa e dois centímetros quadrados"). */
export function areaMetrosQuadradosPorExtenso(area: number): string {
  if (!Number.isFinite(area) || area <= 0) return "";

  const rounded = Math.round(area * 100) / 100;
  const integerPart = Math.floor(rounded);
  const centimeters = Math.round((rounded - integerPart) * 100);

  let result = `${integerPartPorExtenso(integerPart)} metros quadrados`;
  if (centimeters > 0) {
    result += ` e ${integerToPortuguese(centimeters)} centímetros quadrados`;
  }

  return result;
}

/** Remove prefixos "Lote" / "Quadra" e retorna apenas o identificador. */
export function stripLoteQuadraPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return "";

  return trimmed
    .replace(/^lote\s*(?:n[º°]?\s*)?/i, "")
    .replace(/^quadra\s*(?:n[º°]?\s*)?/i, "")
    .replace(/,?\s*quadra\s*(?:n[º°]?\s*)?.+$/i, "")
    .trim();
}

/** Extrai o valor numérico de uma matrícula (ex.: "76.476" → 76476). */
export function parseMatriculaNumero(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

/** Matrícula por extenso (ex.: "76.476" → "setenta e seis mil, quatrocentos e setenta e seis"). */
export function matriculaPorExtenso(value: string): string {
  const num = parseMatriculaNumero(value);
  if (num === null) return "";
  if (num === 0) return "zero";
  return integerPartPorExtenso(num);
}

/** Gera por extenso para lote/quadra (ex.: "12-A" → "doze A", "0503" → "quinhentos e três"). */
export function loteQuadraPorExtenso(value: string): string {
  const trimmed = stripLoteQuadraPrefix(value);
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d+)(.*)$/);
  if (!match) return trimmed.toLowerCase();

  const numeric = parseInt(match[1], 10);
  const suffix = match[2].replace(/^[\s-]+/, "").trim();
  const extenso = integerToPortuguese(numeric);
  if (!suffix) return extenso;
  return `${extenso} ${suffix.toUpperCase()}`.trim();
}
