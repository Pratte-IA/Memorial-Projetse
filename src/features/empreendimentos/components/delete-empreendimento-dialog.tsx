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

import { useDeleteEmpreendimento } from "../hooks";
import type { EmpreendimentoListItem } from "../types";

interface DeleteEmpreendimentoDialogProps {
  item: EmpreendimentoListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmpreendimentoDialog({
  item,
  open,
  onOpenChange,
}: DeleteEmpreendimentoDialogProps) {
  const { membership } = useAuth();
  const deleteMutation = useDeleteEmpreendimento();
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) {
      setStep(1);
      setConfirmText("");
    }
  }, [open]);

  const nomeMatches = item !== null && confirmText.trim() === item.nome.trim();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!item || !membership || !nomeMatches) return;

    try {
      await deleteMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId: item.id,
        nome: item.nome,
      });
      toast.success("Empreendimento excluído");
      handleClose();
    } catch {
      toast.error("Não foi possível excluir o empreendimento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--color-alerta)]" />
                Excluir empreendimento?
              </DialogTitle>
              <DialogDescription>
                Você está prestes a excluir{" "}
                <span className="font-medium text-foreground">{item?.nome}</span>. Esta ação é
                irreversível e removerá todos os dados vinculados — quadros técnicos, unidades,
                dados extraídos e pendências.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirme a exclusão</DialogTitle>
              <DialogDescription>
                Para confirmar, digite o nome do empreendimento exatamente como aparece abaixo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm font-medium text-foreground rounded-md bg-muted px-3 py-2">
                {item?.nome}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="delete-confirm-nome">Nome do empreendimento</Label>
                <Input
                  id="delete-confirm-nome"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite o nome para confirmar"
                  autoComplete="off"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!nomeMatches || deleteMutation.isPending}
                onClick={() => void handleDelete()}
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir definitivamente"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
