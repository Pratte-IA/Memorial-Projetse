import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  Loader2,
} from "lucide-react";

import { createQuadroSignedUrl } from "../api";
import { useLatestQuadroTecnico } from "../hooks";
import { formatFileSize, formatUploadedAt } from "../utils";
import { QuadroIntegridadePanel } from "./quadro-integridade-panel";
import { EstadoBadge, type EstadoQuadroUi } from "./estado-badge";
import type { QuadroTecnicoRecord } from "../types";

interface QuadroTecnicoTabProps {
  empreendimentoId: number | null;
}

function mapStatusToUi(quadro: QuadroTecnicoRecord | null | undefined): EstadoQuadroUi {
  if (!quadro) return "vazio";
  if (quadro.status === "processando") return "extraindo";
  if (quadro.status === "processado") return "concluido";
  if (quadro.status === "erro") return "erro";
  return "enviado";
}

function QuadroFileIcon({ fileName, className }: { fileName: string; className?: string }) {
  const cls = className ?? "h-5 w-5";
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if ([".xlsx", ".xls", ".csv"].includes(ext)) {
    return <FileSpreadsheet className={`${cls} text-primary`} />;
  }
  return <FileType className={`${cls} text-[var(--color-alerta)]`} />;
}

export function QuadroTecnicoTab({ empreendimentoId }: QuadroTecnicoTabProps) {
  const [baixando, setBaixando] = useState(false);

  const { data: quadro, isLoading, isError, refetch } = useLatestQuadroTecnico(empreendimentoId);

  const estado = mapStatusToUi(quadro);

  const baixarArquivo = async () => {
    if (!quadro) return;

    setBaixando(true);
    try {
      const url = await createQuadroSignedUrl(quadro.storagePath);
      if (!url) {
        throw new Error("URL de download indisponível.");
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = quadro.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Não foi possível baixar o arquivo.", {
        description: "O arquivo pode não estar disponível no storage. Reimporte pelo fluxo Novo empreendimento.",
      });
    } finally {
      setBaixando(false);
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Quadro técnico disponível apenas para empreendimentos salvos no banco (ID numérico).
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border-border shadow-none space-y-4 max-w-3xl">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3 max-w-3xl">
        <p className="text-sm text-[var(--color-alerta)]">
          Não foi possível carregar o quadro técnico.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Card className="p-6 border-border shadow-none space-y-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={FileText}>Quadro técnico — NBR 12.721</SectionTitle>
          <EstadoBadge estado={estado} />
        </div>

        {!quadro ? (
          <div className="border border-dashed border-border rounded-lg p-12 text-center space-y-2">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
            <p className="text-sm font-medium">Nenhum quadro vinculado</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              O arquivo CFMD é enviado no fluxo{" "}
              <span className="font-medium text-foreground">Novo empreendimento</span> e aparece
              aqui automaticamente após a criação.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="h-12 w-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                <QuadroFileIcon fileName={quadro.fileName} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{quadro.fileName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(quadro.sizeBytes)} · importado em{" "}
                  {formatUploadedAt(quadro.createdAt)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Este arquivo compõe o anexo dos Quadros para Arquivo no Registro de Imóveis.
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={baixando}
                onClick={() => void baixarArquivo()}
              >
                {baixando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Baixar anexo
              </Button>
            </div>

            {estado === "erro" && (
              <div className="text-sm text-[var(--color-alerta)] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Erro no processamento do quadro. Reimporte pelo fluxo Novo empreendimento.
              </div>
            )}
          </div>
        )}
      </Card>

      <QuadroIntegridadePanel empreendimentoId={empreendimentoId} />
    </div>
  );
}
