import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { modelos } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/modelos")({
  component: Modelos,
});

function Modelos() {
  return (
    <>
      <PageHeader
        title="Modelos de Documento"
        subtitle="Templates usados pela esteira para gerar memoriais, cláusulas e descrições de unidades."
        breadcrumb={[{ label: "Modelos" }]}
      />
      <div className="p-8 max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modelos.map((m) => (
            <Card key={m.id} className="p-5 border-border shadow-none hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-md bg-[var(--color-verde-escuro)]/10 text-[var(--color-verde-escuro)] flex items-center justify-center">
                  <FileText className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <StatusBadge status={m.status === "Ativo" ? "Aprovado" : "Rascunho"} />
              </div>
              <h3 className="font-semibold text-sm leading-tight mb-1">{m.nome}</h3>
              <p className="text-xs text-muted-foreground">{m.tipo}</p>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                <span className="text-[11px] text-muted-foreground">Atualizado em {m.atualizadoEm}</span>
                <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Visualizar</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
