import { getDadoStatusLabel } from "../status";
import type { DadoExtraidoStatus } from "../types";

export function ConfidenceBadge({ status }: { status: DadoExtraidoStatus | string }) {
  const label = getDadoStatusLabel(status);

  const map: Record<string, string> = {
    Confirmado: "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)]",
    Extraído: "bg-[var(--color-ceu)]/10 text-[var(--color-ceu)]",
    Editado: "bg-muted text-muted-foreground",
    "Baixa confiança": "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)]",
    Pendente: "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)]",
  };

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${map[label] ?? "bg-muted"}`}
    >
      {label}
    </span>
  );
}
