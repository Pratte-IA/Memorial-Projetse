import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemorialTab } from "@/features/memorial/components/memorial-tab";
import type { EmpreendimentoView } from "../types";
import { fmtNum } from "@/lib/format";
import { AlertTriangle, Building2, Download, Hash, Ruler, Sparkles, Users } from "lucide-react";

import { EMPREENDIMENTO_DETAIL_ABAS } from "../constants/detail-mocks";
import type { EmpreendimentoDetailAba } from "../types/detail-types";
import { DadosValidadosTab } from "./dados-validados-tab";
import { Mini } from "./detail-ui";
import { ExportacoesTab } from "./exportacoes-tab";
import { HistoricoTab } from "./historico-tab";
import { VisaoGeralTab } from "./visao-geral-tab";

interface EmpreendimentoDetailPageProps {
  emp: EmpreendimentoView;
}

export function EmpreendimentoDetailPage({ emp }: EmpreendimentoDetailPageProps) {
  const [aba, setAba] = useState<EmpreendimentoDetailAba>("dados-validados");

  return (
    <>
      <PageHeader
        title={emp.nome}
        breadcrumb={[{ label: "Empreendimentos" }, { label: emp.nome }]}
        subtitle={`${emp.incorporadora} · ${emp.cidade}/${emp.uf}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={emp.status} />
            <Button
              variant="outline"
              onClick={() =>
                toast("Exportação simulada", { description: "Versão de revisão gerada." })
              }
            >
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button
              onClick={() => {
                setAba("memorial");
                toast.success("Memorial pronto para revisão.");
              }}
            >
              <Sparkles className="h-4 w-4" /> Gerar memorial
            </Button>
          </div>
        }
      />

      <div className="px-8 pt-6">
        <Card className="border-border shadow-none p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Mini icon={Building2} label="Torres" value={`${emp.torres}`} />
            <Mini icon={Hash} label="Pavimentos" value={`${emp.pavimentos}`} />
            <Mini icon={Users} label="Unidades" value={`${emp.unidades}`} />
            <Mini icon={Ruler} label="Área global" value={`${fmtNum(emp.areaGlobal, 2)} m²`} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Progresso da esteira
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-verde-claro)]"
                    style={{ width: `${emp.progresso}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-mono-tabular">{emp.progresso}%</span>
              </div>
              {emp.pendencias > 0 && (
                <div className="text-xs text-[var(--color-alerta)] mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {emp.pendencias} pendência
                  {emp.pendencias > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="px-8 pt-5">
        <div className="border-b border-border flex gap-1 overflow-x-auto">
          {EMPREENDIMENTO_DETAIL_ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAba(a.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                aba === a.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {aba === "dados-validados" && (
          <DadosValidadosTab
            empreendimentoId={/^\d+$/.test(emp.id) ? Number(emp.id) : null}
          />
        )}
        {aba === "visao" && <VisaoGeralTab emp={emp} />}
        {aba === "memorial" && (
          <MemorialTab
            empreendimentoId={/^\d+$/.test(emp.id) ? Number(emp.id) : null}
            empreendimentoNome={emp.nome}
          />
        )}
        {aba === "exportacoes" && (
          <ExportacoesTab
            empreendimentoId={/^\d+$/.test(emp.id) ? Number(emp.id) : null}
            empreendimentoNome={emp.nome}
          />
        )}
        {aba === "historico" && (
          <HistoricoTab empreendimentoId={/^\d+$/.test(emp.id) ? Number(emp.id) : null} />
        )}
      </div>
    </>
  );
}
