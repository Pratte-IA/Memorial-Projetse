import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileCheck2,
  FileText,
  Hash,
  Ruler,
  Users,
} from "lucide-react";
import type { Empreendimento } from "@/lib/mock-data";
import { fmtNum } from "@/lib/format";
import { AREAS_COMUNS_MOCK, PAVIMENTOS_MOCK } from "../constants/detail-mocks";
import { InfoLinha, ResumoItem, SectionTitle } from "./detail-ui";
import { numeroExtenso } from "@/features/unidades/utils/texto-unidade";

export function CondominioTab({
  emp,
  onConcluir,
}: {
  emp: Empreendimento;
  onConcluir: () => void;
}) {
  const totalPavimentos = PAVIMENTOS_MOCK.reduce((s, p) => s + p.area, 0);
  const areaPrivativa = 2598.0;
  const areaComum = 515.58;
  const areaTotal = areaPrivativa + areaComum;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none">
          <SectionTitle icon={Building2}>Composição do Condomínio</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
            <ResumoItem
              icon={Ruler}
              label="Área total edificada"
              value={`${fmtNum(areaTotal, 2)} m²`}
            />
            <ResumoItem icon={Building2} label="Torres" value={`${emp.torres}`} />
            <ResumoItem icon={Hash} label="Pavimentos / torre" value={`${emp.pavimentos}`} />
            <ResumoItem icon={Users} label="Unidades" value={`${emp.unidades}`} />
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={Hash}>Áreas por pavimento</SectionTitle>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {PAVIMENTOS_MOCK.length} pavimentos
            </span>
          </div>
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
              {PAVIMENTOS_MOCK.map((p) => (
                <tr key={p.nome}>
                  <td className="py-2 px-2">{p.nome}</td>
                  <td className="py-2 px-2 text-right text-mono-tabular">{fmtNum(p.area, 2)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40">
                <td className="py-2 px-2 font-semibold">Σ Total</td>
                <td className="py-2 px-2 text-right font-semibold text-mono-tabular">
                  {fmtNum(totalPavimentos, 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-6 border-border shadow-none">
            <SectionTitle icon={FileCheck2}>Propriedade exclusiva</SectionTitle>
            <div className="mt-4 space-y-3">
              <InfoLinha label="Área privativa" value={`${fmtNum(areaPrivativa, 2)} m²`} />
              <InfoLinha label="Apartamentos" value={`${emp.unidades}`} />
              <InfoLinha label="Vagas descobertas" value={`${emp.vagas}`} />
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Vagas acessórias às unidades autônomas.
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border shadow-none">
            <SectionTitle icon={Briefcase}>Propriedade comum</SectionTitle>
            <div className="mt-4 space-y-3">
              <InfoLinha label="Área de uso comum" value={`${fmtNum(areaComum, 2)} m²`} />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground pt-1">
                Espaços
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AREAS_COMUNS_MOCK.map((a) => (
                  <span
                    key={a}
                    className="text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onConcluir}>
            Continuar para unidades <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-5 border-border shadow-none h-fit lg:sticky lg:top-6">
        <SectionTitle icon={FileText}>Texto gerado — Seção</SectionTitle>
        <div className="mt-4 text-[13px] leading-relaxed text-foreground/90 space-y-3">
          <p className="font-semibold">Da Composição do Condomínio</p>
          <p>
            O Condomínio com área total a ser edificada de{" "}
            <strong>{fmtNum(areaTotal, 2)} m²</strong>, será constituído de{" "}
            <strong>
              {emp.torres} ({numeroExtenso(emp.torres)})
            </strong>{" "}
            torres, divididas em{" "}
            <strong>
              {emp.pavimentos} ({numeroExtenso(emp.pavimentos)})
            </strong>{" "}
            pavimentos cada, e uma área comum, a saber:{" "}
            {PAVIMENTOS_MOCK.map((p, i) => (
              <span key={p.nome}>
                {p.nome}, medindo {fmtNum(p.area, 2)} m²
                {i < PAVIMENTOS_MOCK.length - 1 ? "; " : ". "}
              </span>
            ))}
            A composição do condomínio será a seguinte:{" "}
            <strong>a) Partes de propriedade exclusiva</strong> (áreas privativas de{" "}
            {fmtNum(areaPrivativa, 2)} m²): às quais serão {emp.unidades} apartamentos e {emp.vagas}{" "}
            vagas de garagem descobertas, acessórias às unidades autônomas;{" "}
            <strong>b) Partes de propriedade comum</strong> (áreas de uso comum de{" "}
            {fmtNum(areaComum, 2)} m²): que serão: {AREAS_COMUNS_MOCK.join(", ")}. Tudo conforme
            alocado no referido projeto arquitetônico.
          </p>
        </div>
      </Card>
    </div>
  );
}
