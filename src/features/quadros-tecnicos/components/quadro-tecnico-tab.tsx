import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import { ResumoItem, SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import type { Empreendimento } from "@/lib/mock-data";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  FileType,
  Hash,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";

import { MAX_QUADRO_FILE_BYTES, QUADRO_ACCEPTED_MIME, EXTRACAO_ETAPAS } from "../constants";
import {
  useLatestQuadroTecnico,
  useProcessarQuadroTecnico,
  useUploadQuadroTecnico,
} from "../hooks";
import type { QuadroTecnicoRecord } from "../types";
import { formatFileSize, formatUploadedAt } from "../utils";
import { EstadoBadge, type EstadoQuadroUi } from "./estado-badge";

interface QuadroTecnicoTabProps {
  emp: Empreendimento;
  empreendimentoId: number | null;
  onConcluir: () => void;
}

function mapStatusToUi(
  quadro: QuadroTecnicoRecord | null | undefined,
  isProcessingLocally: boolean,
): EstadoQuadroUi {
  if (!quadro) return "vazio";
  if (isProcessingLocally || quadro.status === "processando") return "extraindo";
  if (quadro.status === "processado") return "concluido";
  if (quadro.status === "erro") return "erro";
  return "enviado";
}

export function QuadroTecnicoTab({ emp, empreendimentoId, onConcluir }: QuadroTecnicoTabProps) {
  const { membership, profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState(0);
  const [processandoLocal, setProcessandoLocal] = useState(false);

  const { data: quadro, isLoading, isError, refetch } = useLatestQuadroTecnico(empreendimentoId);
  const uploadMutation = useUploadQuadroTecnico(empreendimentoId);
  const processarMutation = useProcessarQuadroTecnico(empreendimentoId);

  const estado = mapStatusToUi(quadro, processandoLocal || processarMutation.isPending);
  const concluido = estado === "concluido";
  const extraindo = estado === "extraindo";

  const progresso = concluido
    ? 100
    : extraindo
      ? Math.min(100, Math.round(((etapa + 1) / EXTRACAO_ETAPAS.length) * 100))
      : 0;

  useEffect(() => {
    if (!extraindo) {
      setEtapa(0);
      return;
    }

    setEtapa(0);
    const id = setInterval(() => {
      setEtapa((current) => Math.min(current + 1, EXTRACAO_ETAPAS.length - 1));
    }, 700);

    return () => clearInterval(id);
  }, [extraindo]);

  const validateFile = (file: File): string | null => {
    if (file.type !== QUADRO_ACCEPTED_MIME && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Envie apenas arquivos PDF.";
    }
    if (file.size > MAX_QUADRO_FILE_BYTES) {
      return "O arquivo excede o limite de 50 MB.";
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      if (!empreendimentoId || !membership || !profile) {
        toast.error("Não foi possível enviar o arquivo.", {
          description: "Empreendimento ou sessão inválidos.",
        });
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      try {
        await uploadMutation.mutateAsync({
          file,
          empreendimentoId,
          organizationId: membership.organization_id,
          profileId: profile.id,
        });
        toast.success("Quadro técnico enviado", { description: file.name });
      } catch {
        toast.error("Falha no upload", { description: "Verifique o arquivo e tente novamente." });
      }
    },
    [empreendimentoId, membership, profile, uploadMutation],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  };

  const iniciarExtracao = async () => {
    if (!quadro || !empreendimentoId || !membership) return;

    setProcessandoLocal(true);
    try {
      await processarMutation.mutateAsync({
        quadroId: quadro.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        unidadesCount: emp.unidades,
      });
      toast.success(`Extração concluída — ${emp.unidades} unidades identificadas.`);
    } catch {
      toast.error("Falha no processamento do quadro.");
    } finally {
      setProcessandoLocal(false);
    }
  };

  const camposBaixaConfianca = [
    { campo: "Área privativa total", origem: "Quadro IV-A · linha 12", confianca: 62 },
    { campo: "Alvará nº", origem: "Cabeçalho do PDF", confianca: 71 },
    { campo: "Fração ideal — unidade 101", origem: "Quadro II · linha 03", confianca: 58 },
  ];

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Upload disponível apenas para empreendimentos salvos no banco (ID numérico).
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 border-border shadow-none space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-40 w-full" />
        </Card>
        <Card className="p-6 border-border shadow-none">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full mt-4" />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3">
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onFileChange}
      />

      <Card className="lg:col-span-2 p-6 border-border shadow-none space-y-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={UploadCloud}>Upload do quadro técnico — NBR 12.721</SectionTitle>
          <EstadoBadge estado={estado} />
        </div>

        {estado === "vazio" && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            disabled={uploadMutation.isPending}
            className="w-full border-2 border-dashed border-border rounded-lg p-12 hover:border-primary hover:bg-muted/30 transition-colors text-center disabled:opacity-60"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-spin" />
            ) : (
              <UploadCloud
                className="h-10 w-10 text-muted-foreground mx-auto mb-3"
                strokeWidth={1.5}
              />
            )}
            <div className="text-sm font-medium">
              {uploadMutation.isPending
                ? "Enviando arquivo..."
                : "Arraste o PDF do quadro técnico ou clique para enviar"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              PDF · até 50 MB · padrão NBR 12.721
            </div>
          </button>
        )}

        {quadro && estado !== "vazio" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="h-12 w-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                <FileType className="h-5 w-5 text-[var(--color-alerta)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{quadro.fileName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(quadro.sizeBytes)} · enviado em{" "}
                  {formatUploadedAt(quadro.createdAt)}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={uploadMutation.isPending || extraindo}
                onClick={() => fileRef.current?.click()}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Substituir
              </Button>
            </div>

            {(extraindo || concluido) && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    {concluido ? "Leitura concluída" : EXTRACAO_ETAPAS[etapa]}
                  </span>
                  <span className="font-semibold text-mono-tabular">{progresso}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-verde-claro)] transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            )}

            {(extraindo || concluido) && (
              <div className="border border-border rounded-lg p-4 space-y-2 bg-card">
                {EXTRACAO_ETAPAS.map((e, i) => (
                  <div
                    key={e}
                    className={`flex items-center gap-2.5 text-sm ${
                      i <= etapa ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {i < etapa || (concluido && i === EXTRACAO_ETAPAS.length - 1) ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-verde-claro)]" />
                    ) : i === etapa && extraindo ? (
                      <Clock className="h-4 w-4 text-[var(--color-ceu)] animate-pulse" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border" />
                    )}
                    {e}
                  </div>
                ))}
              </div>
            )}

            {concluido && (
              <div className="border border-border rounded-lg p-5 bg-card space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-verde-claro)]" />
                    <h4 className="text-sm font-semibold">Resumo da extração</h4>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {quadro.processedAt ? formatUploadedAt(quadro.processedAt) : "Concluído"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResumoItem
                    icon={Users}
                    label="Unidades identificadas"
                    value={`${emp.unidades}`}
                  />
                  <ResumoItem icon={Building2} label="Torres" value={`${emp.torres}`} />
                  <ResumoItem icon={Hash} label="Pavimentos" value={`${emp.pavimentos}`} />
                  <ResumoItem icon={FileCheck2} label="Vagas" value={`${emp.vagas}`} />
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-atencao)]" />
                      <h5 className="text-xs font-semibold uppercase tracking-wider">
                        Campos com baixa confiança
                      </h5>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {camposBaixaConfianca.length} itens
                    </span>
                  </div>
                  <div className="space-y-2">
                    {camposBaixaConfianca.map((c) => (
                      <div
                        key={c.campo}
                        className="flex items-center justify-between gap-3 p-2.5 border border-border rounded-md bg-muted/20"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.campo}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{c.origem}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-mono-tabular px-2 py-0.5 rounded bg-[var(--color-atencao)]/15 text-[var(--color-atencao)] shrink-0">
                          {c.confianca}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {estado === "erro" && (
              <div className="text-sm text-[var(--color-alerta)] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Erro no processamento. Envie o arquivo novamente ou tente extrair outra vez.
              </div>
            )}

            <div className="flex justify-end gap-2">
              {estado === "enviado" && (
                <Button onClick={iniciarExtracao} disabled={processarMutation.isPending}>
                  {processarMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Extraindo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Extrair dados
                    </>
                  )}
                </Button>
              )}
              {concluido && (
                <Button onClick={onConcluir}>
                  Revisar dados extraídos <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 border-border shadow-none">
        <SectionTitle icon={FileText}>Preview do documento</SectionTitle>
        <div className="mt-4 aspect-[3/4] bg-gradient-to-b from-muted to-card border border-border rounded-md flex flex-col items-center justify-center text-muted-foreground p-4">
          <FileType className="h-10 w-10 mb-3" strokeWidth={1.3} />
          <div className="text-xs text-center">
            {quadro
              ? `Arquivo armazenado: ${quadro.fileName}`
              : "Envie o arquivo para pré-visualizar"}
          </div>
        </div>
      </Card>
    </div>
  );
}
