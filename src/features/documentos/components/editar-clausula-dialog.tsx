import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { useUpdateClausula } from "../hooks";
import type { ClausulaRecord, ClausulaStatus } from "../types";
import { extractVariaveisFromTemplate } from "../utils";

interface EditarClausulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clausula: ClausulaRecord;
  organizationId: number;
  onSaved: (clausula: ClausulaRecord) => void;
}

function resolveStatus(status: string): ClausulaStatus {
  return status === "publicada" ? "publicada" : "em_revisao";
}

export function EditarClausulaDialog({
  open,
  onOpenChange,
  clausula,
  organizationId,
  onSaved,
}: EditarClausulaDialogProps) {
  const updateMutation = useUpdateClausula(organizationId);

  const [titulo, setTitulo] = useState(clausula.titulo);
  const [categoria, setCategoria] = useState(clausula.categoria);
  const [resumo, setResumo] = useState(clausula.resumo);
  const [template, setTemplate] = useState(clausula.template);
  const [status, setStatus] = useState<ClausulaStatus>(resolveStatus(clausula.status));

  useEffect(() => {
    if (!open) return;
    setTitulo(clausula.titulo);
    setCategoria(clausula.categoria);
    setResumo(clausula.resumo);
    setTemplate(clausula.template);
    setStatus(resolveStatus(clausula.status));
  }, [open, clausula]);

  const variaveisPreview = extractVariaveisFromTemplate(template);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !updateMutation.isPending) {
      onOpenChange(false);
    } else if (nextOpen) {
      onOpenChange(true);
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Informe o título da cláusula.");
      return;
    }
    if (!template.trim()) {
      toast.error("Informe o texto do template.");
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: clausula.id,
        organizationId,
        titulo: titulo.trim(),
        categoria: categoria.trim() || "—",
        resumo: resumo.trim(),
        template,
        status,
      });
      toast.success("Cláusula atualizada.");
      onSaved(updated);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a cláusula.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar cláusula</DialogTitle>
          <DialogDescription>
            Alterações afetam a biblioteca da organização e memoriais futuros que utilizarem este
            bloco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clausula-titulo">Título</Label>
              <Input
                id="clausula-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clausula-categoria">Categoria</Label>
              <Input
                id="clausula-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clausula-resumo">Resumo</Label>
            <Input
              id="clausula-resumo"
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clausula-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ClausulaStatus)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id="clausula-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publicada">Publicada</SelectItem>
                <SelectItem value="em_revisao">Em revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clausula-template">Template</Label>
            <Textarea
              id="clausula-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={12}
              className="text-sm leading-7 resize-y font-mono"
              disabled={updateMutation.isPending}
            />
            {variaveisPreview.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {variaveisPreview.map((v) => (
                  <code
                    key={v}
                    className="px-2 py-0.5 text-[11px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
