import { Building2, HardHat, MapPinned, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBrDateDisplay, maskBrDateInput } from "@/lib/format";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import {
  calcularTotalVagasSubitens,
  CHAVE_VAGAS_TOTAL,
  CHAVES_VAGAS_SUBITENS,
  isChaveVagaSubitem,
  isRotuloVagaDescritivo,
  rotuloVagaPadrao,
} from "../vaga-labels";
import type { CampoExtraido, QuadroPreliminares } from "../types";
import { QuadroStepLayout } from "./quadro-step-layout";

interface PreliminaresStepProps {
  quadro: QuadroPreliminares;
  alertas: import("../types").AlertaValidacao[];
  onChange?: (quadro: QuadroPreliminares) => void;
}

const PROJETO_SUBSECOES: Array<{
  titulo: string;
  filtrar: (campo: CampoExtraido) => boolean;
}> = [
  {
    titulo: "Identificação",
    filtrar: (c) =>
      [
        "projeto_nome",
        "projeto_padrao_nbr",
        "projeto_qtd_unidades",
        "projeto_acabamento",
        "projeto_pavimentos",
      ].includes(c.chave),
  },
  {
    titulo: "Endereço e localização",
    filtrar: (c) =>
      [
        "projeto_logradouro",
        "projeto_lote_quadra",
        "projeto_cep",
        "projeto_cidade_uf",
        "projeto_area_terreno",
      ].includes(c.chave),
  },
  {
    titulo: "Vagas",
    filtrar: (c) => isChaveVagaSubitem(c.chave),
  },
  {
    titulo: "Licenciamento",
    filtrar: (c) => ["projeto_data_aprovacao", "projeto_alvara"].includes(c.chave),
  },
];

function updateCampo(quadro: QuadroPreliminares, chave: string, valor: string): QuadroPreliminares {
  return {
    ...quadro,
    campos: quadro.campos.map((c) => (c.chave === chave ? { ...c, valor } : c)),
  };
}

function campoOcupaDuasColunas(chave: string): boolean {
  return chave.includes("logradouro") || chave.includes("endereco");
}

function isCampoDataBr(chave: string): boolean {
  return chave === "projeto_data_aprovacao";
}

function valorCampoExibicao(campo: CampoExtraido): string {
  if (!isCampoDataBr(campo.chave) || !campo.valor.trim()) return campo.valor;
  return formatBrDateDisplay(campo.valor);
}

function rotuloExibicao(campo: CampoExtraido): string {
  if (campo.chave === CHAVE_VAGAS_TOTAL) {
    if (isRotuloVagaDescritivo(campo.rotulo)) return campo.rotulo;
    return rotuloVagaPadrao(CHAVE_VAGAS_TOTAL) ?? campo.rotulo;
  }
  if (!isChaveVagaSubitem(campo.chave)) return campo.rotulo;
  if (isRotuloVagaDescritivo(campo.rotulo)) return campo.rotulo;
  return rotuloVagaPadrao(campo.chave) ?? campo.rotulo;
}

function CampoLabel({ campo }: { campo: CampoExtraido }) {
  return (
    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block leading-snug">
      {rotuloExibicao(campo)}
    </Label>
  );
}

function CamposGrid({
  campos,
  quadro,
  onChange,
}: {
  campos: CampoExtraido[];
  quadro: QuadroPreliminares;
  onChange?: (quadro: QuadroPreliminares) => void;
}) {
  if (!campos.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {campos.map((campo) => {
        const readOnly = !onChange || campo.chave === CHAVE_VAGAS_TOTAL;

        return (
        <div key={campo.chave} className={campoOcupaDuasColunas(campo.chave) ? "md:col-span-2" : ""}>
          <CampoLabel campo={campo} />
          <Input
            value={valorCampoExibicao(campo)}
            readOnly={readOnly}
            className={readOnly ? "bg-muted/30" : undefined}
            inputMode={isCampoDataBr(campo.chave) ? "numeric" : undefined}
            placeholder={isCampoDataBr(campo.chave) ? "DD/MM/AAAA" : undefined}
            onChange={
              onChange && !readOnly
                ? (e) => {
                    const next = isCampoDataBr(campo.chave)
                      ? maskBrDateInput(e.target.value)
                      : e.target.value;
                    onChange(updateCampo(quadro, campo.chave, next));
                  }
                : undefined
            }
          />
        </div>
        );
      })}
    </div>
  );
}

