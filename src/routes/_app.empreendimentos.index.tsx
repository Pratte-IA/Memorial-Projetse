import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { empreendimentos } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/_app/empreendimentos/")({
  component: Empreendimentos,
});

const statusFiltros = ["Todos", "Em revisão", "Dados extraídos", "Pronto para gerar", "Aprovado"];

function Empreendimentos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const lista = empreendimentos.filter((e) => {
    const okBusca = !busca || e.nome.toLowerCase().includes(busca.toLowerCase()) || e.incorporadora.toLowerCase().includes(busca.toLowerCase());
    const okStatus = filtro === "Todos" || e.status === filtro;
    return okBusca && okStatus;
  });

  return (
    <>
      <PageHeader
        title="Empreendimentos"
        subtitle="Todos os memoriais cadastrados na esteira da Projetse."
        breadcrumb={[{ label: "Empreendimentos" }]}
        action={
          <Button asChild>
            <Link to="/empreendimentos/novo"><Plus className="h-4 w-4" /> Novo empreendimento</Link>
          </Button>
        }
      />

      <div className="p-8 space-y-5 max-w-[1600px]">
        <Card className="p-4 border-border shadow-none">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por empreendimento ou incorporadora..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statusFiltros.map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltro(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    filtro === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border shadow-none overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">Empreendimento</th>
                <th className="text-left font-medium px-5 py-3">Incorporadora</th>
                <th className="text-left font-medium px-5 py-3">Cidade</th>
                <th className="text-left font-medium px-5 py-3">Unidades</th>
                <th className="text-left font-medium px-5 py-3">Progresso</th>
                <th className="text-left font-medium px-5 py-3">Pendências</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to="/empreendimentos/$id" params={{ id: e.id }} className="font-medium text-foreground hover:text-primary">
                      {e.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.incorporadora}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.cidade}/{e.uf}</td>
                  <td className="px-5 py-3.5 text-mono-tabular">{e.unidades}</td>
                  <td className="px-5 py-3.5 w-48">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-verde-claro)]"
                          style={{ width: `${e.progresso}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground text-mono-tabular w-9 text-right">{e.progresso}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {e.pendencias > 0 ? (
                      <span className="text-xs font-medium text-[var(--color-alerta)]">{e.pendencias} pendência{e.pendencias > 1 ? "s" : ""}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/empreendimentos/$id" params={{ id: e.id }}>Abrir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhum empreendimento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
