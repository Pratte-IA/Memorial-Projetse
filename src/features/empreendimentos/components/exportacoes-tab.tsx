import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import {
  useDownloadExportacao,
  useExportDocument,
  useExportacoes,
  usePendenciasBloqueantes,
} from "@/features/exportacoes/hooks";
import type { ExportFormato, ExportTipo } from "@/features/exportacoes/types";
import {
  AlertTriangle,
  Download,
  FileCheck2,
  FileDown,
  FileText,
  FileType,
  Loader2,
} from "lucide-react";

interface ExportacoesTabProps {
  empreendimentoId: number | null;
  empreendimentoNome: string;
}

export function ExportacoesTab({ empreendimentoId, empreendimentoNome }: ExportacoesTabProps) {
  const { membership, profile } = useAuth();
  const { data: exportacoes, isLoading: loadingExports } = useExportacoes(empreendimentoId);
  const { data: bloqueantes, isLoading: loadingPendencias } =
    usePendenciasBloqueantes(empreendimentoId);
  const exportMutation = useExportDocument(empreendimentoId);
  const downloadMutation = useDownloadExportacao();

  const bloqueado = (bloqueantes?.total ?? 0) > 0;

  const exportar = async (tipo: ExportTipo, formato: ExportFormato) => {
    if (!empreendimentoId || !membership || !profile) return;

    try {
      const record = await exportMutation.mutateAsync({
        empreendimentoId,
        empreendimentoNome,
        organizationId: membership.organization_id,
        profileId: profile.id,
        tipo,
        formato,
      });
      toast.success(`${record.fileName} exportado e salvo no storage.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível exportar.");
    }
  };

  const baixar = async (storagePath: string) => {
    try {
      await downloadMutation.mutateAsync(storagePath);
    } catch {
      toast.error("Não foi possível gerar o link de download.");
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Exportações disponíveis apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  const isLoading = loadingExports || loadingPendencias;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6 border-border shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-md bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Versão de revisão</h4>
              <p className="text-xs text-muted-foreground">
                Documento de trabalho para conferência interna.
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Inclui marcações de status das seções em revisão ou com pendência.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={exportMutation.isPending}
              onClick={() => void exportar("revisao", "docx")}
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              DOCX
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={exportMutation.isPending}
              onClick={() => void exportar("revisao", "pdf")}
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </Card>

        <Card className={`p-6 border-border shadow-none ${bloqueado ? "opacity-90" : ""}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-md bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Versão final</h4>
              <p className="text-xs text-muted-foreground">
                Documento aprovado para registro cartorial.
              </p>
            </div>
          </div>
          {bloqueado ? (
            <div className="text-xs text-[var(--color-alerta)] mb-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Exportação bloqueada: {bloqueantes?.total} pendência
                {bloqueantes && bloqueantes.total > 1 ? "s" : ""} bloqueante
                {bloqueantes && bloqueantes.total > 1 ? "s" : ""}.
              </div>
              {bloqueantes?.mensagens.slice(0, 2).map((m) => (
                <div key={m} className="pl-5 text-muted-foreground">
                  · {m}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mb-4">
              Nenhuma pendência bloqueante aberta. Pronto para exportação final.
            </div>
          )}
          <div className="flex gap-2">
            <Button
              disabled={bloqueado || exportMutation.isPending}
              className="flex-1"
              onClick={() => void exportar("final", "docx")}
            >
              <FileDown className="h-4 w-4" /> DOCX
            </Button>
            <Button
              disabled={bloqueado || exportMutation.isPending}
              className="flex-1"
              onClick={() => void exportar("final", "pdf")}
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>
      </div>

      <Card className="border-border shadow-none overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Histórico de exportações
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (exportacoes ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma exportação registrada ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {(exportacoes ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <FileType className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{a.fileName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-mono-tabular whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.createdByName}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={a.status === "exportado" ? "Exportado" : a.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={downloadMutation.isPending}
                      onClick={() => void baixar(a.storagePath)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
