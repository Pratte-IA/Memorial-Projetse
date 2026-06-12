import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import { useModelos } from "@/features/documentos/hooks";
import { FileText, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/modelos")({
  component: Modelos,
});

function Modelos() {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const { data: modelos, isLoading, isError, refetch } = useModelos(orgId);

  return (
    <>
      <PageHeader
        title="Modelos de Documento"
        subtitle="Templates usados pela esteira para gerar memoriais, cláusulas e descrições de unidades."
        breadcrumb={[{ label: "Modelos" }]}
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
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    Atualizado em {m.atualizadoEm}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3.5 w-3.5" /> Visualizar
                  </Button>
                </div>
              </Card>
            ))}
            {(modelos ?? []).length === 0 && (
              <Card className="p-8 border-border shadow-none col-span-full text-center text-sm text-muted-foreground">
                Nenhum modelo cadastrado.
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
