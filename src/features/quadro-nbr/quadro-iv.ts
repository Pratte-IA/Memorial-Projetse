import { getQuadroById } from "./parser";
import type { DocumentoNbrExtraido, QuadroIVB, QuadroId, QuadroIvVariante } from "./types";
import { detectQivbVariante } from "./parser/qivb-variante";

export type { QuadroIvVariante };
export { detectQivbVariante };

export function getQuadroIvB(documento: DocumentoNbrExtraido): QuadroIVB | undefined {
  return getQuadroById(documento, "qivb");
}

export function isDocumentoQuadroIvB1(documento: DocumentoNbrExtraido): boolean {
  if (documento.quadroIvVariante === "b1") return true;
  const qivb = getQuadroIvB(documento);
  return qivb?.variante === "b1";
}

export function getQuadroIvBTitulo(documento?: DocumentoNbrExtraido | null): string {
  if (!documento) return "Quadro IV B";
  return isDocumentoQuadroIvB1(documento) ? "Quadro IV B.1" : "Quadro IV B";
}

export function getQuadroIvBDescricao(documento?: DocumentoNbrExtraido | null): string {
  if (!documento) {
    return "Resumo das áreas reais para registro (colunas A a G).";
  }
  return isDocumentoQuadroIvB1(documento)
    ? "Resumo das áreas reais com discriminação de terreno (colunas A a J). Substitui os Quadros IV A e IV B."
    : "Resumo das áreas reais para registro (colunas A a G).";
}

/** Quadros IV A e IV B padrão não se aplicam quando o documento traz apenas IV B.1. */
export function isQuadroIvAusentePorB1(
  quadroId: "qiva" | "qivb",
  documento: DocumentoNbrExtraido,
): boolean {
  if (!isDocumentoQuadroIvB1(documento)) return false;
  if (quadroId === "qiva") return !documento.quadrosPresentes.includes("qiva");
  return false;
}

export function mensagemQuadroIvAusente(
  quadroId: "qiva" | "qivb",
  documento: DocumentoNbrExtraido,
): string | undefined {
  if (!isDocumentoQuadroIvB1(documento)) return undefined;

  if (quadroId === "qiva") {
    return "Este documento utiliza o Quadro IV B.1 (condomínio com terreno de uso exclusivo), que substitui os Quadros IV A e IV B padrão. A ausência do Quadro IV A é esperada.";
  }

  return undefined;
}

export function getWizardStepTitulo(
  stepId: QuadroId | "upload" | "revisao",
  documento: DocumentoNbrExtraido | null,
  defaultTitulo: string,
): string {
  if (!documento || !isDocumentoQuadroIvB1(documento)) return defaultTitulo;
  if (stepId === "qivb") return "Quadro IV B.1";
  if (stepId === "qiva") return "Quadro IV A (substituído)";
  return defaultTitulo;
}

export function getWizardStepDescricao(
  stepId: QuadroId | "upload" | "revisao",
  documento: DocumentoNbrExtraido | null,
  defaultDescricao: string,
): string {
  if (!documento || !isDocumentoQuadroIvB1(documento)) return defaultDescricao;
  if (stepId === "qivb") return getQuadroIvBDescricao(documento);
  if (stepId === "qiva") {
    return "Neste documento, o Quadro IV B.1 substitui os Quadros IV A e IV B padrão.";
  }
  return defaultDescricao;
}
