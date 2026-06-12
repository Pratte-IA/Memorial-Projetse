import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { ConfiguracoesPage } from "@/features/configuracoes/components/configuracoes-page";
import { canAccessSettings } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_app/configuracoes")({
  component: ConfiguracoesRoute,
});

function ConfiguracoesRoute() {
  const navigate = useNavigate();
  const { role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && role && !canAccessSettings(role)) {
      void navigate({ to: "/" });
    }
  }, [isLoading, role, navigate]);

  if (!isLoading && role && !canAccessSettings(role)) {
    return null;
  }

  return <ConfiguracoesPage />;
}