function VagasSubBloco({
  campos,
  quadro,
  onChange,
}: {
  campos: CampoExtraido[];
  quadro: QuadroPreliminares;
  onChange?: (quadro: QuadroPreliminares) => void;
}) {
  const subs = CHAVES_VAGAS_SUBITENS.map((chave) => campos.find((c) => c.chave === chave)).filter(
    (c): c is CampoExtraido => Boolean(c),
  );
  const totalCampo = campos.find((c) => c.chave === CHAVE_VAGAS_TOTAL);
  const somaSubitens = calcularTotalVagasSubitens(campos);
  const valorTotal = somaSubitens > 0 ? String(somaSubitens) : (totalCampo?.valor ?? "");

  if (!subs.length && !valorTotal) return null;

  const camposGrid: CampoExtraido[] = [];
  if (valorTotal) {
    camposGrid.push({
      chave: CHAVE_VAGAS_TOTAL,
      rotulo: totalCampo?.rotulo ?? rotuloVagaPadrao(CHAVE_VAGAS_TOTAL) ?? "3.8 Quantidade de vagas",
      valor: valorTotal,
    });
  }
  camposGrid.push(...subs);

  return (
    <SubBloco titulo="Vagas">
      <CamposGrid campos={camposGrid} quadro={quadro} onChange={onChange} />
    </SubBloco>
  );
}

function BlocoSecao({
  titulo,
  icon,
  children,
}: {
  titulo: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
      <SectionTitle icon={icon}>{titulo}</SectionTitle>
      {children}
    </div>
  );
}

function SubBloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/60 p-3.5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</p>
      {children}
    </div>
  );
}

export function PreliminaresStep({ quadro, alertas, onChange }: PreliminaresStepProps) {
  const secoes: Array<{
    titulo: string;
    prefixo: string;
    icon: LucideIcon;
    subsecoes?: typeof PROJETO_SUBSECOES;
  }> = [
    { titulo: "1. Incorporador", prefixo: "incorporador_", icon: Building2 },
    { titulo: "2. Responsabilidade Técnica", prefixo: "rt_", icon: HardHat },
    {
      titulo: "3. Dados do Projeto",
      prefixo: "projeto_",
      icon: MapPinned,
      subsecoes: PROJETO_SUBSECOES,
    },
  ];

  return (
    <QuadroStepLayout
      titulo={quadro.titulo}
      descricao={
        onChange
          ? "Edite os campos e clique em Salvar para persistir as alterações."
          : "Campos validados na importação do quadro CFMD."
      }
      alertas={alertas}
    >
      <div className="space-y-4">
        {secoes.map((secao) => {
          const campos = quadro.campos.filter((c) => c.chave.startsWith(secao.prefixo));
          if (!campos.length) return null;

          return (
            <BlocoSecao key={secao.titulo} titulo={secao.titulo} icon={secao.icon}>
              {secao.subsecoes ? (
                <div className="space-y-3">
                  {secao.subsecoes.map((sub) => {
                    if (sub.titulo === "Vagas") {
                      return (
                        <VagasSubBloco
                          key={sub.titulo}
                          campos={campos}
                          quadro={quadro}
                          onChange={onChange}
                        />
                      );
                    }

                    const camposSub = campos.filter(sub.filtrar);
                    if (!camposSub.length) return null;

                    return (
                      <SubBloco key={sub.titulo} titulo={sub.titulo}>
                        <CamposGrid campos={camposSub} quadro={quadro} onChange={onChange} />
                      </SubBloco>
                    );
                  })}
                </div>
              ) : (
                <CamposGrid campos={campos} quadro={quadro} onChange={onChange} />
              )}
            </BlocoSecao>
          );
        })}
      </div>
    </QuadroStepLayout>
  );
}
