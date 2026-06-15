import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
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
    options?: { showDependencias?: boolean; mergeQiiiDefs?: boolean },
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

    const renderGrupo = (grupo: string) => {
      const camposGrupo = (porGrupo.get(grupo) ?? []).filter(
        (c) => options?.mergeQiiiDefs || campoTemDados(c.valor),
      );
      if (camposGrupo.length === 0) return null;

      return (
        <div key={grupo} className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {grupo}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options?.showDependencias && (
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
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {gruposOrdenados.map(renderGrupo)}
        {extras.map(renderGrupo)}
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
