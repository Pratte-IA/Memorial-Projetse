import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import { useProntidaoExportacao } from "@/features/empreendimentos/hooks";
import type {
  ProntidaoGrupo,
  ProntidaoItem,
  ProntidaoItemStatus,
} from "@/features/empreendimentos/types/prontidao-types";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  FileStack,
  HelpCircle,
  Users,
} from "lucide-react";

interface ProntidaoExportacaoPanelProps {
  empreendimentoId: number | null;
  compact?: boolean;
}

const GRUPO_LABELS: Record<ProntidaoGrupo, string> = {
  cadastro: "Cadastro jurídico",
  quadros: "Dados técnicos (quadros)",
  unidades: "Unidades autônomas",
  memorial: "Memorial",
  anexo: "Anexo e integridade",
};

const GRUPO_ICONS: Record<ProntidaoGrupo, React.ElementType> = {
  cadastro: ClipboardCheck,
  quadros: FileStack,
  unidades: Users,
  memorial: CheckCircle2,
  anexo: FileStack,
};

function StatusDot({ status }: { status: ProntidaoItemStatus }) {
  const cls =
    status === "ok"
      ? "bg-[var(--color-verde-claro)]"
      : status === "atencao"
        ? "bg-[var(--color-atencao)]"
        : status === "bloqueante"
          ? "bg-[var(--color-alerta)]"
          : "bg-border";
  return <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${cls}`} />;
}

function ChecklistItem({ item, compact }: { item: ProntidaoItem; compact?: boolean }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
      <StatusDot status={item.status} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium">{item.titulo}</span>
          {item.clausula && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {item.clausula}
            </span>
          )}
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.descricao}</p>
        )}
        {item.detalhe && (
          <p className="text-xs text-foreground/80 mt-1">{item.detalhe}</p>
        )}
      </div>
    </li>
  );
}

export function ProntidaoExportacaoPanel({
  empreendimentoId,
  compact = false,
}: ProntidaoExportacaoPanelProps) {
  const { data, isLoading, isError } = useProntidaoExportacao(empreendimentoId);

  if (empreendimentoId === null) return null;

  if (isLoading) {
    return (
      <Card className={`border-border shadow-none ${compact ? "p-4" : "p-6"} space-y-3`}>
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={`border-border shadow-none ${compact ? "p-4" : "p-6"}`}>
        <p className="text-sm text-muted-foreground">Checklist de prontidão indisponível.</p>
      </Card>
    );
  }

  const grupos = [...new Set(data.itens.map((i) => i.grupo))];
  const bloqueantes = data.itens.filter((i) => i.status === "bloqueante").length;
  const atencao = data.itens.filter((i) => i.status === "atencao").length;

  if (compact) {
    return (
      <Card className="p-5 border-border shadow-none space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle icon={ClipboardCheck}>Prontidão para exportação</SectionTitle>
          <span className="text-sm font-semibold text-mono-tabular">{data.progressoGeral}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-verde-claro)]"
            style={{ width: `${data.progressoGeral}%` }}
          />
        </div>
        <ul className="space-y-0">
          {data.itens
            .filter((i) => i.status !== "ok" && i.status !== "nao_aplicavel")
            .slice(0, 4)
            .map((item) => (
              <ChecklistItem key={item.id} item={item} compact />
            ))}
        </ul>
        {bloqueantes === 0 && atencao === 0 && (
          <p className="text-xs text-[var(--color-verde-escuro)] flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pronto para gerar e exportar o memorial.
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-none overflow-hidden p-0">
      <div className="p-5 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle icon={ClipboardCheck}>Checklist de prontidão</SectionTitle>
          <span className="text-sm font-semibold text-mono-tabular">{data.progressoGeral}%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Alinhado às cláusulas do instrumento de incorporação e ao pacote de anexos NBR 12.721.
        </p>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-verde-claro)] transition-all"
            style={{ width: `${data.progressoGeral}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {bloqueantes > 0 && (
            <span className="flex items-center gap-1 text-[var(--color-alerta)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {bloqueantes} bloqueante{bloqueantes > 1 ? "s" : ""}
            </span>
          )}
          {atencao > 0 && (
            <span className="flex items-center gap-1 text-[oklch(0.45_0.13_85)]">
              <Circle className="h-3.5 w-3.5" />
              {atencao} em atenção
            </span>
          )}
          {data.prontoExportacaoFinal && (
            <span className="flex items-center gap-1 text-[var(--color-verde-escuro)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pronto para versão final
            </span>
          )}
        </div>
      </div>

      {grupos.map((grupo) => {
        const Icon = GRUPO_ICONS[grupo];
        const itensGrupo = data.itens.filter((i) => i.grupo === grupo);
        return (
          <div key={grupo} className="border-b border-border last:border-b-0">
            <div className="px-5 py-2.5 bg-muted/30 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {GRUPO_LABELS[grupo]}
            </div>
            <ul className="px-5">
              {itensGrupo.map((item) => (
                <ChecklistItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        );
      })}

      <div className="px-5 py-3 bg-muted/20 text-xs text-muted-foreground flex items-start gap-2">
        <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          A versão de revisão pode ser exportada com pendências. A versão final exige seções
          aprovadas e ausência de pendências bloqueantes no sistema.
        </span>
      </div>
    </Card>
  );
}
