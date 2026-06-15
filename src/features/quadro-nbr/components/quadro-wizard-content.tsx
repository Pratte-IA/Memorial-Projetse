import type { DocumentoNbrExtraido, QuadroExtraido, QuadroId } from "../types";
import { PreliminaresStep } from "./preliminares-step";
import { QuadroCamposStep } from "./quadro-campos-step";
import { QuadroTabelaStep } from "./quadro-tabela-step";
import { RevisaoStep } from "./revisao-step";
import { QuadroAusenteStep } from "./quadro-ausente-step";
import { getWizardStepDescricao, getWizardStepTitulo } from "../quadro-iv";

const TABULAR_IDS = new Set<QuadroId>([
  "qi",
  "qii",
  "qiva",
  "qivb",
  "qvi",
  "qvii",
  "qviii",
  "qcomp",
  "resumo",
]);
const CAMPOS_IDS = new Set<QuadroId>(["qiii", "qv"]);

export type QuadroWizardStepId = QuadroId | "upload" | "revisao";

export interface QuadroWizardContentProps {
  stepId: QuadroWizardStepId;
  documento: DocumentoNbrExtraido;
  alertas?: import("../types").AlertaValidacao[];
  stepTituloFallback?: string;
  onQuadroChange?: (quadro: QuadroExtraido) => void;
  onIrParaQuadro?: (quadroId: QuadroId) => void;
  /** Consulta pós-importação: sem edição, sem fluxo de validação. */
  modoConsulta?: boolean;
}

export function getQuadroWizardStepMeta(
  stepId: QuadroWizardStepId,
  documento: DocumentoNbrExtraido | null,
  fallbackTitulo: string,
  fallbackDescricao: string,
) {
  return {
    titulo: getWizardStepTitulo(stepId, documento, fallbackTitulo),
    descricao: getWizardStepDescricao(stepId, documento, fallbackDescricao),
  };
}

export function QuadroWizardContent({
  stepId,
  documento,
  alertas = [],
  stepTituloFallback = "",
  onQuadroChange,
  onIrParaQuadro,
  modoConsulta = false,
}: QuadroWizardContentProps) {
  const handleChange = modoConsulta ? undefined : onQuadroChange;

  if (stepId === "preliminares") {
    return (
      <PreliminaresStep
        quadro={documento.preliminares}
        alertas={modoConsulta ? [] : alertas}
        onChange={handleChange}
      />
    );
  }

  if (stepId === "revisao") {
    return (
      <RevisaoStep
        documento={documento}
        onIrParaQuadro={onIrParaQuadro}
        somenteLeitura={modoConsulta}
      />
    );
  }

  const quadro = documento.quadros.find((q) => q.id === stepId);
  if (!quadro) {
    return (
      <QuadroAusenteStep
        quadroId={stepId as QuadroId}
        tituloStep={getWizardStepTitulo(stepId, documento, stepTituloFallback)}
        nomeArquivo={documento.nomeArquivo}
        documento={documento}
      />
    );
  }

  if (CAMPOS_IDS.has(quadro.id)) {
    return (
      <QuadroCamposStep
        quadro={quadro as import("../types").QuadroIII | import("../types").QuadroV}
        alertas={modoConsulta ? [] : alertas}
        onChange={handleChange}
      />
    );
  }

  if (TABULAR_IDS.has(quadro.id)) {
    return (
      <QuadroTabelaStep
        quadro={quadro}
        alertas={modoConsulta ? [] : alertas}
        onChange={handleChange}
        onIrParaQuadro={onIrParaQuadro}
      />
    );
  }

  return null;
}
