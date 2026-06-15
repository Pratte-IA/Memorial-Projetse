import { getBlocoTitulo, isCampoConfirmado } from "@/features/dados-extraidos/status";
import type { DadoExtraidoRecord, DadoExtraidoStatus } from "@/features/dados-extraidos/types";

import type {
  IntegridadeQuadrosInput,
  QuadroBlocoIntegridade,
  QuadroBlocoStatusUi,
} from "./types/prontidao-types";

/** Quadros exibidos no painel de integridade (ordem do memorial / NBR). */
export const QUADROS_INTEGRIDADE_BASE = [
  "preliminares",
  "qi",
  "qii",
  "qiii",
  "qiva",
  "qivb",
  "qv",
  "qvi",
  "qvii",
  "qviii",
] as const;

export const QUADROS_INTEGRIDADE_OPCIONAIS = ["qcomp", "resumo"] as const;

const BLOCO_CLAUSULA: Record<string, string> = {
  preliminares: "Qualificação · Cláusula Quarta",
  qi: "Cláusula Terceira — Composição",
  qcomp: "Cláusula Terceira — Composição (multi-torre)",
  qii: "Cláusula Quinta — Unidades",
  qiii: "Anexo NBR — Custo global",
  qiva: "Anexo NBR — Custo por unidade",
  qivb: "Cláusula Quinta — Áreas reais",
  qv: "Cláusula Quinta — Informações gerais",
  resumo: "Cláusula Quinta — Frações e confrontações",
  qvi: "Memorial Descritivo — Equipamentos",
  qvii: "Memorial Descritivo — Acabamentos privativos",
  qviii: "Memorial Descritivo — Acabamentos comuns",
};

function isCampoRevisado(status: DadoExtraidoStatus): boolean {
  return status === "confirmado" || status === "editado";
}

function computeStatusFromCampos(campos: DadoExtraidoRecord[]): QuadroBlocoStatusUi {
  if (campos.length === 0) return "ausente";

  const confirmados = campos.filter((c) => isCampoRevisado(c.status)).length;
  const pendentes = campos.filter(
    (c) => c.status === "pendente" || c.status === "baixa_confianca",
  ).length;

  if (pendentes > 0) return "pendente";
  if (confirmados === campos.length) return "validado";
  if (confirmados > 0) return "parcial";
  return "extraido";
}

function latestReviewedAt(campos: DadoExtraidoRecord[]): string | null {
  let latest: string | null = null;
  for (const c of campos) {
    if (!c.reviewedAt) continue;
    if (!latest || c.reviewedAt > latest) latest = c.reviewedAt;
  }
  return latest;
}

function statusFromUnidades(
  unidadesTotal: number,
  unidadesValidadas: number,
  camposStatus: QuadroBlocoStatusUi,
): { status: QuadroBlocoStatusUi; detalhe?: string } {
  if (unidadesTotal === 0) {
    return { status: camposStatus };
  }

  const detalhe = `${unidadesValidadas}/${unidadesTotal} unidades validadas`;

  if (unidadesValidadas === unidadesTotal && unidadesTotal > 0) {
    return { status: "validado", detalhe };
  }
  if (unidadesValidadas > 0) {
    return { status: "parcial", detalhe };
  }
  if (camposStatus === "validado") {
    return { status: "extraido", detalhe };
  }
  return { status: camposStatus, detalhe };
}

export function buildQuadrosIntegridade(input: IntegridadeQuadrosInput): QuadroBlocoIntegridade[] {
  const blocoMap = new Map(input.blocos.map((b) => [b.bloco, b.campos]));
  const presentesOpcionais = QUADROS_INTEGRIDADE_OPCIONAIS.filter((id) =>
    blocoMap.has(id),
  );
  const ordem = [...QUADROS_INTEGRIDADE_BASE, ...presentesOpcionais];

  return ordem.map((bloco) => {
    const campos = blocoMap.get(bloco) ?? [];
    let status = computeStatusFromCampos(campos);
    let detalhe: string | undefined;

    if (bloco === "qii") {
      const fromUnidades = statusFromUnidades(
        input.unidadesTotal,
        input.unidadesValidadas,
        status,
      );
      status = fromUnidades.status;
      detalhe = fromUnidades.detalhe;
    } else if (bloco === "qivb" && input.unidadesTotal > 0 && status !== "ausente") {
      detalhe = `${input.unidadesTotal} unidades no cadastro`;
    }

    return {
      bloco,
      titulo: getBlocoTitulo(bloco),
      clausulaRef: BLOCO_CLAUSULA[bloco] ?? "Anexo NBR",
      status,
      totalCampos: campos.length,
      camposConfirmados: campos.filter((c) => isCampoConfirmado(c.status)).length,
      validatedAt: latestReviewedAt(campos),
      detalhe,
    };
  });
}

export function countQuadrosValidados(quadros: QuadroBlocoIntegridade[]): {
  validados: number;
  total: number;
} {
  const relevantes = quadros.filter((q) => q.status !== "ausente" && q.bloco !== "qcomp");
  const total = relevantes.length || quadros.length;
  const validados = relevantes.filter((q) => q.status === "validado").length;
  return { validados, total };
}

export function getQuadroStatusLabel(status: QuadroBlocoStatusUi): string {
  const labels: Record<QuadroBlocoStatusUi, string> = {
    validado: "Validado",
    extraido: "Extraído — aguardando validação",
    parcial: "Validação parcial",
    pendente: "Com pendências",
    ausente: "Ausente no arquivo",
  };
  return labels[status];
}
