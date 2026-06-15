import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  FileCheck2,
  Hash,
  Ruler,
  Users,
} from "lucide-react";
import { fmtArea, fmtNum } from "@/lib/format";
import type { EmpreendimentoView } from "../types";
import type { CondominioPavimentoView } from "../types/detail-types";
import { InfoLinha, ResumoItem, SectionTitle } from "./detail-ui";

function areaPavimento(p: CondominioPavimentoView): number {
  return p.areaReal > 0 ? p.areaReal : (p.areaEquivalente ?? 0);
}

function rotuloPavimento(p: CondominioPavimentoView, comTorre: boolean): string {
  if (comTorre && p.torre) return `${p.torre} — ${p.nome}`;
  return p.nome;
}

export function CondominioDadosSection({ emp }: { emp: EmpreendimentoView }) {
  const pavimentos = emp.pavimentosAreas;
  const espacosComuns = emp.espacosComuns;
  const comTorre = pavimentos.some((p) => Boolean(p.torre));
  const totalPavimentos = pavimentos.reduce((s, p) => s + areaPavimento(p), 0);
  const areaPrivativa = emp.areaPrivativaTotal;
  const areaComum = emp.areaComumTotal;
  const areaTotal =
    emp.areaGlobal > 0
      ? emp.areaGlobal
      : areaPrivativa + areaComum > 0
        ? areaPrivativa + areaComum
        : 0;

  return (
    <Card className="p-6 border-border shadow-none space-y-5">
      <SectionTitle icon={Building2}>Dados do condomínio</SectionTitle>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <ResumoItem
          icon={Ruler}
          label="Área total edificada"
          value={areaTotal > 0 ? fmtArea(areaTotal) : "—"}
        />
        <ResumoItem icon={Building2} label="Torres" value={`${emp.torres}`} />
        <ResumoItem icon={Hash} label="Pavimentos / torre" value={`${emp.pavimentos}`} />
        <ResumoItem icon={Users} label="Unidades" value={`${emp.unidades}`} />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <SectionTitle icon={Hash}>Quadro I — Áreas por pavimento</SectionTitle>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {pavimentos.length > 0
            ? `Quadro I · ${pavimentos.length} pavimento${pavimentos.length > 1 ? "s" : ""}`
            : "Sem dados do Quadro I"}
        </span>
      </div>
      {pavimentos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Importe o quadro técnico (Quadro I) para preencher as áreas por pavimento.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left font-medium py-2 px-2 text-[11px] uppercase tracking-wider">
                Pavimento
              </th>
              <th className="text-right font-medium py-2 px-2 text-[11px] uppercase tracking-wider">
                Área (m²)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pavimentos.map((p) => (
              <tr key={p.id}>
                <td className="py-2 px-2">{rotuloPavimento(p, comTorre)}</td>
                <td className="py-2 px-2 text-right text-mono-tabular">
                  {areaPavimento(p) > 0 ? fmtNum(areaPavimento(p), 2) : "—"}
                </td>
              </tr>
            ))}
            <tr className="bg-muted/40">
              <td className="py-2 px-2 font-semibold">Σ Total</td>
              <td className="py-2 px-2 text-right font-semibold text-mono-tabular">
                {totalPavimentos > 0 ? fmtNum(totalPavimentos, 2) : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="h-px bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <SectionTitle icon={FileCheck2}>Propriedade exclusiva</SectionTitle>
          <InfoLinha
            label="Área privativa"
            value={areaPrivativa > 0 ? fmtArea(areaPrivativa) : "—"}
          />
          <InfoLinha label="Apartamentos" value={`${emp.unidades}`} />
          <InfoLinha label="Vagas descobertas" value={`${emp.vagas}`} />
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Vagas acessórias às unidades autônomas.
          </div>
        </div>

        <div className="space-y-3">
          <SectionTitle icon={Briefcase}>Propriedade comum</SectionTitle>
          <InfoLinha
            label="Área de uso comum"
            value={areaComum > 0 ? fmtArea(areaComum) : "—"}
          />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground pt-1">
            Espaços
          </div>
          {espacosComuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum espaço comum extraído do Quadro VIII.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {espacosComuns.map((a) => (
                <span
                  key={a.id}
                  className="text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border"
                >
                  {a.nome}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
