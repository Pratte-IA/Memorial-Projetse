import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        </div>

        <Card className="p-6 border-border shadow-none">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Fale com a administradora da Projetse para recuperar sua senha.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </div>
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
