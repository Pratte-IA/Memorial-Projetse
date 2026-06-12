import { CheckCircle2, Clock, FileType, UploadCloud, AlertTriangle } from "lucide-react";

export type EstadoQuadroUi = "vazio" | "enviado" | "extraindo" | "concluido" | "erro";

export function EstadoBadge({ estado }: { estado: EstadoQuadroUi }) {
  const map: Record<EstadoQuadroUi, { label: string; cls: string; Icon: React.ElementType }> = {
    vazio: {
      label: "Aguardando upload",
      cls: "bg-muted text-muted-foreground",
      Icon: UploadCloud,
    },
    enviado: {
      label: "Arquivo enviado",
      cls: "bg-[var(--color-ceu)]/15 text-[var(--color-ceu)]",
      Icon: FileType,
    },
    extraindo: {
      label: "Extraindo...",
      cls: "bg-[var(--color-ceu)]/15 text-[var(--color-ceu)]",
      Icon: Clock,
    },
    concluido: {
      label: "Extração concluída",
      cls: "bg-[var(--color-verde-claro)]/15 text-[var(--color-verde-escuro)]",
      Icon: CheckCircle2,
    },
    erro: {
      label: "Erro no processamento",
      cls: "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)]",
      Icon: AlertTriangle,
    },
  };

  const { label, cls, Icon } = map[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}
    >
      <Icon className={`h-3 w-3 ${estado === "extraindo" ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}
