import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUADRO_III_SECOES_ORDEM } from "../parser/quadro-iii-fields";
import { QUADRO_V_SECOES_ORDEM } from "../parser/quadro-v-fields";
import type { CampoExtraido, QuadroIII, QuadroV } from "../types";
import { QuadroStepLayout } from "./quadro-step-layout";

type QuadroComCampos = QuadroIII | QuadroV;

interface QuadroCamposStepProps {
  quadro: QuadroComCampos;
  alertas: import("../types").AlertaValidacao[];
  onChange: (quadro: QuadroComCampos) => void;
}

function campoTemDados(valor: string): boolean {
  const text = valor.trim();
  return text.length > 0;
}

function DependenciasPrivativasTable({
  campos,
  onUpdate,
}: {
  campos: CampoExtraido[];
  onUpdate: (chave: string, valor: string) => void;
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
                      onChange={(e) => updatePart(0, e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={salas}
                      onChange={(e) => updatePart(1, e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={banheiros}
                      onChange={(e) => updatePart(2, e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 text-xs"
                      value={empregados}
                      onChange={(e) => updatePart(3, e.target.value)}
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
}: {
  campo: CampoExtraido;
  onUpdate: (valor: string) => void;
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
        <Textarea rows={3} value={campo.valor} onChange={(e) => onUpdate(e.target.value)} />
      ) : (
        <Input value={campo.valor} onChange={(e) => onUpdate(e.target.value)} />
      )}
    </div>
  );
}

export function QuadroCamposStep({ quadro, alertas, onChange }: QuadroCamposStepProps) {
  const updateCampo = (chave: string, valor: string) => {
    onChange({
      ...quadro,
      campos: quadro.campos.map((c) => (c.chave === chave ? { ...c, valor } : c)),
    });
  };

  const camposVisiveis = quadro.campos.filter((c) => campoTemDados(c.valor));

  const renderCamposAgrupados = (
    secoesOrdem: readonly string[],
    options?: { showDependencias?: boolean },
  ) => {
    const porGrupo = new Map<string, CampoExtraido[]>();
    for (const campo of camposVisiveis) {
      const grupo = campo.grupo ?? "Outros";
      const list = porGrupo.get(grupo) ?? [];
      list.push(campo);
      porGrupo.set(grupo, list);
    }

    const gruposOrdenados = secoesOrdem.filter((g) => porGrupo.has(g));
    const extras = [...porGrupo.keys()].filter((g) => !secoesOrdem.includes(g));

    const renderGrupo = (grupo: string) => (
      <div key={grupo} className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {grupo}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options?.showDependencias && (
            <DependenciasPrivativasTable campos={porGrupo.get(grupo) ?? []} onUpdate={updateCampo} />
          )}
          {porGrupo
            .get(grupo)
            ?.filter((c) => !c.chave.startsWith("dependencia_config_"))
            .map((campo) => (
              <CampoInput
                key={campo.chave}
                campo={campo}
                onUpdate={(valor) => updateCampo(campo.chave, valor)}
              />
            ))}
        </div>
      </div>
    );

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
      descricao={`${camposVisiveis.length} campo(s) com dados extraídos. Campos em branco no documento não são exibidos.`}
      alertas={alertas}
    >
      {quadro.id === "qiii" || quadro.id === "qv" ? (
        camposVisiveis.length > 0 ? (
          renderCamposAgrupados(
            quadro.id === "qiii" ? QUADRO_III_SECOES_ORDEM : QUADRO_V_SECOES_ORDEM,
            { showDependencias: quadro.id === "qiii" },
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
              onUpdate={(valor) => updateCampo(campo.chave, valor)}
            />
          ))}
        </div>
      )}
    </QuadroStepLayout>
  );
}
