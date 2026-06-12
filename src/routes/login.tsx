import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirectIfAuthenticated } from "@/features/auth/require-auth";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ search }) => {
    await redirectIfAuthenticated(search.redirect ?? "/");
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-md bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xl font-semibold">
            π
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetse Memorial</h1>
          <p className="text-sm text-muted-foreground">
            Acesse com sua conta para continuar a gestão dos memoriais de incorporação.
          </p>
        </div>

        <Card className="p-6 border-border shadow-none">
          <LoginForm redirectTo={redirect ?? "/"} />
        </Card>
      </div>
    </div>
  );
}
