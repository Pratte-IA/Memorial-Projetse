import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { historico } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/historico")({
  component: Historico,
});

function Historico() {
  return (
    <>
      <PageHeader
        title="Histórico"
        subtitle="Rastreabilidade completa de eventos da esteira de memoriais."
        breadcrumb={[{ label: "Histórico" }]}
      />
      <div className="p-8 max-w-4xl">
        <Card className="p-8 border-border shadow-none">
          <ol className="relative border-l-2 border-border ml-2 space-y-6">
            {historico.map((h, i) => (
              <li key={i} className="pl-6 relative">
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-card border-2 border-[var(--color-verde-claro)]" />
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs text-mono-tabular text-muted-foreground">{h.data} · {h.hora}</span>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-verde-escuro)] font-medium">{h.usuario}</span>
                </div>
                <p className="text-sm text-foreground">{h.descricao}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
