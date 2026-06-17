import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSecaoSumarioNumero } from "../status";
import { montarTituloClausulaExtra } from "../titulo-clausula";

interface AdicionarClausulaExtraDialogProps {
  defaultNumero: number;
  maxNumero: number;
  disabled?: boolean;
  isPending?: boolean;
  onConfirm: (input: { titulo: string; conteudo: string; numeroClausula: number }) => Promise<void>;
}

export function AdicionarClausulaExtraDialog({
  defaultNumero,
  maxNumero,
  disabled,
  isPending,
  onConfirm,
}: AdicionarClausulaExtraDialogProps) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [numeroClausula, setNumeroClausula] = useState(String(defaultNumero));

  useEffect(() => {
    if (open) setNumeroClausula(String(defaultNumero));
  }, [open, defaultNumero]);

  const reset = () => {
    setTitulo("");
    setConteudo("");
    setNumeroClausula(String(defaultNumero));
  };

  const numeroParsed = Number.parseInt(numeroClausula, 10);
  const numeroValido =
    Number.isFinite(numeroParsed) && numeroParsed >= 1 && numeroParsed <= maxNumero + 1;
  const tituloPreview =
    titulo.trim() && numeroValido ? montarTituloClausulaExtra(numeroParsed, titulo) : null;

  const handleSubmit = async () => {
    if (!numeroValido) return;
    await onConfirm({ titulo, conteudo, numeroClausula: numeroParsed });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full" disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar cláusula extra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cláusula extra deste memorial</DialogTitle>
          <DialogDescription>
            Use para regras municipais ou exigências específicas deste empreendimento. Não altera o
            modelo padrão da organização. Informe o número no sumário — as demais cláusulas serão
            renumeradas automaticamente se a extra entrar no meio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="clausula-extra-numero">Número no sumário</Label>
            <Input
              id="clausula-extra-numero"
              type="number"
              min={1}
              max={maxNumero + 1}
              value={numeroClausula}
              onChange={(e) => setNumeroClausula(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {numeroValido ? (
                <>
                  Será exibida como <strong>{formatSecaoSumarioNumero(numeroParsed)}</strong>.
                  {numeroParsed <= maxNumero
                    ? ` A cláusula ${formatSecaoSumarioNumero(numeroParsed)} atual e as seguintes avançam uma posição.`
                    : " Será adicionada ao final do memorial."}
                </>
              ) : (
                <>Use um número entre 1 e {maxNumero + 1} (01 = Primeira, após a Qualificação).</>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clausula-extra-titulo">Assunto da cláusula</Label>
            <Input
              id="clausula-extra-titulo"
              placeholder="Ex.: Disposição municipal de Cascavel"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {tituloPreview ? (
              <p className="text-xs text-muted-foreground">
                Título no memorial:{" "}
                <strong className="text-foreground font-medium">{tituloPreview}</strong>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                O ordinal por extenso (Primeira, Segunda, Sexta…) é adicionado automaticamente,
                como nas demais cláusulas.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clausula-extra-conteudo">Conteúdo (opcional)</Label>
            <Textarea
              id="clausula-extra-conteudo"
              placeholder="Texto da cláusula…"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={8}
              className="text-sm leading-7 resize-y"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isPending || !titulo.trim() || !numeroValido}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
