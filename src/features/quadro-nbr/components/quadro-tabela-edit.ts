import { parseBrNumeric } from "@/lib/format";

import type { QuadroExtraido } from "../types";

function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—") return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const n = parseBrNumeric(normalized);
  if (n !== null) return n;
  const fallback = Number(normalized);
  return Number.isFinite(fallback) ? fallback : null;
}

function coerceValue(
  current: unknown,
  raw: string,
): string | number | null | undefined {
  if (typeof current === "number" || current === null) {
    return parseNumericInput(raw);
  }
  if (current === undefined && /^-?\d[\d.,]*$/.test(raw.trim())) {
    return parseNumericInput(raw);
  }
  const text = raw.trim();
  return text === "—" ? "" : text;
}

export function updateLinhaInQuadro(
  quadro: QuadroExtraido,
  lineIndex: number,
  fieldKey: string,
  raw: string,
): QuadroExtraido {
  if (!("linhas" in quadro) || !Array.isArray(quadro.linhas)) return quadro;
  if (lineIndex < 0 || lineIndex >= quadro.linhas.length) return quadro;

  const linhas = [...quadro.linhas];
  const atual = { ...(linhas[lineIndex] as object) } as Record<string, unknown>;
  const nextValue = coerceValue(atual[fieldKey], raw);

  linhas[lineIndex] = {
    ...atual,
    [fieldKey]: nextValue,
  } as unknown as (typeof quadro.linhas)[number];

  return { ...quadro, linhas } as QuadroExtraido;
}

export function cellEditDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    return String(value).replace(".", ",");
  }
  return value;
}
