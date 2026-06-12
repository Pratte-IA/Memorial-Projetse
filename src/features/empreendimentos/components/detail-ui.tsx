import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { resolveSecaoStatusLabel } from "@/features/memorial/status";

export function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-mono-tabular">{value}</div>
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold">{children}</h3>
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">{children}</div>;
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function Pendencia({ tone, texto }: { tone: "alerta" | "atencao" | "ceu"; texto: string }) {
  const color =
    tone === "alerta"
      ? "bg-[var(--color-alerta)]"
      : tone === "atencao"
        ? "bg-[var(--color-atencao)]"
        : "bg-[var(--color-ceu)]";
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${color}`} />
      <span className="text-foreground/90">{texto}</span>
    </li>
  );
}

export function InfoLinha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-mono-tabular">{value}</span>
    </div>
  );
}

export function ResumoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-xl font-semibold tracking-tight text-mono-tabular">{value}</div>
    </div>
  );
}

export function Field2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-mono-tabular">{value}</span>
    </li>
  );
}

export function SectionDot({ status }: { status: string }) {
  const label = resolveSecaoStatusLabel(status);
  const c =
    label === "Aprovada"
      ? "bg-[var(--color-verde-claro)]"
      : label === "Com pendência"
        ? "bg-[var(--color-alerta)]"
        : label === "Em revisão"
          ? "bg-[var(--color-atencao)]"
          : label === "Gerada"
            ? "bg-[var(--color-ceu)]"
            : "bg-border";
  return <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${c}`} />;
}

export function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const color =
    tone === "verde"
      ? "text-[var(--color-verde-escuro)]"
      : tone === "atencao"
        ? "text-[oklch(0.45_0.13_85)]"
        : tone === "alerta"
          ? "text-[var(--color-alerta)]"
          : "text-foreground";
  return (
    <Card className="p-4 border-border shadow-none">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 text-mono-tabular ${color}`}>{value}</div>
    </Card>
  );
}

export function Chip({
  ativo,
  children,
  onClick,
}: {
  ativo: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
        ativo
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
