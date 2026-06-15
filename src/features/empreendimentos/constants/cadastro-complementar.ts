import type { Confrontacao } from "../types/detail-types";

export const DIRECOES_CONFRONTACAO = [
  { key: "noroeste", label: "Noroeste" },
  { key: "nordeste", label: "Nordeste" },
  { key: "sudeste", label: "Sudeste" },
  { key: "sudoeste", label: "Sudoeste" },
] as const;

export function confrontacoesVazias(): Confrontacao[] {
  return DIRECOES_CONFRONTACAO.map(({ key }) => ({
    direcao: key,
    confrontante: "",
    medida: "",
    azimute: "",
  }));
}

export function normalizarConfrontacoes(confrontacoes: Confrontacao[]): Confrontacao[] {
  const map = new Map(
    confrontacoes.map((c) => [c.direcao.toLowerCase(), c]),
  );

  return DIRECOES_CONFRONTACAO.map(({ key, label }) => {
    const existente = map.get(key);
    return {
      direcao: key,
      confrontante: existente?.confrontante === "—" ? "" : (existente?.confrontante ?? ""),
      medida: existente?.medida === "—" ? "" : (existente?.medida ?? ""),
      azimute: existente?.azimute === "—" ? "" : (existente?.azimute ?? ""),
    };
  });
}
