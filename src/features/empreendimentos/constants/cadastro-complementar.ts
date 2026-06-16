import type { Confrontacao } from "../types/detail-types";

export const OPCOES_DIRECAO_CONFRONTACAO = [
  { value: "norte", label: "Norte" },
  { value: "sul", label: "Sul" },
  { value: "leste", label: "Leste" },
  { value: "oeste", label: "Oeste" },
  { value: "noroeste", label: "Noroeste" },
  { value: "nordeste", label: "Nordeste" },
  { value: "sudeste", label: "Sudeste" },
  { value: "sudoeste", label: "Sudoeste" },
] as const;

export type ConfrontacaoItem = Confrontacao & { formId: string };

export function labelDirecaoConfrontacao(direcao: string): string {
  const key = direcao.trim().toLowerCase();
  return OPCOES_DIRECAO_CONFRONTACAO.find((o) => o.value === key)?.label ?? direcao;
}

export function criarConfrontacaoVazia(direcao = "noroeste"): ConfrontacaoItem {
  return {
    formId: `conf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    direcao,
    confrontante: "",
    medida: "",
    azimute: "",
  };
}

export function confrontacoesFromView(confrontacoes: Confrontacao[]): ConfrontacaoItem[] {
  return confrontacoes
    .filter(
      (c) =>
        c.direcao !== "—" ||
        (c.confrontante !== "—" && c.confrontante) ||
        (c.medida !== "—" && c.medida) ||
        (c.azimute !== "—" && c.azimute),
    )
    .map((c, index) => ({
      formId: `conf-${index}-${c.direcao}`,
      direcao: c.direcao === "—" ? "noroeste" : c.direcao.toLowerCase(),
      confrontante: c.confrontante === "—" ? "" : c.confrontante,
      medida: c.medida === "—" ? "" : c.medida,
      azimute: c.azimute === "—" ? "" : c.azimute,
    }));
}

export function confrontacaoItemEstaCompleta(c: Confrontacao): boolean {
  return Boolean(c.confrontante.trim() && c.medida.trim() && c.azimute.trim() && c.direcao.trim());
}

export function formatConfrontacoesTexto(confrontacoes: Confrontacao[]): string {
  return confrontacoes
    .filter((c) => c.confrontante.trim() || c.medida.trim() || c.azimute.trim())
    .map((c) => {
      const az = c.azimute.trim() ? ` e azimute ${c.azimute.trim()}` : "";
      const dir = c.direcao.trim().toLowerCase();
      return `ao ${dir}: com ${c.confrontante.trim() || "—"}, medindo ${c.medida.trim() || "—"}${az}`;
    })
    .join("; ");
}
