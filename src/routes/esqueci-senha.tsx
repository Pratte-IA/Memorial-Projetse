import { createFileRoute, Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/features/auth/require-auth";

export const Route = createFileRoute("/esqueci-senha")({
  beforeLoad: async () => {
    await redirectIfAuthenticated("/");
  },
  component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        <Card className="p-6 border-border shadow-none">
          <ForgotPasswordForm />
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
