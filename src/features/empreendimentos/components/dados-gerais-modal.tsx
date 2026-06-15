import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
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
import { useAuth } from "@/features/auth/use-auth";
import { Save } from "lucide-react";

import { matriculaPorExtenso } from "@/lib/numero-extenso";

import { useUpdateEmpreendimento } from "../hooks";
import type { EmpreendimentoView } from "../types";
import { Field } from "./detail-ui";

export type DadosGeraisForm = {
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  lote: string;
  quadra: string;
  matricula: string;
};

function emptyToDash(value: string): string {
  const trimmed = value.trim();
  return trimmed || "—";
}

function dashToEmpty(value: string): string {
  return value === "—" ? "" : value;
}

export function dadosGeraisFromEmp(emp: EmpreendimentoView): DadosGeraisForm {
  return {
    nome: dashToEmpty(emp.nome),
    endereco: dashToEmpty(emp.endereco),
    cidade: dashToEmpty(emp.cidade),
    uf: dashToEmpty(emp.uf),
    lote: dashToEmpty(emp.lote),
    quadra: dashToEmpty(emp.quadra),
    matricula: dashToEmpty(emp.matricula),
  };
}

export function DadosGeraisModal({
  open,
  onOpenChange,
  empreendimentoId,
  initial,
  onSalvo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empreendimentoId: number;
  initial: DadosGeraisForm;
  onSalvo: (dados: DadosGeraisForm) => void;
}) {
  const { membership } = useAuth();
  const router = useRouter();
  const updateMutation = useUpdateEmpreendimento();
  const [form, setForm] = useState<DadosGeraisForm>(initial);

  const formKey = `${empreendimentoId}-${open}`;
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setForm(initial);
    setLastKey(formKey);
  }

  const set = <K extends keyof DadosGeraisForm>(key: K, value: DadosGeraisForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const matriculaExtensoPreview = matriculaPorExtenso(form.matricula);

  const handleSalvar = async () => {
    if (!membership) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!form.nome.trim()) {
      toast.error("O nome do empreendimento é obrigatório.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId,
        nome: form.nome.trim(),
        endereco: form.endereco.trim() || undefined,
        cidade: form.cidade.trim() || undefined,
        uf: form.uf.trim().toUpperCase() || undefined,
        lote: form.lote.trim() || undefined,
        quadra: form.quadra.trim() || undefined,
        matricula: form.matricula.trim() || undefined,
      });

      onSalvo(form);
      await router.invalidate();
      toast.success("Dados gerais atualizados.");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar os dados gerais.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar dados gerais</DialogTitle>
          <DialogDescription>
            Atualize a identificação do empreendimento e o número da matrícula do imóvel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <Field label="Nome do empreendimento">
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
          </Field>
          <Field label="Endereço">
            <Input
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Cidade">
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </Field>
            <Field label="UF">
              <Input
                value={form.uf}
                onChange={(e) => set("uf", e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="PR"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Lote">
              <Input value={form.lote} onChange={(e) => set("lote", e.target.value)} />
            </Field>
            <Field label="Quadra">
              <Input value={form.quadra} onChange={(e) => set("quadra", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Matrícula">
              <Input
                value={form.matricula}
                onChange={(e) => set("matricula", e.target.value)}
                placeholder="Ex.: 76.476"
              />
            </Field>
            <Field label="Matrícula (por extenso)">
              <Input
                value={matriculaExtensoPreview}
                readOnly
                tabIndex={-1}
                className="bg-muted/40 text-muted-foreground"
                placeholder="Preenchido automaticamente"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSalvar} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function dadosGeraisToDisplay(form: DadosGeraisForm) {
  return {
    nome: emptyToDash(form.nome),
    endereco: emptyToDash(form.endereco),
    cidade: emptyToDash(form.cidade),
    uf: emptyToDash(form.uf),
    lote: emptyToDash(form.lote),
    quadra: emptyToDash(form.quadra),
    matricula: emptyToDash(form.matricula),
  };
}
