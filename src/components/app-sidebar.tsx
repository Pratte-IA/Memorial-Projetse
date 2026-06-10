import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  FileText,
  BookOpen,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { to: "/modelos", label: "Modelos de Documento", icon: FileText },
  { to: "/clausulas", label: "Biblioteca de Cláusulas", icon: BookOpen },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-sidebar-primary/15 border border-sidebar-border flex items-center justify-center">
            <span className="text-sidebar-primary-foreground text-lg font-semibold">π</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">PROJETSE</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Memorial · NBR 12.721
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold">
            FL
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Francieli Lima</div>
            <div className="text-[11px] text-sidebar-foreground/60">Responsável Técnica</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
