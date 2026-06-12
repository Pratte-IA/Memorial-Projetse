import { useEffect, useState } from "react";
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

import { useUpdateEmpreendimento } from "../hooks";
import type { EmpreendimentoListItem } from "../types";

interface EditEmpreendimentoDialogProps {
  item: EmpreendimentoListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmpreendimentoDialog({
  item,
  open,
  onOpenChange,
}: EditEmpreendimentoDialogProps) {
  const { membership } = useAuth();
  const updateMutation = useUpdateEmpreendimento();
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  useEffect(() => {
    if (!item) return;
    setNome(item.nome);
    setCidade(item.cidade === "—" ? "" : item.cidade);
    setUf(item.uf === "—" ? "" : item.uf);
  }, [item]);

  const handleSave = async () => {
    if (!item || !membership) return;

    try {
      await updateMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId: item.id,
        nome: nome.trim(),
        cidade: cidade.trim() || undefined,
        uf: uf.trim() || undefined,
      });
      toast.success("Empreendimento atualizado");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar as alterações");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar empreendimento</DialogTitle>
          <DialogDescription>Atualize os dados básicos de identificação.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-nome">Nome</Label>
            <Input id="edit-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-cidade">Cidade</Label>
              <Input id="edit-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-uf">UF</Label>
              <Input
                id="edit-uf"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!nome.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
