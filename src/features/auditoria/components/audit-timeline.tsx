import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditEventRecord } from "../types";

interface AuditTimelineProps {
  events: AuditEventRecord[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  emptyMessage?: string;
  showEmpreendimento?: boolean;
}

export function AuditTimeline({
  events,
  isLoading,
  isError,
  emptyMessage = "Nenhum evento registrado.",
  showEmpreendimento = false,
}: AuditTimelineProps) {
  if (isLoading) {
    return (
      <Card className="p-8 border-border shadow-none space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-[var(--color-alerta)]">
        Não foi possível carregar o histórico.
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <Card className="p-8 border-border shadow-none">
      <ol className="relative border-l-2 border-border ml-2 space-y-6">
        {events.map((h) => {
          const d = new Date(h.createdAt);
          const data = d.toLocaleDateString("pt-BR");
          const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

          return (
            <li key={h.id} className="pl-6 relative">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-card border-2 border-[var(--color-verde-claro)]" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <span className="text-xs text-mono-tabular text-muted-foreground">
                  {data} · {hora}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--color-verde-escuro)] font-medium">
                  {h.userName}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  {h.eventTypeLabel}
                </span>
                {showEmpreendimento && h.empreendimentoNome && (
                  <span className="text-[10px] text-muted-foreground">{h.empreendimentoNome}</span>
                )}
              </div>
              <p className="text-sm text-foreground">{h.description}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
