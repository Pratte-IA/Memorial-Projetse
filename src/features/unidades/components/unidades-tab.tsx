import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import { Chip, KpiCard } from "@/features/empreendimentos/components/detail-ui";
import { fmtNum } from "@/lib/format";
import { AlertTriangle, Check, CheckCircle2, Edit3, Loader2, Search } from "lucide-react";

import { computeResumo } from "../mappers";
import { useUnidades, useUpdateUnidadeStatus, useValidarUnidadesEmMassa } from "../hooks";
import { UNIDADE_STATUS_FILTROS, statusLabelToDb } from "../status";
import type { UnidadeRecord } from "../types";
import { UnidadeDrawer } from "./unidade-drawer";

interface UnidadesTabProps {
  empreendimentoId: number | null;
  empreendimentoNome: string;
}

const PAGE_SIZE = 30;

export function UnidadesTab({ empreendimentoId, empreendimentoNome }: UnidadesTabProps) {
  const { membership, profile } = useAuth();
  const { data: unidades, isLoading, isError, refetch } = useUnidades(empreendimentoId);
  const statusMutation = useUpdateUnidadeStatus(empreendimentoId);
  const massaMutation = useValidarUnidadesEmMassa(empreendimentoId);

  const [filtroTorre, setFiltroTorre] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(0);
  const [selecionada, setSelecionada] = useState<UnidadeRecord | null>(null);

  const torres = useMemo(() => {
    const set = new Set((unidades ?? []).map((u) => u.torre));
    return ["Todas", ...Array.from(set).sort()];
  }, [unidades]);

  const dbStatusFiltro = statusLabelToDb(filtroStatus);

  const lista = useMemo(() => {
    return (unidades ?? []).filter((u) => {
      const okTorre = filtroTorre === "Todas" || u.torre === filtroTorre;
      const okStatus = !dbStatusFiltro || u.status === dbStatusFiltro;
      const okBusca = !busca || u.nome.toLowerCase().includes(busca.toLowerCase());
      return okTorre && okStatus && okBusca;
    });
  }, [unidades, filtroTorre, dbStatusFiltro, busca]);

  const totais = useMemo(() => computeResumo(unidades ?? []), [unidades]);

  const paginada = lista.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));

  const validarUnidade = async (id: number, nome: string) => {
    if (!empreendimentoId || !membership || !profile) return;

    try {
      await statusMutation.mutateAsync({
        ids: [id],
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        status: "validado",
        descricaoAuditoria: `Unidade "${nome}" validada.`,
      });
      toast.success("Unidade validada.");
    } catch {
      toast.error("Não foi possível validar a unidade.");
    }
  };

  const validarPendentesVisiveis = async () => {
    if (!empreendimentoId || !membership || !profile) return;

    const ids = lista.filter((u) => u.status === "pendente").map((u) => u.id);
    if (ids.length === 0) {
      toast.message("Nenhuma unidade pendente na lista filtrada.");
      return;
    }

    try {
      const count = await massaMutation.mutateAsync({
        ids,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
      toast.success(`${count} unidade(s) validada(s) em massa.`);
    } catch {
      toast.error("Não foi possível validar em massa.");
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Unidades disponíveis apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3">
        <p className="text-sm text-[var(--color-alerta)]">Não foi possível carregar as unidades.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  if (!unidades || unidades.length === 0) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Nenhuma unidade cadastrada para este empreendimento.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total" value={`${totais.total}`} />
        <KpiCard label="Validadas" value={`${totais.validado}`} tone="verde" />
        <KpiCard label="Pendentes" value={`${totais.pendente}`} tone="atencao" />
        <KpiCard label="Inconsistências" value={`${totais.inconsistencia}`} tone="alerta" />
      </div>

      <Card className="p-4 border-border shadow-none">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar unidade..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(0);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {torres.map((t) => (
              <Chip
                key={t}
                ativo={filtroTorre === t}
                onClick={() => {
                  setFiltroTorre(t);
                  setPagina(0);
                }}
              >
                {t}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {UNIDADE_STATUS_FILTROS.map((s) => (
              <Chip
                key={s.label}
                ativo={filtroStatus === s.label}
                onClick={() => {
                  setFiltroStatus(s.label);
                  setPagina(0);
                }}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-border shadow-none p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Unidade</th>
              <th className="text-left font-medium px-4 py-3">Torre</th>
              <th className="text-left font-medium px-4 py-3">Pavimento</th>
              <th className="text-left font-medium px-4 py-3">Tipo</th>
              <th className="text-right font-medium px-4 py-3">Privativa (m²)</th>
              <th className="text-right font-medium px-4 py-3">Comum (m²)</th>
              <th className="text-right font-medium px-4 py-3">Total (m²)</th>
              <th className="text-left font-medium px-4 py-3">Fração</th>
              <th className="text-left font-medium px-4 py-3">Vaga</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-center font-medium px-4 py-3 w-16">Validar</th>
              <th className="text-right font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginada.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{u.nome}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.torre}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.pavimento}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.tipo}</td>
                <td className="px-4 py-2.5 text-right text-mono-tabular">
                  {fmtNum(u.areaPrivativa, 3)}
                </td>
                <td className="px-4 py-2.5 text-right text-mono-tabular">
                  {fmtNum(u.areaComum, 3)}
                </td>
                <td className="px-4 py-2.5 text-right text-mono-tabular font-medium">
                  {fmtNum(u.areaTotal, 3)}
                </td>
                <td className="px-4 py-2.5 text-mono-tabular">{u.fracao}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.vaga}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-2.5 text-center">
                  {u.status !== "validado" ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-[var(--color-verde)]/10 hover:text-[var(--color-verde)]"
                      onClick={() => void validarUnidade(u.id, u.nome)}
                      disabled={statusMutation.isPending}
                      title="Validar unidade"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-verde)] mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setSelecionada(u)}>
                    <Edit3 className="h-3.5 w-3.5" /> Revisar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Mostrando {paginada.length} de {lista.length} unidades
            {lista.length !== totais.total ? ` (${totais.total} no total)` : ""}
          </span>
          <div className="flex items-center gap-2">
            {totalPaginas > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagina === 0}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-mono-tabular">
                  {pagina + 1}/{totalPaginas}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagina >= totalPaginas - 1}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={massaMutation.isPending}
              onClick={() => void validarPendentesVisiveis()}
            >
              {massaMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              Validar pendentes
            </Button>
          </div>
        </div>
      </Card>

      {selecionada && empreendimentoId && (
        <UnidadeDrawer
          unidade={selecionada}
          empreendimentoId={empreendimentoId}
          empreendimentoNome={empreendimentoNome}
          onClose={() => setSelecionada(null)}
        />
      )}
    </div>
  );
}
