import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/use-auth";
import { Field2 } from "@/features/empreendimentos/components/detail-ui";
import { fmtNum } from "@/lib/format";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { useUpdateUnidade, useUpdateUnidadeStatus } from "../hooks";
import { parseAreaInput } from "../schemas";
import type { UnidadeRecord } from "../types";
import { gerarDescricaoUnidade } from "../utils/texto-unidade";

interface UnidadeDrawerProps {
  unidade: UnidadeRecord;
  empreendimentoId: number;
  empreendimentoNome: string;
  onClose: () => void;
}

export function UnidadeDrawer({
  unidade,
  empreendimentoId,
  empreendimentoNome,
  onClose,
}: UnidadeDrawerProps) {
  const { membership, profile } = useAuth();
  const updateMutation = useUpdateUnidade(empreendimentoId);
  const statusMutation = useUpdateUnidadeStatus(empreendimentoId);

  const [form, setForm] = useState({
    nome: unidade.nome,
    torre: unidade.torre,
    pavimento: unidade.pavimento,
    tipo: unidade.tipo,
    vaga: unidade.vaga,
    fracao: unidade.fracao,
    areaPrivativa: fmtNum(unidade.areaPrivativa, 3),
    areaComum: fmtNum(unidade.areaComum, 3),
    areaTotal: fmtNum(unidade.areaTotal, 3),
    areaGarden: fmtNum(unidade.garden, 2),
    confrontacoes: unidade.confrontacoes,
    posicao: unidade.posicao,
  });

  useEffect(() => {
    setForm({
      nome: unidade.nome,
      torre: unidade.torre,
      pavimento: unidade.pavimento,
      tipo: unidade.tipo,
      vaga: unidade.vaga,
      fracao: unidade.fracao,
      areaPrivativa: fmtNum(unidade.areaPrivativa, 3),
      areaComum: fmtNum(unidade.areaComum, 3),
      areaTotal: fmtNum(unidade.areaTotal, 3),
      areaGarden: fmtNum(unidade.garden, 2),
      confrontacoes: unidade.confrontacoes,
      posicao: unidade.posicao,
    });
  }, [unidade]);

  const previewUnidade: UnidadeRecord = {
    ...unidade,
    nome: form.nome,
    torre: form.torre,
    pavimento: form.pavimento,
    tipo: form.tipo,
    vaga: form.vaga,
    fracao: form.fracao,
    areaPrivativa: parseAreaInput(form.areaPrivativa) ?? unidade.areaPrivativa,
    areaComum: parseAreaInput(form.areaComum) ?? unidade.areaComum,
    areaTotal: parseAreaInput(form.areaTotal) ?? unidade.areaTotal,
    garden: parseAreaInput(form.areaGarden) ?? unidade.garden,
    confrontacoes: form.confrontacoes,
    posicao: form.posicao,
  };

  const salvar = async () => {
    if (!membership || !profile) return;

    const areaPrivativa = parseAreaInput(form.areaPrivativa);
    const areaComum = parseAreaInput(form.areaComum);
    const areaTotal = parseAreaInput(form.areaTotal);
    const areaGarden = parseAreaInput(form.areaGarden);

    if (areaPrivativa === null || areaComum === null || areaTotal === null || areaGarden === null) {
      toast.error("Verifique os valores das áreas.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: unidade.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        patch: {
          nome: form.nome,
          torre: form.torre,
          pavimento: form.pavimento,
          tipo: form.tipo,
          vaga: form.vaga,
          fracao: form.fracao,
          confrontacoes: form.confrontacoes,
          posicao: form.posicao,
          areaPrivativa,
          areaComum,
          areaTotal,
          areaGarden,
        },
      });
      toast.success("Unidade salva.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };

  const alterarStatus = async (status: "validado" | "pendente" | "inconsistencia") => {
    if (!membership || !profile) return;

    try {
      await statusMutation.mutateAsync({
        ids: [unidade.id],
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        status,
        descricaoAuditoria:
          status === "validado"
            ? `Unidade "${unidade.nome}" validada.`
            : status === "pendente"
              ? `Unidade "${unidade.nome}" marcada como pendente.`
              : `Inconsistência registrada na unidade "${unidade.nome}".`,
      });
      toast.success(
        status === "validado"
          ? "Unidade validada."
          : status === "pendente"
            ? "Pendência registrada."
            : "Inconsistência registrada.",
      );
      onClose();
    } catch {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Revisão de unidade
            </div>
            <h3 className="text-xl font-semibold">{unidade.nome}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              {unidade.torre} · {unidade.pavimento}
            </div>
          </div>
          <StatusBadge status={unidade.status} />
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field2 label="Torre">
              <Input value={form.torre} onChange={(e) => set("torre", e.target.value)} />
            </Field2>
            <Field2 label="Pavimento">
              <Input value={form.pavimento} onChange={(e) => set("pavimento", e.target.value)} />
            </Field2>
            <Field2 label="Tipo">
              <Input value={form.tipo} onChange={(e) => set("tipo", e.target.value)} />
            </Field2>
            <Field2 label="Vaga vinculada">
              <Input value={form.vaga} onChange={(e) => set("vaga", e.target.value)} />
            </Field2>
            <Field2 label="Área privativa (m²)">
              <Input
                value={form.areaPrivativa}
                onChange={(e) => set("areaPrivativa", e.target.value)}
              />
            </Field2>
            <Field2 label="Área comum (m²)">
              <Input value={form.areaComum} onChange={(e) => set("areaComum", e.target.value)} />
            </Field2>
            <Field2 label="Área total (m²)">
              <Input value={form.areaTotal} onChange={(e) => set("areaTotal", e.target.value)} />
            </Field2>
            <Field2 label="Garden (m²)">
              <Input value={form.areaGarden} onChange={(e) => set("areaGarden", e.target.value)} />
            </Field2>
            <Field2 label="Fração territorial">
              <Input value={form.fracao} onChange={(e) => set("fracao", e.target.value)} />
            </Field2>
          </div>

          <Field2 label="Confrontações">
            <Textarea
              value={form.confrontacoes}
              onChange={(e) => set("confrontacoes", e.target.value)}
              rows={3}
            />
          </Field2>

          <Field2 label="Posição na torre">
            <Textarea
              value={form.posicao}
              onChange={(e) => set("posicao", e.target.value)}
              rows={3}
              placeholder="Ex.: sendo o apartamento da frente e do lado esquerdo da torre..."
            />
          </Field2>

          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Preview do texto que será gerado
            </div>
            <p className="text-sm leading-relaxed text-foreground text-justify">
              {gerarDescricaoUnidade(previewUnidade, { nome: empreendimentoNome })}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between sticky bottom-0 bg-card">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={statusMutation.isPending}
              onClick={() => void alterarStatus("pendente")}
            >
              <AlertTriangle className="h-4 w-4" /> Marcar pendência
            </Button>
            <Button
              variant="outline"
              disabled={updateMutation.isPending}
              onClick={() => void salvar()}
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
            <Button
              disabled={statusMutation.isPending}
              onClick={() => void alterarStatus("validado")}
            >
              <CheckCircle2 className="h-4 w-4" /> Validar unidade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
