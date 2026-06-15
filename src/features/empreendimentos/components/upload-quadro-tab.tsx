import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuth } from "@/features/auth/use-auth";
import { ACCEPTED_QUADRO_EXTENSIONS } from "@/features/quadro-nbr/constants";
import { parseQuadroNbrFile } from "@/features/quadro-nbr/parser";
import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";
import { createQuadroSignedUrl } from "@/features/quadros-tecnicos/api";
import { quadroTecnicoQueryKey, useLatestQuadroTecnico } from "@/features/quadros-tecnicos/hooks";
import { resolveQuadroContentType } from "@/features/quadros-tecnicos/mime";
import { formatFileSize, formatUploadedAt } from "@/features/quadros-tecnicos/utils";

import { prontidaoExportacaoQueryKey } from "../hooks";
import { replaceEmpreendimentoQuadro } from "../replace-quadro";
import type { ArquivoQuadroImportado } from "../types";

function dadosValidadosQueryKey(empreendimentoId: number) {
  return ["dados-validados", empreendimentoId] as const;
}

interface UploadQuadroTabProps {
  empreendimentoId: number | null;
}

export function UploadQuadroTab({ empreendimentoId }: UploadQuadroTabProps) {
  const { membership, profile } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [baixando, setBaixando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [arquivoPendente, setArquivoPendente] = useState<ArquivoQuadroImportado | null>(null);
  const [documentoPendente, setDocumentoPendente] = useState<DocumentoNbrExtraido | null>(null);
  const [confirmarSubstituicao, setConfirmarSubstituicao] = useState(false);

  const { data: quadroArquivo, isLoading, isError, refetch } = useLatestQuadroTecnico(
    empreendimentoId,
  );

  const temAlteracaoPendente = arquivoPendente !== null && documentoPendente !== null;

  const substituirMutation = useMutation({
    mutationFn: async () => {
      if (
        !empreendimentoId ||
        !membership ||
        !profile ||
        !arquivoPendente ||
        !documentoPendente
      ) {
        throw new Error("Dados insuficientes para substituir o quadro.");
      }

      await replaceEmpreendimentoQuadro({
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        documento: documentoPendente,
        arquivo: arquivoPendente,
        quadroAtual: quadroArquivo ?? null,
      });
    },
    onSuccess: () => {
      setArquivoPendente(null);
      setDocumentoPendente(null);
      setConfirmarSubstituicao(false);
      toast.success("Quadro substituído.", {
        description: "O arquivo foi atualizado e os dados do empreendimento foram reimportados.",
      });

      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: quadroTecnicoQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({ queryKey: dadosValidadosQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({
          queryKey: ["empreendimentos", "detail", empreendimentoId],
        });
        void queryClient.invalidateQueries({ queryKey: prontidaoExportacaoQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({ queryKey: ["unidades", empreendimentoId] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível substituir o quadro.");
    },
  });

  const limparPendente = () => {
    setArquivoPendente(null);
    setDocumentoPendente(null);
    if (fileRef.current) fileRef.current.value = "";
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

      const parsed = await parseQuadroNbrFile(
        new File([buffer], importado.name, { type: importado.type }),
      );

      setArquivoPendente(importado);
      setDocumentoPendente(parsed);
      toast.success("Arquivo processado", {
        description: `${parsed.quadros.length} seções extraídas. Confirme a substituição para aplicar.`,
      });
    } catch (error) {
      toast.error("Falha ao processar arquivo", {
        description: error instanceof Error ? error.message : "Verifique o formato do quadro.",
      });
      limparPendente();
    } finally {
      setProcessando(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleArquivo(file);
  };

  const baixarAnexo = async () => {
    if (!quadroArquivo) return;
    setBaixando(true);
    try {
      const url = await createQuadroSignedUrl(quadroArquivo.storagePath);
      if (!url) throw new Error("URL indisponível");
      const link = document.createElement("a");
      link.href = url;
      link.download = quadroArquivo.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Não foi possível baixar o arquivo.");
    } finally {
      setBaixando(false);
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Upload do quadro disponível apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar o quadro técnico vinculado.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  const arquivoExibido = temAlteracaoPendente ? arquivoPendente : quadroArquivo;
  const nomeArquivo = temAlteracaoPendente
    ? arquivoPendente!.name
    : quadroArquivo?.fileName;
  const tamanhoArquivo = temAlteracaoPendente
    ? arquivoPendente!.size
    : quadroArquivo?.sizeBytes;
  const dataArquivo = temAlteracaoPendente ? null : quadroArquivo?.createdAt;

  return (
    <div className="max-w-6xl space-y-5">
      <Card className="p-4 border-[var(--color-verde-claro)]/40 bg-[var(--color-verde-claro)]/5 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-verde-escuro)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-verde-escuro)]">
                {temAlteracaoPendente
                  ? "Novo arquivo selecionado — confirme a substituição"
                  : quadroArquivo
                    ? "Quadros validados — edição habilitada"
                    : "Nenhum quadro vinculado"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {temAlteracaoPendente
                  ? "O arquivo atual será removido e substituído pelo novo. Os dados do empreendimento serão reimportados."
                  : quadroArquivo
                    ? "Baixe o anexo ou envie um novo arquivo CFMD para substituir o quadro vinculado."
                    : "Envie o arquivo CFMD no padrão NBR 12.721 para vincular ao empreendimento."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {temAlteracaoPendente ? (
              <>
                <Button size="sm" variant="outline" onClick={limparPendente}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Descartar
                </Button>
                <Button
                  size="sm"
                  disabled={substituirMutation.isPending}
                  onClick={() => setConfirmarSubstituicao(true)}
                >
                  {substituirMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Confirmar substituição
                </Button>
              </>
            ) : (
              quadroArquivo && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={baixando}
                  onClick={() => void baixarAnexo()}
                >
                  {baixando ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Baixar anexo
                </Button>
              )
            )}
          </div>
        </div>
      </Card>

      {arquivoExibido && nomeArquivo && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
          <FileSpreadsheet className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium text-foreground">{nomeArquivo}</span>
          <span>·</span>
          <span>{formatFileSize(tamanhoArquivo)}</span>
          {dataArquivo && (
            <>
              <span>·</span>
              <span>importado em {formatUploadedAt(dataArquivo)}</span>
            </>
          )}
          {temAlteracaoPendente && (
            <>
              <span>·</span>
              <span className="text-[var(--color-atencao)]">aguardando confirmação</span>
            </>
          )}
        </div>
      )}

      <Card className="p-8 border-border shadow-none">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !processando && fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/30 transition"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleArquivo(file);
            }}
          />
          {processando ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm">Extraindo quadros NBR 12.721...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {quadroArquivo
                    ? "Arraste o novo quadro CFMD aqui ou clique para selecionar"
                    : "Arraste o quadro CFMD aqui ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aceita .xlsx, .xls ou .csv · substitui o arquivo atual após confirmação
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={confirmarSubstituicao} onOpenChange={setConfirmarSubstituicao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir quadro técnico?</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo{" "}
              <span className="font-medium text-foreground">
                {quadroArquivo?.fileName ?? "atual"}
              </span>{" "}
              será removido e substituído por{" "}
              <span className="font-medium text-foreground">{arquivoPendente?.name}</span>. Os
              dados extraídos do empreendimento serão atualizados com base no novo arquivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={substituirMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={substituirMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void substituirMutation.mutateAsync();
              }}
            >
              {substituirMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Substituindo...
                </>
              ) : (
                "Confirmar substituição"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
