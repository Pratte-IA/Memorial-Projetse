import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  FileText,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/features/auth/constants";
import { signOut } from "@/features/auth/api";
import { useAuth } from "@/features/auth/use-auth";
import { canAccessSettings } from "@/features/auth/permissions";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { to: "/modelos", label: "Modelos de Documento", icon: FileText },
  { to: "/clausulas", label: "Biblioteca de Cláusulas", icon: BookOpen },
  { to: "/configuracoes", label: "Configurações", icon: Settings, requiresSettings: true },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { profile, role, organization, refresh } = useAuth();

  const displayName = profile?.full_name ?? "Usuário";
  const displayRole = role ? ROLE_LABELS[role] : "Sem papel";
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    try {
      await signOut();
      await refresh();
      toast.success("Sessão encerrada");
      await navigate({ to: "/login" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao sair";
      toast.error(message);
    }
  };

  const visibleNav = nav.filter((item) => !item.requiresSettings || canAccessSettings(role));

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      aria-label="Navegação principal"
    >
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

      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Menu do sistema">
        {visibleNav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-auto justify-start gap-3 px-1 py-2 hover:bg-sidebar-accent/60"
            >
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold shrink-0">
                {initials}
              </div>
              <div className="leading-tight text-left min-w-0">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-[11px] text-sidebar-foreground/60 truncate">{displayRole}</div>
                {organization ? (
                  <div className="text-[10px] text-sidebar-foreground/50 truncate">
                    {organization.name}
                  </div>
                ) : (
                  <div className="text-[10px] text-sidebar-foreground/50 truncate">
                    Sem organização
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canAccessSettings(role) ? (
              <DropdownMenuItem asChild>
                <Link to="/configuracoes">Configurações</Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onClick={() => void handleLogout()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
