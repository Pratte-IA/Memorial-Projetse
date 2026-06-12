import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/use-auth";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import type { Empreendimento } from "@/lib/mock-data";
import { fmtNum, formatLoteQuadra } from "@/lib/format";
import { ArrowRight, CheckCircle2, FileText, Loader2 } from "lucide-react";

import { CAMPO_LABELS } from "../seed-template";
import { useConfirmarBlocoDados, useDadosExtraidos, useUpdateDadoExtraido } from "../hooks";
import type { DadoExtraidoRecord } from "../types";
import { ConfidenceBadge } from "./confidence-badge";

interface DadosExtraidosTabProps {
  emp: Empreendimento;
  empreendimentoId: number | null;
  onConcluir: () => void;
}

function FonteSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="px-4 py-1.5 bg-muted/20 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {titulo}
      </div>
      <div className="px-4 py-2.5">{children}</div>
    </div>
  );
}

function FonteLinha({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-foreground text-right ${mono ? "text-mono-tabular" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function FonteTr({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-1.5 px-1 text-foreground/90">{label}</td>
      <td className="py-1.5 px-1 text-right text-mono-tabular text-foreground">{value}</td>
    </tr>
  );
}

export function DadosExtraidosTab({ emp, empreendimentoId, onConcluir }: DadosExtraidosTabProps) {
  const { membership, profile } = useAuth();
  const { data, isLoading, isError, refetch } = useDadosExtraidos(empreendimentoId);
  const updateMutation = useUpdateDadoExtraido(empreendimentoId);
  const confirmarMutation = useConfirmarBlocoDados(empreendimentoId);

  const [valores, setValores] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<number, string> = {};
    for (const bloco of data.blocos) {
      for (const campo of bloco.campos) {
        next[campo.id] = campo.valor;
      }
    }
    setValores(next);
  }, [data]);

  const handleBlur = useCallback(
    async (campo: DadoExtraidoRecord) => {
      if (!empreendimentoId || !membership || !profile) return;

      const valorAtual = valores[campo.id] ?? campo.valor;
      if (valorAtual.trim() === campo.valor.trim()) return;

      try {
        await updateMutation.mutateAsync({
          id: campo.id,
          empreendimentoId,
          organizationId: membership.organization_id,
          profileId: profile.id,
          campo: campo.campo,
          valor: valorAtual,
          valorAnterior: campo.valor,
          statusAtual: campo.status,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível salvar o campo.";
        toast.error(message);
        setValores((prev) => ({ ...prev, [campo.id]: campo.valor }));
      }
    },
    [empreendimentoId, membership, profile, updateMutation, valores],
  );

  const confirmarBloco = async (bloco: string, campos: DadoExtraidoRecord[]) => {
    if (!empreendimentoId || !membership || !profile) return;

    try {
      await confirmarMutation.mutateAsync({
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        bloco,
        campoIds: campos.map((c) => c.id),
        valores: campos.map((c) => ({
          id: c.id,
          campo: c.campo,
          valor: valores[c.id] ?? c.valor,
        })),
      });
      toast.success(`Bloco "${bloco}" confirmado.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível confirmar o bloco.";
      toast.error(message);
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Validação disponível apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="lg:col-span-2 h-96" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3">
        <p className="text-sm text-[var(--color-alerta)]">
          Não foi possível carregar os dados extraídos.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  if (!data || data.totalCampos === 0) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground space-y-2">
        <p>Nenhum dado extraído ainda.</p>
        <p className="text-xs">
          Envie e processe o quadro técnico na aba anterior para gerar os campos.
        </p>
      </Card>
    );
  }

  const blocoConfirmado = (campos: DadoExtraidoRecord[]) =>
    campos.every((c) => c.status === "confirmado");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <Card className="p-4 border-border shadow-none flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Progresso de validação
            </div>
            <div className="flex items-center gap-3 w-80">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-verde-claro)]"
                  style={{ width: `${data.progressoValidacao}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-mono-tabular">
                {data.progressoValidacao}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {data.camposConfirmados} de {data.totalCampos} campos confirmados
            </p>
          </div>
          <Button onClick={onConcluir} disabled={data.progressoValidacao < 50}>
            Validar e continuar <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        {data.blocos.map((b) => (
          <Card key={b.bloco} className="p-5 border-border shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">{b.titulo}</h4>
              <Button
                size="sm"
                variant={blocoConfirmado(b.campos) ? "secondary" : "outline"}
                disabled={confirmarMutation.isPending || blocoConfirmado(b.campos)}
                onClick={() => void confirmarBloco(b.bloco, b.campos)}
              >
                {confirmarMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {blocoConfirmado(b.campos) ? "Bloco confirmado" : "Confirmar bloco"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {b.campos.map((c) => (
                <div key={c.id}>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-2">
                    {CAMPO_LABELS[c.campo] ?? c.campo}
                    <ConfidenceBadge status={c.status} />
                  </Label>
                  <Input
                    value={valores[c.id] ?? c.valor}
                    onChange={(e) => setValores((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    onBlur={() => void handleBlur(c)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="lg:col-span-2 p-5 border-border shadow-none h-fit lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={FileText}>Fonte — Quadro NBR 12.721</SectionTitle>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
            pág. 1 de 4
          </span>
        </div>

        <div className="border border-border rounded-md bg-[var(--color-papel,theme(colors.background))] overflow-hidden font-mono text-[11px] leading-relaxed">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground tracking-wide text-[11px]">
                QUADRO I — NBR 12.721
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Cálculo de áreas — incorporação imobiliária
              </div>
            </div>
            <div className="text-right text-[10px] text-muted-foreground">
              <div>Ref. {emp.matricula}</div>
              <div className="text-mono-tabular">{emp.dataAprovacao}</div>
            </div>
          </div>

          <FonteSecao titulo="1. Identificação">
            <FonteLinha label="Empreendimento" value={emp.nome} mono={false} />
            <FonteLinha label="Incorporadora" value={emp.incorporadora} mono={false} />
            <FonteLinha label="CNPJ" value={emp.cnpj} />
            <FonteLinha label="Endereço" value={emp.endereco} mono={false} />
            <FonteLinha
              label="Lote / Quadra"
              value={formatLoteQuadra(emp.lote, emp.quadra)}
            />
            <FonteLinha label="Matrícula" value={emp.matricula} />
          </FonteSecao>

          <FonteSecao titulo="2. Quadro de áreas">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-medium py-1.5 px-1 text-[10px] uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="text-right font-medium py-1.5 px-1 text-[10px] uppercase tracking-wider">
                    m²
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <FonteTr label="Área do terreno" value={fmtNum(emp.areaTerreno, 2)} />
                <FonteTr label="Área construída global" value={fmtNum(emp.areaGlobal, 2)} />
                <FonteTr label="Área privativa total" value={fmtNum(emp.areaTerreno * 0.65, 2)} />
                <FonteTr label="Área comum total" value={fmtNum(emp.areaTerreno * 0.35, 2)} />
                <tr className="bg-muted/40">
                  <td className="py-1.5 px-1 font-semibold text-foreground">
                    Σ Área global verificada
                  </td>
                  <td className="py-1.5 px-1 text-right text-mono-tabular font-semibold text-foreground">
                    {fmtNum(emp.areaGlobal, 2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </FonteSecao>

          <FonteSecao titulo="3. Composição do empreendimento">
            <table className="w-full">
              <tbody className="divide-y divide-border/60">
                <FonteTr label="Torres" value={fmtNum(emp.torres, 0)} />
                <FonteTr label="Pavimentos por torre" value={fmtNum(emp.pavimentos, 0)} />
                <FonteTr label="Unidades autônomas" value={fmtNum(emp.unidades, 0)} />
                <FonteTr label="Vagas de estacionamento" value={fmtNum(emp.vagas, 0)} />
              </tbody>
            </table>
          </FonteSecao>

          <div className="border-t border-border bg-muted/30 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Responsável técnico: {emp.responsavel}</span>
            <span className="text-mono-tabular">{emp.crea}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
