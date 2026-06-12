import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ArrowUpRight,
  FileCheck2,
  FileClock,
  FileWarning,
  FileCheck,
  Download,
  Building2,
} from "lucide-react";
import { useDashboardIndicators } from "@/features/dashboard/hooks";
import { useEmpreendimentosList } from "@/features/empreendimentos/hooks";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

const indicadorConfig = [
  { key: "total" as const, label: "Empreendimentos", icon: Building2, tone: "default" },
  { key: "emValidacao" as const, label: "Em validação", icon: FileClock, tone: "atencao" },
  { key: "geradas" as const, label: "Memoriais gerados", icon: FileCheck2, tone: "ceu" },
  { key: "pendentes" as const, label: "Pendentes de revisão", icon: FileWarning, tone: "alerta" },
  { key: "aprovados" as const, label: "Aprovados", icon: FileCheck, tone: "verde" },
  { key: "exportados" as const, label: "Exportados", icon: Download, tone: "default" },
];

function toneClass(tone: string) {
  switch (tone) {
    case "atencao":
      return "text-[oklch(0.45_0.13_85)] bg-[var(--color-atencao)]/15";
    case "ceu":
      return "text-[var(--color-ceu)] bg-[var(--color-ceu)]/10";
    case "alerta":
      return "text-[var(--color-alerta)] bg-[var(--color-alerta)]/10";
    case "verde":
      return "text-[var(--color-verde-escuro)] bg-[var(--color-verde)]/15";
    default:
      return "text-foreground bg-muted";
  }
}

function Dashboard() {
  const {
    data: indicadores,
    isLoading: loadingIndicadores,
    isError: erroIndicadores,
  } = useDashboardIndicators();
  const {
    data: empreendimentos,
    isLoading: loadingLista,
    isError: erroLista,
  } = useEmpreendimentosList();

  const recentes = (empreendimentos ?? []).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhamento técnico dos memoriais em andamento."
        action={
          <Button asChild>
            <Link to="/empreendimentos/novo">
              <Plus className="h-4 w-4" /> Novo empreendimento
            </Link>
          </Button>
        }
      />

      <div className="p-8 space-y-8 max-w-[1600px]">
        <section>
          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-3 font-medium">
            Indicadores operacionais
          </h2>
          {erroIndicadores && (
            <Card className="p-4 border-border shadow-none text-sm text-[var(--color-alerta)]">
              Não foi possível carregar os indicadores. Tente recarregar a página.
            </Card>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {loadingIndicadores
              ? indicadorConfig.map((i) => (
                  <Card key={i.key} className="p-4 border-border shadow-none">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-8 w-16 mt-4" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </Card>
                ))
              : indicadorConfig.map((i) => {
                  const Icon = i.icon;
                  const value = indicadores?.[i.key] ?? 0;
                  return (
                    <Card key={i.label} className="p-4 border-border shadow-none">
                      <div className="flex items-start justify-between">
                        <div
                          className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClass(i.tone)}`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.8} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl font-semibold tracking-tight text-mono-tabular">
                          {value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{i.label}</div>
                      </div>
                    </Card>
                  );
                })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">
                Empreendimentos recentes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Últimos memoriais com movimentação técnica.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/empreendimentos">
                Ver todos <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="border-border shadow-none overflow-hidden p-0">
            {erroLista ? (
              <div className="px-5 py-12 text-center text-sm text-[var(--color-alerta)]">
                Não foi possível carregar os empreendimentos.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Empreendimento</th>
                    <th className="text-left font-medium px-5 py-3">Incorporadora</th>
                    <th className="text-left font-medium px-5 py-3">Cidade / UF</th>
                    <th className="text-left font-medium px-5 py-3">Responsável</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                    <th className="text-left font-medium px-5 py-3">Atualizado</th>
                    <th className="text-right font-medium px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingLista &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3.5" colSpan={7}>
                          <Skeleton className="h-4 w-full" />
                        </td>
                      </tr>
                    ))}
                  {!loadingLista &&
                    recentes.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground">{e.nome}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{e.incorporadora}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {e.cidade}/{e.uf}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{e.responsavel}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={e.status} />
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-mono-tabular">
                          {e.atualizadoEm}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/empreendimentos/$id" params={{ id: e.idParam }}>
                              Abrir
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  {!loadingLista && recentes.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-muted-foreground"
                      >
                        Nenhum empreendimento cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
