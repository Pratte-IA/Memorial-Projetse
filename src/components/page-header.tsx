import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumb, action }: Props) {
  return (
    <header className="border-b border-border bg-card">
      <div className="px-8 py-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-muted-foreground/50">/</span>}
                  <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>
                    {b.label}
                  </span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {action}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-atencao)] text-[10px] font-semibold text-preto flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
