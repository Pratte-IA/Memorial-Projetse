import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
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
import {
  ACCEPTED_TIMBRADO_EXTENSIONS,
  MODELO_TIPO_PADRAO,
  MODELO_TIPOS,
  type ModeloTipo,
} from "../constants";
import { useCreateModeloTimbrado } from "../hooks";
import { isTimbradoExtension } from "../utils";

interface NovoTimbradoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}

export function NovoTimbradoDialog({
  open,
  onOpenChange,
  organizationId,
}: NovoTimbradoDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateModeloTimbrado(organizationId);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<ModeloTipo>(MODELO_TIPO_PADRAO);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const resetForm = () => {
    setNome("");
    setTipo(MODELO_TIPO_PADRAO);
    setArquivo(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !createMutation.isPending) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleArquivo = (file: File) => {
    if (!isTimbradoExtension(file.name)) {
      toast.error("Formato não suportado", {
        description: `Envie um arquivo ${ACCEPTED_TIMBRADO_EXTENSIONS.join(", ")} com o timbrado.`,
      });
      return;
    }
    setArquivo(file);
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Informe o nome do modelo.");
      return;
    }
    if (!arquivo) {
      toast.error("Selecione o arquivo de timbrado (.docx ou .pdf).");
      return;
    }

    try {
      await createMutation.mutateAsync({
        organizationId,
        nome: nome.trim(),
        tipo,
        file: arquivo,
      });
      toast.success("Timbrado cadastrado.", {
        description: "O novo modelo já está disponível para uso na esteira.",
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o timbrado.";
      toast.error("Erro ao fazer upload", { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo timbrado</DialogTitle>
          <DialogDescription>
            Envie o arquivo Word (.docx) ou PDF (.pdf) com cabeçalho, rodapé e formatação padrão da
            Projetse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="modelo-nome">Nome do modelo</Label>
            <Input
              id="modelo-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Memorial de Incorporação — Padrão Projetse"
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo-tipo">Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(value) => setTipo(value as ModeloTipo)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger id="modelo-tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {MODELO_TIPOS.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo-arquivo">Arquivo de timbrado</Label>
            <div className="flex items-center gap-2">
              <Input
                id="modelo-arquivo"
                ref={fileRef}
                type="file"
                accept={ACCEPTED_TIMBRADO_EXTENSIONS.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleArquivo(file);
                }}
                disabled={createMutation.isPending}
                className="cursor-pointer"
              />
            </div>
            {arquivo && (
              <p className="text-xs text-muted-foreground truncate">{arquivo.name}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Cadastrar timbrado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
