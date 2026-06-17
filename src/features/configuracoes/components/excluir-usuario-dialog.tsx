import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
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

import { useDeleteOrganizationUser } from "../hooks";
import type { OrgMemberRecord } from "../types";

interface ExcluirUsuarioDialogProps {
  member: OrgMemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcluirUsuarioDialog({ member, open, onOpenChange }: ExcluirUsuarioDialogProps) {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const deleteMutation = useDeleteOrganizationUser(orgId);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  const emailMatches = member !== null && confirmText.trim().toLowerCase() === member.email.toLowerCase();

  const handleDelete = async () => {
    if (!member || !orgId || !emailMatches) return;

    try {
      await deleteMutation.mutateAsync({
        organizationId: orgId,
        userId: member.userId,
      });
      toast.success("Usuário excluído permanentemente.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o usuário.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--color-alerta)]" />
            Excluir usuário?
          </DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. O usuário{" "}
            <span className="font-medium text-foreground">{member?.fullName}</span> perderá o
            acesso e todos os vínculos com a organização.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm font-medium text-foreground rounded-md bg-muted px-3 py-2">
            {member?.email}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm-email">Digite o e-mail para confirmar</Label>
            <Input
              id="delete-confirm-email"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="usuario@email.com"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!emailMatches || deleteMutation.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteMutation.isPending ? "Excluindo..." : "Excluir definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
