import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/features/auth/use-auth";
import { requireAuth } from "@/features/auth/require-auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.pathname);
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { isLoading, session } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      void navigate({
        to: "/login",
        search: { redirect: window.location.pathname },
      });
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Carregando sessão…</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>
      <AppSidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
