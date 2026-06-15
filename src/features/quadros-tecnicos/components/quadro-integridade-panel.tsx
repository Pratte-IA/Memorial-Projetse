import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import { useProntidaoExportacao } from "@/features/empreendimentos/hooks";
import { getQuadroStatusLabel } from "@/features/empreendimentos/integridade-quadros";
import type { QuadroBlocoStatusUi } from "@/features/empreendimentos/types/prontidao-types";
import type { QuadroBlocoIntegridade } from "@/features/empreendimentos/types/prontidao-types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Layers,
  MinusCircle,
} from "lucide-react";

interface QuadroIntegridadePanelProps {
  empreendimentoId: number | null;
}

function StatusIcon({ status }: { status: QuadroBlocoStatusUi }) {
  switch (status) {
    case "validado":
      return <CheckCircle2 className="h-4 w-4 text-[var(--color-verde-escuro)] shrink-0" />;
    case "extraido":
      return <Clock className="h-4 w-4 text-[var(--color-ceu)] shrink-0" />;
    case "parcial":
      return <Circle className="h-4 w-4 text-[var(--color-atencao)] shrink-0" />;
    case "pendente":
      return <AlertTriangle className="h-4 w-4 text-[var(--color-alerta)] shrink-0" />;
    case "ausente":
      return <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function statusBadgeClass(status: QuadroBlocoStatusUi): string {
  switch (status) {
    case "validado":
      return "bg-[var(--color-verde-claro)]/15 text-[var(--color-verde-escuro)]";
    case "extraido":
      return "bg-[var(--color-ceu)]/12 text-[var(--color-ceu)]";
    case "parcial":
      return "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)]";
    case "pendente":
      return "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)]";
    case "ausente":
      return "bg-muted text-muted-foreground";
  }
}

function QuadroRow({ quadro }: { quadro: QuadroBlocoIntegridade }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <StatusIcon status={quadro.status} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{quadro.titulo}</div>
          <div className="text-xs text-muted-foreground truncate">{quadro.clausulaRef}</div>
        </div>
        <span
          className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadgeClass(quadro.status)}`}
        >
          {getQuadroStatusLabel(quadro.status)}
        </span>
        {aberto ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {aberto && (
        <div className="px-4 pb-3 pl-11 space-y-1.5 text-xs text-muted-foreground">
          <div className="sm:hidden">
            <span
              className={`inline text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeClass(quadro.status)}`}
            >
              {getQuadroStatusLabel(quadro.status)}
            </span>
          </div>
          {quadro.totalCampos > 0 && (
            <div>
              Campos confirmados:{" "}
              <span className="text-foreground font-medium text-mono-tabular">
                {quadro.camposConfirmados}/{quadro.totalCampos}
              </span>
            </div>
          )}
          {quadro.detalhe && <div>{quadro.detalhe}</div>}
          {quadro.validatedAt && (
            <div>
              Última validação:{" "}
              {new Date(quadro.validatedAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {quadro.status === "ausente" && (
            <div className="text-[var(--color-atencao)]">
              Bloco não presente nesta variante do quadro. Confira se o empreendimento usa outra
              aba equivalente.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuadroIntegridadePanel({ empreendimentoId }: QuadroIntegridadePanelProps) {
  const { data, isLoading, isError, refetch } = useProntidaoExportacao(empreendimentoId);

  if (empreendimentoId === null) return null;

  if (isLoading) {
    return (
      <Card className="p-6 border-border shadow-none space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6 border-border shadow-none text-center space-y-3">
        <p className="text-sm text-[var(--color-alerta)]">Não foi possível carregar a integridade.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  const pct =
    data.quadrosTotal > 0
      ? Math.round((data.quadrosValidados / data.quadrosTotal) * 100)
      : 0;

  return (
    <Card className="border-border shadow-none overflow-hidden p-0">
      <div className="p-5 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle icon={Layers}>Integridade dos quadros validados</SectionTitle>
          <span className="text-sm font-semibold text-mono-tabular shrink-0">
            {data.quadrosValidados}/{data.quadrosTotal}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada bloco NBR alimenta cláusulas do memorial e compõe o anexo técnico. Somente dados
          confirmados entram na geração do documento.
        </p>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-verde-claro)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div>
        {data.quadros.map((q) => (
          <QuadroRow key={q.bloco} quadro={q} />
        ))}
      </div>
    </Card>
  );
}
