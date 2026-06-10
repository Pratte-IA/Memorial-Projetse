import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { clausulas } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/_app/clausulas")({
  component: Clausulas,
});

const categorias = ["Todas", ...Array.from(new Set(clausulas.map((c) => c.categoria)))];

function Clausulas() {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todas");
  const [sel, setSel] = useState(clausulas[0]);

  const lista = clausulas.filter((c) => {
    const okB = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase());
    const okC = cat === "Todas" || c.categoria === cat;
    return okB && okC;
  });

  return (
    <>
      <PageHeader
        title="Biblioteca de Cláusulas"
        subtitle="Blocos de texto padrão da Projetse utilizados na composição dos memoriais."
        breadcrumb={[{ label: "Cláusulas" }]}
      />

      <div className="p-8 grid grid-cols-12 gap-5 max-w-[1600px]">
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card className="p-3 border-border shadow-none">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cláusula..." className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {categorias.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                    cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >{c}</button>
              ))}
            </div>
          </Card>

          <Card className="border-border shadow-none p-0 overflow-hidden divide-y divide-border">
            {lista.map((c) => (
              <button
                key={c.id}
                onClick={() => setSel(c)}
                className={`w-full text-left p-4 hover:bg-muted/40 transition-colors ${sel.id === c.id ? "bg-muted/60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{c.titulo}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{c.categoria}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                    c.status === "Publicada" ? "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)]" : "bg-muted text-muted-foreground"
                  }`}>{c.status}</span>
                </div>
              </button>
            ))}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Card className="border-border shadow-none p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{sel.categoria}</div>
              <h3 className="text-lg font-semibold mt-1">{sel.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-1">{sel.resumo}</p>
            </div>
            <div className="p-8 min-h-[400px] space-y-5">
              <div className="text-sm leading-7 text-foreground whitespace-pre-wrap">
                {renderTemplate(sel.template)}
              </div>
              {sel.variaveis.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    Variáveis preenchidas a partir do empreendimento
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sel.variaveis.map((v) => (
                      <code
                        key={v}
                        className="px-2 py-0.5 text-[11px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono"
                      >
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button variant="outline" size="sm">Duplicar</Button>
              <Button size="sm">Editar cláusula</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function renderTemplate(text: string) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) =>
    p.startsWith("{{") && p.endsWith("}}") ? (
      <code
        key={i}
        className="px-1.5 py-0.5 mx-0.5 text-[12px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono"
      >
        {p}
      </code>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

