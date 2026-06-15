import {
  Calculator,
  Layers,
  PackagePlus,
  Receipt,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionTitle } from "@/features/empreendimentos/components/detail-ui";
import {
  QUADRO_III_BLOCOS,
  QUADRO_III_FIELD_DEFS,
  QUADRO_III_SECOES_ORDEM,
} from "../parser/quadro-iii-fields";
import { QUADRO_V_SECOES_ORDEM } from "../parser/quadro-v-fields";
import type { CampoExtraido, QuadroIII, QuadroV } from "../types";
import { QuadroStepLayout } from "./quadro-step-layout";

type QuadroComCampos = QuadroIII | QuadroV;

interface QuadroCamposStepProps {
  quadro: QuadroComCampos;
  alertas: import("../types").AlertaValidacao[];
  onChange?: (quadro: QuadroComCampos) => void;
}

function campoTemDados(valor: string): boolean {
  const text = valor.trim();
  return text.length > 0;
}

/** Mescla campos extraídos com a lista completa de definições do Quadro III por grupo. */
function camposDoGrupoQiii(grupo: string, camposExtraidos: CampoExtraido[]): CampoExtraido[] {
  const defsDoGrupo = QUADRO_III_FIELD_DEFS.filter((d) => d.grupo === grupo);
  if (defsDoGrupo.length === 0) {
    return camposExtraidos.filter((c) => (c.grupo ?? "Outros") === grupo);
  }

  const extraidosDoGrupo = camposExtraidos.filter((c) => (c.grupo ?? "Outros") === grupo);
  const byChave = new Map(extraidosDoGrupo.map((c) => [c.chave, c]));

  const merged = defsDoGrupo.map((def) => {
    const existing = byChave.get(def.chave);
    return (
      existing ?? {
        chave: def.chave,
        rotulo: def.rotulo,
        valor: "",
        grupo: def.grupo,
      }
    );
  });

  const extras = extraidosDoGrupo.filter((c) => !defsDoGrupo.some((d) => d.chave === c.chave));
  return [...merged, ...extras];
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

const GRUPO_EXPLICITACAO_QV = "Explicitação da numeração (item d)";

interface TorreExplicitacaoParts {
  titulo: string;
  prefixo: string;
  corpo: string;
}

function parseExplicitacaoTorre(valor: string): TorreExplicitacaoParts | null {
  const trimmed = valor.trim();
  const match = trimmed.match(/^(TORRE|Torre)\s*(0*(\d+))\s*([-–—:.]\s*)?/i);
  if (!match) return null;

  const numDisplay = match[3].padStart(2, "0");
  const titulo = `Torre ${numDisplay}`;
  const corpo = trimmed.slice(match[0].length).trim();

  return {
    titulo,
    prefixo: `TORRE ${numDisplay}`,
    corpo,
  };
}

function rebuildExplicitacaoValor(parts: TorreExplicitacaoParts, novoCorpo: string): string {
  const body = novoCorpo.trim();
  if (!body) return parts.prefixo;
  return `${parts.prefixo} — ${body}`;
}

function isMarcadorTorre(valor: string): TorreExplicitacaoParts | null {
  const parts = parseExplicitacaoTorre(valor);
  if (!parts || parts.corpo) return null;
  return parts;
}

type ExplicitacaoBloco =
  | { tipo: "geral"; campos: CampoExtraido[] }
  | {
      tipo: "torre";
      titulo: string;
      marcador: CampoExtraido;
      conteudo?: CampoExtraido;
      corpoNoMarcador?: string;
    };

function agruparExplicitacoes(campos: CampoExtraido[]): ExplicitacaoBloco[] {
  const ordenados = [...campos].sort((a, b) =>
    a.chave.localeCompare(b.chave, undefined, { numeric: true }),
  );

  const blocos: ExplicitacaoBloco[] = [];
  const geral: CampoExtraido[] = [];

  const flushGeral = () => {
    if (!geral.length) return;
    blocos.push({ tipo: "geral", campos: [...geral] });
    geral.length = 0;
  };

  for (let i = 0; i < ordenados.length; i++) {
    const campo = ordenados[i];
    const marcador = isMarcadorTorre(campo.valor);

    if (marcador) {
      flushGeral();
      const proximo = ordenados[i + 1];
      const proximoEhMarcador = proximo ? Boolean(isMarcadorTorre(proximo.valor)) : false;

      if (proximo && !proximoEhMarcador) {
        blocos.push({
          tipo: "torre",
          titulo: marcador.titulo,
          marcador: campo,
          conteudo: proximo,
        });
        i += 1;
      } else {
        blocos.push({
          tipo: "torre",
          titulo: marcador.titulo,
          marcador: campo,
        });
      }
      continue;
    }

    const torreComCorpo = parseExplicitacaoTorre(campo.valor);
    if (torreComCorpo?.corpo) {
      flushGeral();
      blocos.push({
        tipo: "torre",
        titulo: torreComCorpo.titulo,
        marcador: campo,
        corpoNoMarcador: torreComCorpo.corpo,
      });
      continue;
    }

    geral.push(campo);
  }

  flushGeral();
  return blocos;
}

function ExplicitacaoTexto({
  valor,
  readOnly,
  onUpdate,
}: {
  valor: string;
  readOnly?: boolean;
  onUpdate?: (valor: string) => void;
}) {
  return (
    <Textarea
      rows={3}
      value={valor}
      readOnly={readOnly}
      className={`text-sm leading-7 w-full ${readOnly ? "bg-muted/30" : ""}`}
      onChange={onUpdate ? (e) => onUpdate(e.target.value) : undefined}
    />
  );
}

function ExplicitacaoNumeracaoSection({
  campos,
  onUpdate,
  readOnly = false,
}: {
  campos: CampoExtraido[];
  onUpdate?: (chave: string, valor: string) => void;
  readOnly?: boolean;
}) {
  const blocos = agruparExplicitacoes(campos);

  return (
    <div className="space-y-5">
      {blocos.map((bloco) => {
        if (bloco.tipo === "geral") {
          return bloco.campos.map((campo) => (
            <CampoInput
              key={campo.chave}
              campo={campo}
              readOnly={readOnly}
              onUpdate={onUpdate ? (valor) => onUpdate(campo.chave, valor) : undefined}
            />
          ));
        }

        const parts = parseExplicitacaoTorre(bloco.marcador.valor);
        const valorExibicao =
          bloco.conteudo?.valor ??
          (parts && bloco.corpoNoMarcador !== undefined ? bloco.corpoNoMarcador : "");

        const handleUpdate = (novoValor: string) => {
          if (!onUpdate) return;
          if (bloco.conteudo) {
            onUpdate(bloco.conteudo.chave, novoValor);
            return;
          }
          if (parts) {
            onUpdate(bloco.marcador.chave, rebuildExplicitacaoValor(parts, novoValor));
          }
        };

        const temCampoConteudo = Boolean(bloco.conteudo) || bloco.corpoNoMarcador !== undefined;

        return (
          <div
            key={bloco.marcador.chave}
            className="space-y-2 pt-4 first:pt-0 border-t border-border/60 first:border-0"
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {bloco.titulo}
            </h4>
            {(temCampoConteudo || valorExibicao.trim()) && (
              <ExplicitacaoTexto
                valor={valorExibicao}
                readOnly={readOnly}
                onUpdate={onUpdate ? handleUpdate : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const QUADRO_III_BLOCO_ICONS: Record<string, LucideIcon> = {
  "Referência e classificação": Layers,
  "Áreas e custo base": Ruler,
  "Parcelas adicionais": PackagePlus,
  "Totalização da obra": Receipt,
};

function DependenciasPrivativasTable({
  campos,
  onUpdate,
  readOnly = false,
}: {
  campos: CampoExtraido[];
  onUpdate?: (chave: string, valor: string) => void;
  readOnly?: boolean;
}) {
  const rows = campos
    .filter((c) => c.chave.startsWith("dependencia_config_"))
    .sort((a, b) => a.chave.localeCompare(b.chave, undefined, { numeric: true }));

  if (!rows.length) return null;

  return (
    <div className="md:col-span-2 space-y-2">
      <p className="text-xs text-muted-foreground">
        Dependências de uso privativo da unidade autônoma
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 text-left font-medium">Quartos</th>
              <th className="px-3 py-2 text-left font-medium">Salas</th>
              <th className="px-3 py-2 text-left font-medium">Banheiros ou WC</th>
              <th className="px-3 py-2 text-left font-medium">Quartos de empregados</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const parts = row.valor.split("|").map((p) => p.trim());
              const [quartos = "", salas = "", banheiros = "", empregados = ""] = parts;

              const updatePart = (index: number, value: string) => {
                if (!onUpdate) return;
                const next = [...parts];
                next[index] = value;
                onUpdate(row.chave, next.join(" | "));
              };

              return (
                <tr key={row.chave} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={quartos}
                      readOnly={readOnly}
                      onChange={onUpdate ? (e) => updatePart(0, e.target.value) : undefined}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={salas}
                      readOnly={readOnly}
                      onChange={onUpdate ? (e) => updatePart(1, e.target.value) : undefined}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={banheiros}
                      readOnly={readOnly}
                      onChange={onUpdate ? (e) => updatePart(2, e.target.value) : undefined}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={empregados}
                      readOnly={readOnly}
                      onChange={onUpdate ? (e) => updatePart(3, e.target.value) : undefined}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampoInput({
  campo,
  onUpdate,
  readOnly = false,
}: {
  campo: CampoExtraido;
  onUpdate?: (valor: string) => void;
  readOnly?: boolean;
}) {
  const isLong =
    campo.valor.length > 80 ||
    campo.chave.startsWith("explicitacao_") ||
    campo.chave === "unidades_por_pavimento" ||
    campo.valor.length > 60;

  return (
    <div className={campo.valor.length > 60 ? "md:col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground mb-1 block">{campo.rotulo}</Label>
      {isLong ? (
        <Textarea
          rows={3}
          value={campo.valor}
          readOnly={readOnly}
          className={readOnly ? "bg-muted/30" : undefined}
          onChange={onUpdate ? (e) => onUpdate(e.target.value) : undefined}
        />
      ) : (
        <Input
          value={campo.valor}
          readOnly={readOnly}
          className={readOnly ? "bg-muted/30" : undefined}
          onChange={onUpdate ? (e) => onUpdate(e.target.value) : undefined}
        />
      )}
    </div>
  );
}

export function QuadroCamposStep({ quadro, alertas, onChange }: QuadroCamposStepProps) {
  const readOnly = !onChange;

  const updateCampo = (chave: string, valor: string) => {
    if (!onChange) return;
    const exists = quadro.campos.some((c) => c.chave === chave);
    if (!exists) {
      const def = QUADRO_III_FIELD_DEFS.find((d) => d.chave === chave);
      onChange({
        ...quadro,
        campos: [
          ...quadro.campos,
          {
            chave,
            rotulo: def?.rotulo ?? chave,
            valor,
            grupo: def?.grupo,
          },
        ],
      });
      return;
    }

    onChange({
      ...quadro,
      campos: quadro.campos.map((c) => (c.chave === chave ? { ...c, valor } : c)),
    });
  };

  const camposVisiveis = quadro.campos.filter((c) => campoTemDados(c.valor));

  const renderCamposAgrupados = (
    secoesOrdem: readonly string[],
    options?: { showDependencias?: boolean; mergeQiiiDefs?: boolean; useBlocos?: boolean },
  ) => {
    const porGrupo = new Map<string, CampoExtraido[]>();

    if (options?.mergeQiiiDefs) {
      for (const grupo of secoesOrdem) {
        porGrupo.set(grupo, camposDoGrupoQiii(grupo, quadro.campos));
      }
      for (const campo of quadro.campos) {
        const grupo = campo.grupo ?? "Outros";
        if (secoesOrdem.includes(grupo)) continue;
        const list = porGrupo.get(grupo) ?? [];
        list.push(campo);
        porGrupo.set(grupo, list);
      }
    } else {
      for (const campo of camposVisiveis) {
        const grupo = campo.grupo ?? "Outros";
        const list = porGrupo.get(grupo) ?? [];
        list.push(campo);
        porGrupo.set(grupo, list);
      }
    }

    const gruposOrdenados = secoesOrdem.filter((g) => porGrupo.has(g));
    const extras = [...porGrupo.keys()].filter((g) => !secoesOrdem.includes(g));

    const renderCamposGrupo = (grupo: string) => {
      const camposGrupo = (porGrupo.get(grupo) ?? []).filter(
        (c) => options?.mergeQiiiDefs || campoTemDados(c.valor),
      );
      if (camposGrupo.length === 0) return null;

      if (grupo === GRUPO_EXPLICITACAO_QV) {
        const explicitacoes = camposGrupo.filter((c) => c.chave.startsWith("explicitacao_"));
        const demais = camposGrupo.filter((c) => !c.chave.startsWith("explicitacao_"));

        return (
          <div className="space-y-4">
            {demais.map((campo) => (
              <CampoInput
                key={campo.chave}
                campo={campo}
                readOnly={readOnly}
                onUpdate={readOnly ? undefined : (valor) => updateCampo(campo.chave, valor)}
              />
            ))}
            {explicitacoes.length > 0 && (
              <ExplicitacaoNumeracaoSection
                campos={explicitacoes}
                readOnly={readOnly}
                onUpdate={readOnly ? undefined : updateCampo}
              />
            )}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options?.showDependencias && grupo === "Classificação e projeto-padrão" && (
            <DependenciasPrivativasTable
              campos={porGrupo.get(grupo) ?? []}
              onUpdate={readOnly ? undefined : updateCampo}
              readOnly={readOnly}
            />
          )}
          {camposGrupo
            .filter((c) => !c.chave.startsWith("dependencia_config_"))
            .map((campo) => (
              <CampoInput
                key={campo.chave}
                campo={campo}
                readOnly={readOnly}
                onUpdate={readOnly ? undefined : (valor) => updateCampo(campo.chave, valor)}
              />
            ))}
        </div>
      );
    };

    const renderGrupo = (grupo: string) => {
      const conteudo = renderCamposGrupo(grupo);
      if (!conteudo) return null;

      return (
        <SubBloco key={grupo} titulo={grupo}>
          {conteudo}
        </SubBloco>
      );
    };

    if (options?.useBlocos) {
      const gruposRenderizados = new Set<string>();

      return (
        <div className="space-y-4">
          {QUADRO_III_BLOCOS.map((bloco) => {
            const subsecoes = bloco.grupos
              .map((grupo) => {
                const rendered = renderGrupo(grupo);
                if (rendered) gruposRenderizados.add(grupo);
                return rendered;
              })
              .filter(Boolean);

            if (!subsecoes.length) return null;

            const Icon = QUADRO_III_BLOCO_ICONS[bloco.titulo] ?? Calculator;

            return (
              <BlocoSecao key={bloco.titulo} titulo={bloco.titulo} icon={Icon}>
                <div className="space-y-3">{subsecoes}</div>
              </BlocoSecao>
            );
          })}
          {extras.map((grupo) => renderGrupo(grupo))}
          {gruposOrdenados
            .filter((g) => !gruposRenderizados.has(g))
            .map((grupo) => renderGrupo(grupo))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {gruposOrdenados.map((grupo) => renderGrupo(grupo))}
        {extras.map((grupo) => renderGrupo(grupo))}
      </div>
    );
  };

  return (
    <QuadroStepLayout
      titulo={quadro.titulo}
      descricao={
        quadro.id === "qiii"
          ? "Revise todos os campos do Quadro III. Itens sem valor no documento aparecem em branco para preenchimento manual."
          : `${camposVisiveis.length} campo(s) com dados extraídos. Campos em branco no documento não são exibidos.`
      }
      alertas={alertas}
    >
      {quadro.id === "qiii" || quadro.id === "qv" ? (
        quadro.id === "qiii" || camposVisiveis.length > 0 ? (
          renderCamposAgrupados(
            quadro.id === "qiii" ? QUADRO_III_SECOES_ORDEM : QUADRO_V_SECOES_ORDEM,
            {
              showDependencias: quadro.id === "qiii",
              mergeQiiiDefs: quadro.id === "qiii",
              useBlocos: quadro.id === "qiii",
            },
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum campo com valor encontrado neste quadro. Verifique o arquivo ou avance se o quadro
            estiver vazio no documento.
          </p>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {camposVisiveis.map((campo) => (
            <CampoInput
              key={campo.chave}
              campo={campo}
              readOnly={readOnly}
              onUpdate={readOnly ? undefined : (valor) => updateCampo(campo.chave, valor)}
            />
          ))}
        </div>
      )}
    </QuadroStepLayout>
  );
}
