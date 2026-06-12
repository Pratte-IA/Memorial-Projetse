import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset } from "@/features/auth/api";

const forgotSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(values.email);
      setSent(true);
      toast.success("Se o e-mail existir, enviaremos instruções de recuperação.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível enviar o e-mail de recuperação.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Verifique sua caixa de entrada e siga o link para redefinir a senha.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Voltar ao login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/login">Voltar ao login</Link>
      </Button>
    </form>
  );
}
