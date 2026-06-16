import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { ESTADOS_CIVIS, REGIMES, REPRESENTANTE_VAZIO } from "../constants/detail-mocks";
import type { Representante } from "../types/detail-types";
import { Field } from "./detail-ui";

export function RepresentanteModal({
  open,
  onOpenChange,
  representante,
  onSalvar,
  titulo = "Representante legal",
  descricao = "Cadastre a qualificação completa para a abertura do Memorial de Incorporação.",
  salvando = false,
  nomeSomenteLeitura = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  representante: Representante | null;
  onSalvar: (r: Representante) => void;
  titulo?: string;
  descricao?: string;
  salvando?: boolean;
  nomeSomenteLeitura?: boolean;
}) {
  const [form, setForm] = useState<Representante>(representante ?? REPRESENTANTE_VAZIO);

  // sync when opening a different representante
  const repId = representante?.id ?? "";
  const [lastId, setLastId] = useState(repId);
  if (repId !== lastId) {
    setForm(representante ?? REPRESENTANTE_VAZIO);
    setLastId(repId);
  }

  const set = <K extends keyof Representante>(k: K, v: Representante[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isCasado = form.estadoCivil === "Casado(a)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Identificação
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome completo" className="md:col-span-2">
                <Input
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  readOnly={nomeSomenteLeitura}
                  tabIndex={nomeSomenteLeitura ? -1 : undefined}
                  className={nomeSomenteLeitura ? "bg-muted/40 text-muted-foreground" : undefined}
                />
              </Field>
              <Field label="CPF">
                <Input
                  value={form.cpf}
                  onChange={(e) => set("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </Field>
              <Field label="RG">
                <Input
                  value={form.rg}
                  onChange={(e) => set("rg", e.target.value)}
                  placeholder="0.000.000-0 SSP/UF"
                />
              </Field>
              <Field label="Estado civil">
                <Select value={form.estadoCivil} onValueChange={(v) => set("estadoCivil", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_CIVIS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {isCasado && (
                <Field label="Regime de comunhão">
                  <Select
                    value={form.regimeComunhao}
                    onValueChange={(v) => set("regimeComunhao", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Endereço
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Field label="Rua" className="md:col-span-4">
                <Input value={form.rua} onChange={(e) => set("rua", e.target.value)} />
              </Field>
              <Field label="Número" className="md:col-span-2">
                <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} />
              </Field>
              <Field label="CEP" className="md:col-span-2">
                <Input
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                  placeholder="00.000-000"
                />
              </Field>
              <Field label="Bairro" className="md:col-span-2">
                <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
              </Field>
              <Field label="Cidade" className="md:col-span-2">
                <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
              </Field>
              <Field label="Estado" className="md:col-span-2">
                <Input
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </Field>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSalvar(form)} disabled={salvando}>
            <Save className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
