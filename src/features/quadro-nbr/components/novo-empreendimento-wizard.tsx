import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/use-auth";
import { useCreateEmpreendimentoFromNbr } from "@/features/empreendimentos/hooks";

import { ACCEPTED_QUADRO_EXTENSIONS, QUADROS_WIZARD_STEPS } from "../constants";
import type { ArquivoQuadroImportado } from "@/features/empreendimentos/types";
import { resolveQuadroContentType } from "@/features/quadros-tecnicos/mime";
import { parseQuadroNbrFile } from "../parser";
import { updateQuadroInDocumento } from "../mapper";
import { validarCruzamento, validarQuadroAtual } from "../validation";
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

export function NovoEmpreendimentoWizard() {
  const navigate = useNavigate();
  const { membership, profile } = useAuth();
  const createMutation = useCreateEmpreendimentoFromNbr();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stepIdx, setStepIdx] = useState(0);
  const [arquivo, setArquivo] = useState<ArquivoQuadroImportado | null>(null);
  const [processando, setProcessando] = useState(false);
  const [documento, setDocumento] = useState<DocumentoNbrExtraido | null>(null);

  const step = QUADROS_WIZARD_STEPS[stepIdx];

  const irParaStep = (index: number) => {
    if (index === stepIdx) return;
    if (index > 0 && !documento) return;
    setStepIdx(index);
  };

  const irParaQuadro = (quadroId: QuadroId) => {
    const index = QUADROS_WIZARD_STEPS.findIndex((s) => s.id === quadroId);
    if (index >= 0) irParaStep(index);
  };

  const handleArquivo = async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_QUADRO_EXTENSIONS.includes(ext as (typeof ACCEPTED_QUADRO_EXTENSIONS)[number])) {
      toast.error("Formato não suportado", {
        description: "Envie um arquivo .xlsx, .xls ou .csv no padrão CFMD NBR 12.721.",
      });
      return;
    }

    setProcessando(true);

    try {
      const buffer = await file.arrayBuffer();
      const importado: ArquivoQuadroImportado = {
        name: file.name,
        type: resolveQuadroContentType(file.name, file.type),
        size: file.size,
        buffer,
      };
      setArquivo(importado);

      const parsed = await parseQuadroNbrFile(
        new File([buffer], importado.name, { type: importado.type }),
      );
      setDocumento(parsed);
      setStepIdx(1);
      toast.success("Quadro processado", {
        description: `${parsed.quadros.length} seções extraídas. Valide quadro a quadro.`,
      });
    } catch (error) {
      toast.error("Falha ao processar arquivo", {
        description: error instanceof Error ? error.message : "Verifique o formato do quadro.",
      });
      setArquivo(null);
    } finally {
      setProcessando(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleArquivo(file);
  };

  const handleQuadroChange = (quadro: QuadroExtraido) => {
    if (!documento) return;
    setDocumento(updateQuadroInDocumento(documento, quadro));
  };

  const avancar = () => {
    if (!documento || step.id === "upload" || step.id === "revisao") {
      setStepIdx((i) => i + 1);
      return;
    }

    const quadroId = step.id as QuadroId;
    if (!documento.quadrosPresentes.includes(quadroId)) {
      setStepIdx((i) => i + 1);
      return;
    }

    const resultado = validarQuadroAtual(documento, quadroId);
    if (!resultado.podeAvancar) {
      toast.error("Pendências no quadro", {
        description: resultado.alertas.find((a) => a.severidade === "erro")?.mensagem,
      });
      return;
    }

    setStepIdx((i) => i + 1);
  };

  const finalizar = async () => {
    if (!documento || !arquivo || !membership || !profile) {
      toast.error("Sessão inválida", {
        description: arquivo
          ? "Faça login novamente para continuar."
          : "Volte ao passo inicial e envie o arquivo CFMD novamente.",
      });
      return;
    }

    try {
      const id = await createMutation.mutateAsync({
        documento,
        arquivo,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
      toast.success("Empreendimento criado", {
        description: "Dados dos quadros NBR validados e gravados.",
      });
      navigate({ to: "/empreendimentos/$id", params: { id: String(id) } });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Não foi possível salvar os dados. Tente novamente.";

      toast.error("Erro ao criar empreendimento", {
        description: message,
      });
    }
  };

  const alertasAtuais = (() => {
    if (!documento || step.id === "upload") return [];

    const quadroId = step.id as QuadroId;
    const base = step.id === "revisao" ? [] : validarQuadroAtual(documento, quadroId).alertas;

    const stepsComCruzamento = new Set(["qii", "qivb", "resumo", "revisao"]);
    if (!stepsComCruzamento.has(step.id)) return base;

    const cruzamento = validarCruzamento(documento).alertas.filter(
      (a) =>
        step.id === "revisao" ||
        a.quadroOrigem === quadroId ||
        a.quadroDestino === quadroId,
    );

    return [...base, ...cruzamento];
  })();

  const stepTitulo = getWizardStepTitulo(step.id, documento, step.titulo);
  const stepDescricao = getWizardStepDescricao(step.id, documento, step.descricao);

  const renderStepContent = () => {
    if (step.id === "upload") {
      return (
        <Card className="p-8 border-border shadow-none">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/30 transition"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && void handleArquivo(e.target.files[0])}
            />
            {processando ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm">Extraindo quadros NBR 12.721...</p>
              </div>
            ) : arquivo ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-10 w-10 text-primary" />
                <p className="text-sm font-medium">{arquivo.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Arraste o quadro CFMD aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Aceita .xlsx, .xls ou .csv</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      );
    }

    if (!documento) return null;

    if (step.id === "preliminares") {
      return (
        <PreliminaresStep
          quadro={documento.preliminares}
          alertas={alertasAtuais}
          onChange={handleQuadroChange}
        />
      );
    }

    if (step.id === "revisao") {
      return <RevisaoStep documento={documento} onIrParaQuadro={irParaQuadro} />;
    }

    const quadro = documento.quadros.find((q) => q.id === step.id);
    if (!quadro) {
      return (
        <QuadroAusenteStep
          quadroId={step.id as QuadroId}
          tituloStep={stepTitulo}
          nomeArquivo={documento.nomeArquivo}
          documento={documento}
        />
      );
    }

    if (CAMPOS_IDS.has(quadro.id)) {
      return (
        <QuadroCamposStep
          quadro={quadro as import("../types").QuadroIII | import("../types").QuadroV}
          alertas={alertasAtuais}
          onChange={handleQuadroChange}
        />
      );
    }

    if (TABULAR_IDS.has(quadro.id)) {
      return (
        <QuadroTabelaStep
          quadro={quadro}
          alertas={alertasAtuais}
          onChange={handleQuadroChange}
          onIrParaQuadro={irParaQuadro}
        />
      );
    }

    return null;
  };

  return (
    <>
      <PageHeader
        title="Novo empreendimento"
        subtitle="Faça o upload do quadro CFMD e valide cada seção conforme a NBR 12.721."
        breadcrumb={[{ label: "Empreendimentos" }, { label: "Novo" }]}
      />

      <div className="p-8 max-w-6xl space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          {QUADROS_WIZARD_STEPS.map((s, i) => {
            const podeNavegar = i === 0 || documento !== null;
            return (
            <div key={s.id} className="flex items-center gap-2">
              <Badge
                variant={i === stepIdx ? "default" : i < stepIdx ? "secondary" : "outline"}
                role={podeNavegar ? "button" : undefined}
                tabIndex={podeNavegar ? 0 : undefined}
                title={podeNavegar ? `Ir para: ${getWizardStepTitulo(s.id, documento, s.titulo)}` : undefined}
                className={cn(
                  "rounded-full text-[10px]",
                  podeNavegar && "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  !podeNavegar && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => podeNavegar && irParaStep(i)}
                onKeyDown={(e) => {
                  if (!podeNavegar) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    irParaStep(i);
                  }
                }}
              >
                {i < stepIdx && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {i + 1}. {getWizardStepTitulo(s.id, documento, s.titulo)}
              </Badge>
              {i < QUADROS_WIZARD_STEPS.length - 1 && (
                <span className="text-muted-foreground text-xs">›</span>
              )}
            </div>
            );
          })}
        </div>

        {step.id !== "upload" && (
          <p className="text-xs text-muted-foreground">{stepDescricao}</p>
        )}

        {renderStepContent()}

        {step.id !== "upload" && (
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/empreendimentos" })}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              {stepIdx < QUADROS_WIZARD_STEPS.length - 1 ? (
                <Button type="button" onClick={avancar}>
                  Validar e continuar <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={finalizar} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Salvando...
                    </>
                  ) : (
                    "Criar empreendimento"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
