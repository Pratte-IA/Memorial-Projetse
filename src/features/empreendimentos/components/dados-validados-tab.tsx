import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Pencil, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";
import { QUADROS_DETAIL_STEPS } from "@/features/quadro-nbr/constants";
import {
  QuadroWizardContent,
  getQuadroWizardStepMeta,
  type QuadroWizardStepId,
} from "@/features/quadro-nbr/components/quadro-wizard-content";
import { updateQuadroInDocumento } from "@/features/quadro-nbr/mapper";
import { getWizardStepTitulo } from "@/features/quadro-nbr/quadro-iv";
import type { DocumentoNbrExtraido, QuadroExtraido, QuadroId } from "@/features/quadro-nbr/types";
import { validarQuadroAtual } from "@/features/quadro-nbr/validation";

import { loadLatestQuadroDocumento } from "../load-quadro-documento";
import { persistDocumentoEdits } from "../persist-documento-edits";
import { prontidaoExportacaoQueryKey } from "../hooks";
import { ensureValidacaoPosImportacao } from "../sync-pos-importacao";

function dadosValidadosQueryKey(empreendimentoId: number) {
  return ["dados-validados", empreendimentoId] as const;
}

interface DadosValidadosTabProps {
  empreendimentoId: number | null;
}

export function DadosValidadosTab({ empreendimentoId }: DadosValidadosTabProps) {
  const { membership, profile } = useAuth();
  const [stepIdx, setStepIdx] = useState(0);
  const [documentoLocal, setDocumentoLocal] = useState<DocumentoNbrExtraido | null>(null);
  const [editando, setEditando] = useState(false);
  const [dirty, setDirty] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: documentoRemoto,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: empreendimentoId ? dadosValidadosQueryKey(empreendimentoId) : ["dados-validados", "off"],
    queryFn: async () => {
      await ensureValidacaoPosImportacao(empreendimentoId!);
      return loadLatestQuadroDocumento(empreendimentoId!);
    },
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });

  useEffect(() => {
    if (documentoRemoto) {
      setDocumentoLocal(documentoRemoto);
      setDirty(false);
      setEditando(false);
    }
  }, [documentoRemoto]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!documentoLocal || !empreendimentoId || !membership || !profile) {
        throw new Error("Dados insuficientes para salvar.");
      }
      await persistDocumentoEdits({
        empreendimentoId,
        documento: documentoLocal,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
    },
    onSuccess: () => {
      setDirty(false);
      setEditando(false);
      toast.success("Alterações salvas.");
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: dadosValidadosQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({
          queryKey: ["empreendimentos", "detail", empreendimentoId],
        });
        void queryClient.invalidateQueries({ queryKey: prontidaoExportacaoQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({ queryKey: ["unidades", empreendimentoId] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    },
  });

  const documento = documentoLocal;
  const step = QUADROS_DETAIL_STEPS[stepIdx];
  const meta = documento
    ? getQuadroWizardStepMeta(step.id, documento, step.titulo, step.descricao)
    : { titulo: step.titulo, descricao: step.descricao };

  const alertasAtuais = useMemo(() => {
    if (!documento || step.id === "revisao") return [];
    return validarQuadroAtual(documento, step.id as QuadroId).alertas;
  }, [documento, step.id]);

  const handleQuadroChange = (quadro: QuadroExtraido) => {
    if (!editando) return;
    setDocumentoLocal((prev) => {
      if (!prev) return prev;
      return updateQuadroInDocumento(prev, quadro);
    });
    setDirty(true);
  };

  const handleIniciarEdicao = () => {
    setEditando(true);
  };

  const handleCancelarEdicao = () => {
    if (documentoRemoto) {
      setDocumentoLocal(documentoRemoto);
    }
    setDirty(false);
    setEditando(false);
  };

  const handleSalvar = () => {
    void saveMutation.mutateAsync();
  };

  const irParaStep = (index: number) => setStepIdx(index);

  const irParaQuadro = (quadroId: QuadroId) => {
    const index = QUADROS_DETAIL_STEPS.findIndex((s) => s.id === quadroId);
    if (index >= 0) setStepIdx(index);
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Dados validados disponíveis apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !documento) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os quadros validados. Verifique se o arquivo CFMD está vinculado.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {QUADROS_DETAIL_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <Badge
              variant={i === stepIdx ? "default" : "secondary"}
              role="button"
              tabIndex={0}
              title={`Editar: ${getWizardStepTitulo(s.id, documento, s.titulo)}`}
              className={cn(
                "rounded-full text-[10px] cursor-pointer hover:opacity-90",
                i !== stepIdx && "opacity-80",
              )}
              onClick={() => irParaStep(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  irParaStep(i);
                }
              }}
            >
              <CheckCircle2 className="h-3 w-3 mr-1 text-[var(--color-verde-escuro)]" />
              {i + 1}. {getWizardStepTitulo(s.id, documento, s.titulo)}
            </Badge>
            {i < QUADROS_DETAIL_STEPS.length - 1 && (
              <span className="text-muted-foreground text-xs">›</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{meta.descricao}</p>
        <div className="flex items-center gap-2 shrink-0">
          {!editando ? (
            <Button type="button" size="sm" variant="outline" onClick={handleIniciarEdicao}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={handleCancelarEdicao}
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!dirty || saveMutation.isPending}
                onClick={handleSalvar}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {editando && dirty && (
        <p className="text-xs text-[var(--color-atencao)]">
          Alterações pendentes — clique em Salvar para persistir no banco.
        </p>
      )}

      <QuadroWizardContent
        stepId={step.id as QuadroWizardStepId}
        documento={documento}
        alertas={editando ? alertasAtuais : []}
        stepTituloFallback={step.titulo}
        onQuadroChange={editando ? handleQuadroChange : undefined}
        onIrParaQuadro={irParaQuadro}
        modoConsulta={!editando}
      />

      <div className="flex justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={stepIdx === 0}
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
        >
          Quadro anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={stepIdx >= QUADROS_DETAIL_STEPS.length - 1}
          onClick={() => setStepIdx((i) => Math.min(QUADROS_DETAIL_STEPS.length - 1, i + 1))}
        >
          Próximo quadro
        </Button>
      </div>
    </div>
  );
}
