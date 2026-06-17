import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageOrg } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/use-auth";
import { NovoTimbradoDialog } from "@/features/documentos/components/novo-timbrado-dialog";
import { getModeloSignedUrl } from "@/features/documentos/api";
import { useDeleteModelo, useModelos } from "@/features/documentos/hooks";
import type { ModeloRecord } from "@/features/documentos/types";

export const Route = createFileRoute("/_app/modelos")({
  component: Modelos,
});

function Modelos() {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const podeGerenciar = canManageOrg(membership?.role);

  const { data: modelos, isLoading, isError, refetch } = useModelos(orgId);
  const deleteMutation = useDeleteModelo(orgId);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [modeloExcluir, setModeloExcluir] = useState<ModeloRecord | null>(null);
  const [visualizandoId, setVisualizandoId] = useState<number | null>(null);

  const handleVisualizar = async (modelo: ModeloRecord) => {
    if (!modelo.storagePath) {
      toast.info("Este modelo ainda não possui arquivo de timbrado anexado.");
      return;
    }

    setVisualizandoId(modelo.id);
    try {
      const url = await getModeloSignedUrl(modelo.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível abrir o timbrado.");
    } finally {
      setVisualizandoId(null);
    }
  };

  const handleExcluir = async () => {
    if (!modeloExcluir) return;

    try {
      await deleteMutation.mutateAsync(modeloExcluir);
      toast.success("Modelo excluído.");
      setModeloExcluir(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o modelo.");
    }
  };

  return (
    <>
      <PageHeader
        title="Modelos de Documento"
        subtitle="Templates e timbrados usados pela esteira para gerar memoriais, cláusulas e descrições de unidades."
        breadcrumb={[{ label: "Modelos" }]}
        action={
          podeGerenciar && orgId ? (
            <Button onClick={() => setDialogAberto(true)}>
              <Plus className="h-4 w-4" />
              Novo timbrado
            </Button>
          ) : undefined
        }
      />
      <div className="p-8 max-w-[1600px]">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        )}

        {isError && (
          <Card className="p-8 border-border shadow-none text-center space-y-3">
            <p className="text-sm text-[var(--color-alerta)]">
              Não foi possível carregar os modelos.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(modelos ?? []).map((m) => (
              <Card
                key={m.id}
                className="p-5 border-border shadow-none hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-md bg-[var(--color-verde-escuro)]/10 text-[var(--color-verde-escuro)] flex items-center justify-center">
                    <FileText className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <StatusBadge status={m.status === "ativo" ? "Aprovado" : "Rascunho"} />
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-1">{m.nome}</h3>
                <p className="text-xs text-muted-foreground">{m.tipo}</p>
                {m.fileName && (
                  <p className="text-[11px] text-muted-foreground mt-2 truncate" title={m.fileName}>
                    Timbrado: {m.fileName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    Atualizado em {m.atualizadoEm}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={visualizandoId === m.id}
                      onClick={() => void handleVisualizar(m)}
                    >
                      {visualizandoId === m.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      Visualizar
                    </Button>
                    {podeGerenciar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-alerta)] hover:text-[var(--color-alerta)]"
                        onClick={() => setModeloExcluir(m)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {(modelos ?? []).length === 0 && (
              <Card className="p-8 border-border shadow-none col-span-full text-center space-y-3">
                <p className="text-sm text-muted-foreground">Nenhum modelo cadastrado.</p>
                {podeGerenciar && orgId && (
                  <Button variant="outline" size="sm" onClick={() => setDialogAberto(true)}>
                    <Plus className="h-4 w-4" />
                    Cadastrar primeiro timbrado
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      {orgId && (
        <NovoTimbradoDialog
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          organizationId={orgId}
        />
      )}

      <AlertDialog open={modeloExcluir !== null} onOpenChange={(open) => !open && setModeloExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              O modelo &quot;{modeloExcluir?.nome}&quot; será removido permanentemente
              {modeloExcluir?.hasTimbrado ? ", incluindo o arquivo de timbrado" : ""}. As cláusulas
              vinculadas permanecem na biblioteca, mas deixam de referenciar este modelo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--color-alerta)] hover:bg-[var(--color-alerta)]/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleExcluir();
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir modelo"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
