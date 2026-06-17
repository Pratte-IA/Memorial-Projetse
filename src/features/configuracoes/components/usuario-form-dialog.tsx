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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/features/auth/constants";
import type { OrgRole } from "@/features/auth/types";
import { useAuth } from "@/features/auth/use-auth";

import { useCreateOrganizationUser, useUpdateOrganizationUserProfile } from "../hooks";
import { createUserSchema, editUserSchema, type CreateUserForm, type EditUserForm } from "../schemas";
import type { OrgMemberRecord } from "../types";

const ROLES: OrgRole[] = ["admin", "gestora", "responsavel_tecnica", "revisora"];

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: OrgMemberRecord | null;
}

export function UsuarioFormDialog({ open, onOpenChange, member }: UsuarioFormDialogProps) {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const isEditing = member != null;

  const createMutation = useCreateOrganizationUser(orgId);
  const updateMutation = useUpdateOrganizationUserProfile(orgId);

  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "revisora",
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: member?.fullName ?? "",
      email: member?.email ?? "",
      role: (member?.role ?? "revisora") as EditUserForm["role"],
    },
  });

  useEffect(() => {
    if (open && member) {
      editForm.reset({
        fullName: member.fullName,
        email: member.email,
        role: member.role as EditUserForm["role"],
      });
    }

    if (open && !member) {
      createForm.reset({
        fullName: "",
        email: "",
        password: "",
        role: "revisora",
      });
    }
  }, [open, member, createForm, editForm]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!orgId) return;

    try {
      await createMutation.mutateAsync({
        organizationId: orgId,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success("Usuário criado com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
    }
  });

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!orgId || !member) return;

    try {
      await updateMutation.mutateAsync({
        organizationId: orgId,
        userId: member.userId,
        memberId: member.id,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });
      toast.success("Usuário atualizado.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o usuário.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o perfil e o papel do usuário na organização."
              : "Cadastre um novo usuário com e-mail, senha e papel de acesso."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="Nome completo" error={editForm.formState.errors.fullName?.message}>
              <Input {...editForm.register("fullName")} autoComplete="name" />
            </Field>

            <Field label="E-mail" error={editForm.formState.errors.email?.message}>
              <Input {...editForm.register("email")} type="email" autoComplete="email" />
            </Field>

            <Field label="Papel" error={editForm.formState.errors.role?.message}>
              <Select
                value={editForm.watch("role")}
                onValueChange={(value) => editForm.setValue("role", value as EditUserForm["role"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Nome completo" error={createForm.formState.errors.fullName?.message}>
              <Input {...createForm.register("fullName")} autoComplete="name" />
            </Field>

            <Field label="E-mail" error={createForm.formState.errors.email?.message}>
              <Input {...createForm.register("email")} type="email" autoComplete="email" />
            </Field>

            <Field label="Senha inicial" error={createForm.formState.errors.password?.message}>
              <Input
                {...createForm.register("password")}
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
              />
            </Field>

            <Field label="Papel" error={createForm.formState.errors.role?.message}>
              <Select
                value={createForm.watch("role")}
                onValueChange={(value) => createForm.setValue("role", value as CreateUserForm["role"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
