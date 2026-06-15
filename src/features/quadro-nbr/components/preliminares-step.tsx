import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuadroPreliminares } from "../types";
import { QuadroStepLayout } from "./quadro-step-layout";

interface PreliminaresStepProps {
  quadro: QuadroPreliminares;
  alertas: import("../types").AlertaValidacao[];
  onChange?: (quadro: QuadroPreliminares) => void;
}

function updateCampo(quadro: QuadroPreliminares, chave: string, valor: string): QuadroPreliminares {
  return {
    ...quadro,
    campos: quadro.campos.map((c) => (c.chave === chave ? { ...c, valor } : c)),
  };
}

export function PreliminaresStep({ quadro, alertas, onChange }: PreliminaresStepProps) {
  const secoes = [
    { titulo: "1. Incorporador", prefixo: "incorporador_" },
    { titulo: "2. Responsabilidade Técnica", prefixo: "rt_" },
    { titulo: "3. Dados do Projeto", prefixo: "projeto_" },
  ] as const;

  return (
    <QuadroStepLayout
      titulo={quadro.titulo}
      descricao={
        onChange
          ? "Valide os campos hierárquicos da aba Informações Preliminares."
          : "Campos validados na importação do quadro CFMD."
      }
      alertas={alertas}
    >
      {secoes.map((secao) => {
        const campos = quadro.campos.filter((c) => c.chave.startsWith(secao.prefixo));
        if (!campos.length) return null;

        return (
          <div key={secao.titulo} className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {secao.titulo}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campos.map((campo) => (
                <div key={campo.chave} className={campo.chave.includes("logradouro") ? "md:col-span-2" : ""}>
                  <Label className="text-xs text-muted-foreground mb-1 block">{campo.rotulo}</Label>
                  <Input
                    value={campo.valor}
                    readOnly={!onChange}
                    className={!onChange ? "bg-muted/30" : undefined}
                    onChange={
                      onChange
                        ? (e) => onChange(updateCampo(quadro, campo.chave, e.target.value))
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </QuadroStepLayout>
  );
}
