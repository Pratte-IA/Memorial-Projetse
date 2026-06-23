import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/use-auth";

import { useUpdateOrganizationUserPassword } from "../hooks";
import { userPasswordSchema, type UserPasswordForm } from "../schemas";
import type { OrgMemberRecord } from "../types";

interface UsuarioSenhaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrgMemberRecord | null;
}

export function UsuarioSenhaDialog({ open, onOpenChange, member }: UsuarioSenhaDialogProps) {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const passwordMutation = useUpdateOrganizationUserPassword(orgId);

  const form = useForm<UserPasswordForm>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ password: "", confirmPassword: "" });
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!orgId || !member) return;

    try {
      await passwordMutation.mutateAsync({
        organizationId: orgId,
        userId: member.userId,
        password: values.password,
      });
      toast.success("Senha atualizada com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            Cadastre uma nova senha para{" "}
            <span className="font-medium text-foreground">{member?.fullName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">
              Nova senha
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirmar senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? "Salvando..." : "Salvar senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
