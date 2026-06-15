import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn, B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { B as getQuadroById, C as cellNum, D as designacaoParaExibicao, E as isUnidadeDesignacaoValida, f as fmtNum, F as QUADRO_TITULOS, G as QUADRO_III_SECOES_ORDEM, H as QUADRO_V_SECOES_ORDEM, I as QUADRO_III_FIELD_DEFS, J as fmtNumWithDecimals, h as parseBrNumeric } from "./router-B3TCsBUu.mjs";
import { C as Card } from "./card-BtiUI6Md.mjs";
import { N as Info, O as FileXCorner, Q as CircleX, m as TriangleAlert } from "../_libs/lucide-react.mjs";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function getQuadroIvB(documento) {
  return getQuadroById(documento, "qivb");
}
function isDocumentoQuadroIvB1(documento) {
  if (documento.quadroIvVariante === "b1") return true;
  const qivb = getQuadroIvB(documento);
  return qivb?.variante === "b1";
}
function getQuadroIvBTitulo(documento) {
  if (!documento) return "Quadro IV B";
  return isDocumentoQuadroIvB1(documento) ? "Quadro IV B.1" : "Quadro IV B";
}
function getQuadroIvBDescricao(documento) {
  if (!documento) {
    return "Resumo das áreas reais para registro (colunas A a G).";
  }
  return isDocumentoQuadroIvB1(documento) ? "Resumo das áreas reais com discriminação de terreno (colunas A a J). Substitui os Quadros IV A e IV B." : "Resumo das áreas reais para registro (colunas A a G).";
}
function mensagemQuadroIvAusente(quadroId, documento) {
  if (!isDocumentoQuadroIvB1(documento)) return void 0;
  if (quadroId === "qiva") {
    return "Este documento utiliza o Quadro IV B.1 (condomínio com terreno de uso exclusivo), que substitui os Quadros IV A e IV B padrão. A ausência do Quadro IV A é esperada.";
  }
  return void 0;
}
function getWizardStepTitulo(stepId, documento, defaultTitulo) {
  if (!documento || !isDocumentoQuadroIvB1(documento)) return defaultTitulo;
  if (stepId === "qivb") return "Quadro IV B.1";
  if (stepId === "qiva") return "Quadro IV A (substituído)";
  return defaultTitulo;
}
function getWizardStepDescricao(stepId, documento, defaultDescricao) {
  if (!documento || !isDocumentoQuadroIvB1(documento)) return defaultDescricao;
  if (stepId === "qivb") return getQuadroIvBDescricao(documento);
  if (stepId === "qiva") {
    return "Neste documento, o Quadro IV B.1 substitui os Quadros IV A e IV B padrão.";
  }
  return defaultDescricao;
}
const TOLERANCIA_AREA = 0.05;
function approxEqual(a, b, tolerance = TOLERANCIA_AREA) {
  if (a === null || b === null) return true;
  return Math.abs(a - b) <= tolerance;
}
function addAlerta(alertas, severidade, quadroOrigem, mensagem, quadroDestino, detalhes) {
  alertas.push({
    id: `${quadroOrigem}-${alertas.length}`,
    severidade,
    quadroOrigem,
    quadroDestino,
    mensagem,
    detalhes
  });
}
function chaveDesignacao(designacao) {
  return designacao.trim().toLowerCase();
}
function filtrarLinhasUnidade(linhas) {
  return linhas.filter((l) => isUnidadeDesignacaoValida(l.designacao));
}
function listarDesignacoesUnicas(linhas, outroConjunto) {
  const vistos = /* @__PURE__ */ new Set();
  const resultado = [];
  for (const linha of linhas) {
    const chave = chaveDesignacao(linha.designacao);
    if (!isUnidadeDesignacaoValida(linha.designacao)) continue;
    if (outroConjunto.has(chave)) continue;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    resultado.push(designacaoParaExibicao(linha.designacao));
  }
  return resultado;
}
function diffDesignacoes(linhasA, linhasB) {
  const validA = filtrarLinhasUnidade(linhasA);
  const validB = filtrarLinhasUnidade(linhasB);
  const setB = new Set(validB.map((l) => chaveDesignacao(l.designacao)));
  const setA = new Set(validA.map((l) => chaveDesignacao(l.designacao)));
  return {
    apenasEmA: listarDesignacoesUnicas(validA, setB),
    apenasEmB: listarDesignacoesUnicas(validB, setA)
  };
}
function detalhesContagemUnidades(tituloA, tituloB, apenasEmA, apenasEmB) {
  const detalhes = [];
  if (apenasEmA.length) {
    detalhes.push({
      titulo: `${apenasEmA.length} unidade(s) apenas em ${tituloA}`,
      unidades: apenasEmA
    });
  }
  if (apenasEmB.length) {
    detalhes.push({
      titulo: `${apenasEmB.length} unidade(s) apenas em ${tituloB}`,
      unidades: apenasEmB
    });
  }
  return detalhes.length ? detalhes : void 0;
}
function validarQuadroAtual(documento, quadroId) {
  const alertas = [];
  if (quadroId === "preliminares") {
    const nome = documento.preliminares.campos.find((c) => c.chave === "projeto_nome")?.valor;
    const cnpj = documento.preliminares.campos.find((c) => c.chave === "incorporador_cnpj")?.valor;
    if (!nome?.trim()) addAlerta(alertas, "erro", "preliminares", "Nome do edifício (3.1) é obrigatório.");
    if (!cnpj?.trim()) addAlerta(alertas, "aviso", "preliminares", "CNPJ do incorporador (1.3) não informado.");
  }
  if (quadroId === "qi") {
    const qi = getQuadroById(documento, "qi");
    if (!qi?.linhas.length) {
      addAlerta(alertas, "erro", "qi", "Nenhum pavimento extraído do Quadro I.");
    }
  }
  if (quadroId === "qii") {
    const qii = getQuadroById(documento, "qii");
    if (!qii?.linhas.length) {
      addAlerta(alertas, "erro", "qii", "Nenhuma unidade extraída do Quadro II.");
    }
  }
  if (quadroId === "qivb") {
    const qivb = getQuadroById(documento, "qivb");
    const titulo = getQuadroIvBTitulo(documento);
    if (!qivb?.linhas.length) {
      addAlerta(alertas, "erro", "qivb", `Nenhuma unidade extraída do ${titulo}.`);
    }
  }
  if (quadroId === "resumo") {
    const resumo = getQuadroById(documento, "resumo");
    if (!resumo?.linhas.length) {
      addAlerta(alertas, "erro", "resumo", "Nenhuma unidade extraída do Quadro Resumo.");
    }
  }
  if (quadroId === "qcomp") {
    const qcomp = getQuadroById(documento, "qcomp");
    if (!qcomp?.linhas.length) {
      addAlerta(alertas, "erro", "qcomp", "Nenhum pavimento extraído do Quadro Complementar.");
    }
  }
  const opcionaisAusentes = ["qiva", "qcomp"];
  if (opcionaisAusentes.includes(quadroId) && !documento.quadrosPresentes.includes(quadroId)) {
    return { alertas: [], podeAvancar: true };
  }
  return {
    alertas,
    podeAvancar: !alertas.some((a) => a.severidade === "erro")
  };
}
function validarCruzamento(documento) {
  const alertas = [];
  const tituloQivb = getQuadroIvBTitulo(documento);
  const qi = getQuadroById(documento, "qi");
  const qiii = getQuadroById(documento, "qiii");
  const qii = getQuadroById(documento, "qii");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");
  const areaQiReal = qi?.totais.areaRealGlobal ?? null;
  const areaQiiiReal = qiii?.campos.find((c) => c.chave === "area_real_global");
  const areaQiiiValor = areaQiiiReal?.valor ? cellNum(areaQiiiReal.valor) : null;
  if (!approxEqual(areaQiReal, areaQiiiValor)) {
    addAlerta(
      alertas,
      "erro",
      "qi",
      `Área real global diverge: Quadro I (${areaQiReal ?? "—"}) vs Quadro III 4.3 (${areaQiiiValor ?? "—"}).`,
      "qiii"
    );
  }
  const countQii = qii ? filtrarLinhasUnidade(qii.linhas).length : 0;
  const countQivb = qivb ? filtrarLinhasUnidade(qivb.linhas).length : 0;
  const countResumo = resumo ? filtrarLinhasUnidade(resumo.linhas).length : 0;
  if (countQii && countQivb && countQii !== countQivb && qii && qivb) {
    const { apenasEmA, apenasEmB } = diffDesignacoes(
      filtrarLinhasUnidade(qii.linhas),
      filtrarLinhasUnidade(qivb.linhas)
    );
    addAlerta(
      alertas,
      "erro",
      "qii",
      `Contagem de unidades diverge: Quadro II (${countQii}) vs ${tituloQivb} (${countQivb}).`,
      "qivb",
      detalhesContagemUnidades("Quadro II", tituloQivb, apenasEmA, apenasEmB)
    );
  }
  if (countQivb && countResumo && countQivb !== countResumo && qivb && resumo) {
    const { apenasEmA, apenasEmB } = diffDesignacoes(
      filtrarLinhasUnidade(qivb.linhas),
      filtrarLinhasUnidade(resumo.linhas)
    );
    addAlerta(
      alertas,
      "erro",
      "qivb",
      `Contagem de unidades diverge: ${tituloQivb} (${countQivb}) vs Quadro Resumo (${countResumo}).`,
      "resumo",
      detalhesContagemUnidades(tituloQivb, "Quadro Resumo", apenasEmA, apenasEmB)
    );
  }
  if (qivb && resumo) {
    const divergentesArea = [];
    for (const linha of resumo.linhas) {
      const ref = qivb.linhas.find((u) => chaveDesignacao(u.designacao) === chaveDesignacao(linha.designacao));
      if (!ref) continue;
      if (!approxEqual(linha.areaTotal, ref.areaRealTotal)) {
        divergentesArea.push(designacaoParaExibicao(linha.designacao));
      }
    }
    if (divergentesArea.length > 0) {
      addAlerta(
        alertas,
        "aviso",
        "resumo",
        `${divergentesArea.length} unidade(s) com área total divergente entre ${tituloQivb} e Quadro Resumo.`,
        "qivb",
        [{ titulo: "Unidades com área total diferente", unidades: divergentesArea }]
      );
    }
  }
  const cabecalhos = documento.quadros.filter((q) => q.id !== "preliminares").map((q) => q.cabecalho.empreendimento).filter(Boolean);
  const nomesUnicos = new Set(cabecalhos);
  if (nomesUnicos.size > 1) {
    addAlerta(
      alertas,
      "aviso",
      "preliminares",
      "Nome do empreendimento difere entre cabeçalhos dos quadros."
    );
  }
  return {
    alertas,
    podeAvancar: !alertas.some((a) => a.severidade === "erro")
  };
}
const MAX_UNIDADES_VISIVEIS = 15;
function ListaUnidades({ unidades }) {
  const visiveis = unidades.slice(0, MAX_UNIDADES_VISIVEIS);
  const restantes = unidades.length - visiveis.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] leading-relaxed opacity-90 mt-1", children: [
    visiveis.join(" · "),
    restantes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      " · + ",
      restantes,
      " outra(s)"
    ] })
  ] });
}
function AlertasValidacao({ alertas, onIrParaQuadro }) {
  if (!alertas.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: alertas.map((alerta) => {
    const quadrosNavegacao = [
      alerta.quadroOrigem,
      alerta.quadroDestino
    ].filter((q) => Boolean(q));
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `rounded-md border px-3 py-2 text-xs ${alerta.severidade === "erro" ? "border-destructive/40 bg-destructive/5 text-destructive" : alerta.severidade === "aviso" ? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400" : "border-border bg-muted/30 text-muted-foreground"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          alerta.severidade === "erro" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }) : alerta.severidade === "aviso" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: alerta.mensagem }),
            alerta.detalhes?.map((detalhe) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold opacity-90", children: detalhe.titulo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListaUnidades, { unidades: detalhe.unidades })
            ] }, detalhe.titulo)),
            onIrParaQuadro && quadrosNavegacao.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 pt-1.5", children: [...new Set(quadrosNavegacao)].map((quadroId) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "h-6 px-2 text-[10px]",
                onClick: () => onIrParaQuadro(quadroId),
                children: [
                  "Abrir ",
                  QUADRO_TITULOS[quadroId]
                ]
              },
              quadroId
            )) })
          ] })
        ] })
      },
      alerta.id
    );
  }) });
}
function QuadroStepLayout({
  titulo,
  descricao,
  alertas = [],
  onIrParaQuadro,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: titulo }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: descricao })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertasValidacao, { alertas, onIrParaQuadro }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 border-border shadow-none space-y-4", children })
  ] });
}
function updateCampo(quadro, chave, valor) {
  return {
    ...quadro,
    campos: quadro.campos.map((c) => c.chave === chave ? { ...c, valor } : c)
  };
}
function PreliminaresStep({ quadro, alertas, onChange }) {
  const secoes = [
    { titulo: "1. Incorporador", prefixo: "incorporador_" },
    { titulo: "2. Responsabilidade Técnica", prefixo: "rt_" },
    { titulo: "3. Dados do Projeto", prefixo: "projeto_" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    QuadroStepLayout,
    {
      titulo: quadro.titulo,
      descricao: onChange ? "Valide os campos hierárquicos da aba Informações Preliminares." : "Campos validados na importação do quadro CFMD.",
      alertas,
      children: secoes.map((secao) => {
        const campos = quadro.campos.filter((c) => c.chave.startsWith(secao.prefixo));
        if (!campos.length) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: secao.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: campos.map((campo) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: campo.chave.includes("logradouro") ? "md:col-span-2" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: campo.rotulo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: campo.valor,
                readOnly: !onChange,
                className: !onChange ? "bg-muted/30" : void 0,
                onChange: onChange ? (e) => onChange(updateCampo(quadro, campo.chave, e.target.value)) : void 0
              }
            )
          ] }, campo.chave)) })
        ] }, secao.titulo);
      })
    }
  );
}
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function campoTemDados(valor) {
  const text = valor.trim();
  return text.length > 0;
}
function camposDoGrupoQiii(grupo, camposExtraidos) {
  const defsDoGrupo = QUADRO_III_FIELD_DEFS.filter((d) => d.grupo === grupo);
  if (defsDoGrupo.length === 0) {
    return camposExtraidos.filter((c) => (c.grupo ?? "Outros") === grupo);
  }
  const extraidosDoGrupo = camposExtraidos.filter((c) => (c.grupo ?? "Outros") === grupo);
  const byChave = new Map(extraidosDoGrupo.map((c) => [c.chave, c]));
  const merged = defsDoGrupo.map((def) => {
    const existing = byChave.get(def.chave);
    return existing ?? {
      chave: def.chave,
      rotulo: def.rotulo,
      valor: "",
      grupo: def.grupo
    };
  });
  const extras = extraidosDoGrupo.filter((c) => !defsDoGrupo.some((d) => d.chave === c.chave));
  return [...merged, ...extras];
}
function DependenciasPrivativasTable({
  campos,
  onUpdate,
  readOnly = false
}) {
  const rows = campos.filter((c) => c.chave.startsWith("dependencia_config_")).sort((a, b) => a.chave.localeCompare(b.chave, void 0, { numeric: true }));
  if (!rows.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Dependências de uso privativo da unidade autônoma" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Quartos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Salas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Banheiros ou WC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Quartos de empregados" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row) => {
        const parts = row.valor.split("|").map((p) => p.trim());
        const [quartos = "", salas = "", banheiros = "", empregados = ""] = parts;
        const updatePart = (index, value) => {
          if (!onUpdate) return;
          const next = [...parts];
          next[index] = value;
          onUpdate(row.chave, next.join(" | "));
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-8 text-xs",
              value: quartos,
              readOnly,
              onChange: onUpdate ? (e) => updatePart(0, e.target.value) : void 0
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-8 text-xs",
              value: salas,
              readOnly,
              onChange: onUpdate ? (e) => updatePart(1, e.target.value) : void 0
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-8 text-xs",
              value: banheiros,
              readOnly,
              onChange: onUpdate ? (e) => updatePart(2, e.target.value) : void 0
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-8 text-xs",
              value: empregados,
              readOnly,
              onChange: onUpdate ? (e) => updatePart(3, e.target.value) : void 0
            }
          ) })
        ] }, row.chave);
      }) })
    ] }) })
  ] });
}
function CampoInput({
  campo,
  onUpdate,
  readOnly = false
}) {
  const isLong = campo.valor.length > 80 || campo.chave.startsWith("explicitacao_") || campo.chave === "unidades_por_pavimento" || campo.valor.length > 60;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: campo.valor.length > 60 ? "md:col-span-2" : "", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: campo.rotulo }),
    isLong ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        rows: 3,
        value: campo.valor,
        readOnly,
        className: readOnly ? "bg-muted/30" : void 0,
        onChange: onUpdate ? (e) => onUpdate(e.target.value) : void 0
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value: campo.valor,
        readOnly,
        className: readOnly ? "bg-muted/30" : void 0,
        onChange: onUpdate ? (e) => onUpdate(e.target.value) : void 0
      }
    )
  ] });
}
function QuadroCamposStep({ quadro, alertas, onChange }) {
  const readOnly = !onChange;
  const updateCampo2 = (chave, valor) => {
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
            grupo: def?.grupo
          }
        ]
      });
      return;
    }
    onChange({
      ...quadro,
      campos: quadro.campos.map((c) => c.chave === chave ? { ...c, valor } : c)
    });
  };
  const camposVisiveis = quadro.campos.filter((c) => campoTemDados(c.valor));
  const renderCamposAgrupados = (secoesOrdem, options) => {
    const porGrupo = /* @__PURE__ */ new Map();
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
    const renderGrupo = (grupo) => {
      const camposGrupo = (porGrupo.get(grupo) ?? []).filter(
        (c) => options?.mergeQiiiDefs || campoTemDados(c.valor)
      );
      if (camposGrupo.length === 0) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: grupo }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          options?.showDependencias && /* @__PURE__ */ jsxRuntimeExports.jsx(
            DependenciasPrivativasTable,
            {
              campos: porGrupo.get(grupo) ?? [],
              onUpdate: readOnly ? void 0 : updateCampo2,
              readOnly
            }
          ),
          camposGrupo.filter((c) => !c.chave.startsWith("dependencia_config_")).map((campo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CampoInput,
            {
              campo,
              readOnly,
              onUpdate: readOnly ? void 0 : (valor) => updateCampo2(campo.chave, valor)
            },
            campo.chave
          ))
        ] })
      ] }, grupo);
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      gruposOrdenados.map(renderGrupo),
      extras.map(renderGrupo)
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    QuadroStepLayout,
    {
      titulo: quadro.titulo,
      descricao: quadro.id === "qiii" ? "Revise todos os campos do Quadro III. Itens sem valor no documento aparecem em branco para preenchimento manual." : `${camposVisiveis.length} campo(s) com dados extraídos. Campos em branco no documento não são exibidos.`,
      alertas,
      children: quadro.id === "qiii" || quadro.id === "qv" ? quadro.id === "qiii" || camposVisiveis.length > 0 ? renderCamposAgrupados(
        quadro.id === "qiii" ? QUADRO_III_SECOES_ORDEM : QUADRO_V_SECOES_ORDEM,
        {
          showDependencias: quadro.id === "qiii",
          mergeQiiiDefs: quadro.id === "qiii"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum campo com valor encontrado neste quadro. Verifique o arquivo ou avance se o quadro estiver vazio no documento." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: camposVisiveis.map((campo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CampoInput,
        {
          campo,
          readOnly,
          onUpdate: readOnly ? void 0 : (valor) => updateCampo2(campo.chave, valor)
        },
        campo.chave
      )) })
    }
  );
}
const Table = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { ref, className: cn("w-full caption-bottom text-sm", className), ...props }) })
);
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props }));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tr",
    {
      ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }));
TableCaption.displayName = "TableCaption";
const STICKY_COLUMN_WIDTH_PX = {
  torre: 88,
  pavimento: 120,
  designacao: 160,
  equipamento: 140,
  dependencia: 140
};
function getStickyColumnStyle(colunas, index) {
  const col = colunas[index];
  if (!col.sticky) return null;
  let left = 0;
  for (let i = 0; i < index; i++) {
    if (colunas[i].sticky) {
      left += STICKY_COLUMN_WIDTH_PX[colunas[i].id] ?? 100;
    }
  }
  const minWidth = STICKY_COLUMN_WIDTH_PX[col.id] ?? 100;
  const isLastSticky = !colunas.slice(index + 1).some((c) => c.sticky);
  return { left, minWidth, isLastSticky };
}
function cellHasData(value) {
  if (value === null || value === void 0) return false;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  return value.trim().length > 0;
}
function filterColumnsWithData(rows, columns) {
  return columns.filter(
    (col) => col.alwaysShow || rows.some((row) => cellHasData(col.getValue(row)))
  );
}
function formatCellValue(value, _mono = false, decimals) {
  if (value === null || value === void 0) return "—";
  if (typeof value === "number") {
    return fmtNumWithDecimals(value, decimals);
  }
  const text = value.trim();
  return text || "—";
}
function numCol(id, label, fieldKey, getValue, alwaysShow) {
  return {
    id,
    label,
    fieldKey,
    alwaysShow,
    mono: true,
    getValue,
    getDecimals: (row) => row.formatDecimals?.[fieldKey]
  };
}
function textCol(id, label, getValue, alwaysShow, truncate, sticky, fieldKey) {
  return {
    id,
    label,
    fieldKey: fieldKey ?? id,
    alwaysShow,
    truncate,
    sticky: sticky ?? alwaysShow ?? false,
    getValue: (row) => getValue(row) || null
  };
}
const PAVIMENTO_COLS = [
  numCol("col2", "2 — Coberta padrão", "areaPrivativaCobertaPadrao", (r) => r.areaPrivativaCobertaPadrao),
  numCol("col3", "3 — Real", "areaPrivativaCobertaDiferenteReal", (r) => r.areaPrivativaCobertaDiferenteReal),
  numCol("col4", "4 — Equivalente", "areaPrivativaCobertaDiferenteEquivalente", (r) => r.areaPrivativaCobertaDiferenteEquivalente),
  numCol("col5", "5 — Total real", "areaPrivativaTotalReal", (r) => r.areaPrivativaTotalReal),
  numCol("col6", "6 — Total equiv. padrão", "areaPrivativaTotalEquivalente", (r) => r.areaPrivativaTotalEquivalente),
  numCol("col7", "7 — Coberta padrão", "areaUsoComumNaoPropCobertaPadrao", (r) => r.areaUsoComumNaoPropCobertaPadrao),
  numCol("col8", "8 — Real", "areaUsoComumNaoPropCobertaDiferenteReal", (r) => r.areaUsoComumNaoPropCobertaDiferenteReal),
  numCol("col9", "9 — Equivalente", "areaUsoComumNaoPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumNaoPropCobertaDiferenteEquivalente),
  numCol("col10", "10 — Total real", "areaUsoComumNaoPropTotalReal", (r) => r.areaUsoComumNaoPropTotalReal),
  numCol("col11", "11 — Total equiv. padrão", "areaUsoComumNaoPropTotalEquivalente", (r) => r.areaUsoComumNaoPropTotalEquivalente),
  numCol("col12", "12 — Coberta padrão", "areaUsoComumPropCobertaPadrao", (r) => r.areaUsoComumPropCobertaPadrao),
  numCol("col13", "13 — Real", "areaUsoComumPropCobertaDiferenteReal", (r) => r.areaUsoComumPropCobertaDiferenteReal),
  numCol("col14", "14 — Equivalente", "areaUsoComumPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumPropCobertaDiferenteEquivalente),
  numCol("col15", "15 — Total real", "areaUsoComumPropTotalReal", (r) => r.areaUsoComumPropTotalReal),
  numCol("col16", "16 — Total equiv. padrão", "areaUsoComumPropTotalEquivalente", (r) => r.areaUsoComumPropTotalEquivalente),
  numCol("col17", "17 — Real", "areaPavimentoReal", (r) => r.areaPavimentoReal),
  numCol("col18", "18 — Equiv. padrão", "areaPavimentoEquivalente", (r) => r.areaPavimentoEquivalente),
  numCol("colQtd", "Qtd. idênticos", "quantidadePavimentosIdenticos", (r) => r.quantidadePavimentosIdenticos)
];
function buildPavimentoColumns(includeTorre) {
  const base = [];
  if (includeTorre) {
    base.push(textCol("torre", "Torre", (r) => r.torre ?? "", false, false, true));
  }
  base.push(textCol("pavimento", "Pavimento", (r) => r.pavimento, true, false, true));
  return [...base, ...PAVIMENTO_COLS];
}
const QII_COLS = [
  textCol("designacao", "Unidade (19)", (r) => r.designacao, true, false, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol("col20", "20 — Coberta padrão", "areaPrivativaCobertaPadrao", (r) => r.areaPrivativaCobertaPadrao),
  numCol("col21", "21 — Real", "areaPrivativaCobertaDiferenteReal", (r) => r.areaPrivativaCobertaDiferenteReal),
  numCol("col22", "22 — Equivalente", "areaPrivativaCobertaDiferenteEquivalente", (r) => r.areaPrivativaCobertaDiferenteEquivalente),
  numCol("col23", "23 — Total real", "areaPrivativaTotalReal", (r) => r.areaPrivativaTotalReal),
  numCol("col24", "24 — Total equiv. padrão", "areaPrivativaTotalEquivalente", (r) => r.areaPrivativaTotalEquivalente),
  numCol("col25", "25 — Coberta padrão", "areaUsoComumNaoPropCobertaPadrao", (r) => r.areaUsoComumNaoPropCobertaPadrao),
  numCol("col26", "26 — Real", "areaUsoComumNaoPropCobertaDiferenteReal", (r) => r.areaUsoComumNaoPropCobertaDiferenteReal),
  numCol("col27", "27 — Equivalente", "areaUsoComumNaoPropCobertaDiferenteEquivalente", (r) => r.areaUsoComumNaoPropCobertaDiferenteEquivalente),
  numCol("col28", "28 — Total real", "areaUsoComumNaoPropTotalReal", (r) => r.areaUsoComumNaoPropTotalReal),
  numCol("col29", "29 — Total equiv. padrão", "areaUsoComumNaoPropTotalEquivalente", (r) => r.areaUsoComumNaoPropTotalEquivalente),
  numCol("col31", "31 — Coef. proporcionalidade", "coeficienteProporcionalidade", (r) => r.coeficienteProporcionalidade),
  numCol("col37", "37 — Área unidade real", "areaUnidadeReal", (r) => r.areaUnidadeReal),
  numCol("col38", "38 — Área unidade equiv.", "areaUnidadeEquivalente", (r) => r.areaUnidadeEquivalente)
];
const QIVB_COLS = [
  textCol("designacao", "A — Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol(
    "colB",
    "B — Área priv. principal",
    "areaPrivativaPrincipal",
    (r) => r.areaPrivativaPrincipal,
    true
  ),
  numCol(
    "colC",
    "C — Área priv. acessória",
    "areaPrivativaAcessoria",
    (r) => r.areaPrivativaAcessoria,
    true
  ),
  numCol(
    "colD",
    "D — Área priv. total",
    "areaPrivativaTotal",
    (r) => r.areaPrivativaTotal,
    true
  ),
  numCol("colE", "E — Área uso comum", "areaUsoComum", (r) => r.areaUsoComum, true),
  numCol("colF", "F — Área real total", "areaRealTotal", (r) => r.areaRealTotal, true),
  numCol(
    "colG",
    "G — Coef. proporcionalidade",
    "coeficienteProporcionalidade",
    (r) => r.coeficienteProporcionalidade,
    true
  ),
  numCol(
    "colH",
    "H — Qtd. idênticas",
    "quantidadeIdenticas",
    (r) => r.quantidadeIdenticas,
    true
  ),
  {
    id: "colI",
    label: "I — Observações",
    fieldKey: "observacoes",
    alwaysShow: true,
    wrap: true,
    getValue: (r) => r.observacoes || null
  }
];
const QIVB1_COLS = [
  textCol("designacao", "A — Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol(
    "colB",
    "B — Área priv. principal",
    "areaPrivativaPrincipal",
    (r) => r.areaPrivativaPrincipal,
    true
  ),
  numCol(
    "colC",
    "C — Área priv. acessória",
    "areaPrivativaAcessoria",
    (r) => r.areaPrivativaAcessoria,
    true
  ),
  numCol(
    "colD",
    "D — Área priv. total",
    "areaPrivativaTotal",
    (r) => r.areaPrivativaTotal,
    true
  ),
  numCol("colE", "E — Área uso comum", "areaUsoComum", (r) => r.areaUsoComum, true),
  numCol("colF", "F — Área real total", "areaRealTotal", (r) => r.areaRealTotal, true),
  numCol(
    "colG",
    "G — Terreno exclusivo",
    "areaTerrenoExclusivo",
    (r) => r.areaTerrenoExclusivo ?? null,
    true
  ),
  numCol(
    "colH",
    "H — Terreno comum (prop.)",
    "areaTerrenoComum",
    (r) => r.areaTerrenoComum ?? null,
    true
  ),
  numCol(
    "colI",
    "I — Coef. proporcionalidade",
    "coeficienteProporcionalidade",
    (r) => r.coeficienteProporcionalidade,
    true
  ),
  numCol(
    "colJ",
    "J — Coef. terreno",
    "coeficienteTerreno",
    (r) => r.coeficienteTerreno ?? null,
    true
  ),
  numCol(
    "colQtd",
    "Qtd. idênticas",
    "quantidadeIdenticas",
    (r) => r.quantidadeIdenticas,
    true
  ),
  {
    id: "observacoes",
    label: "Observações",
    fieldKey: "observacoes",
    alwaysShow: true,
    wrap: true,
    getValue: (r) => r.observacoes || null
  }
];
function buildQivbColumns(quadro) {
  return quadro.variante === "b1" ? QIVB1_COLS : QIVB_COLS;
}
function buildResumoCols(labels) {
  return [
    textCol("designacao", "Unidade", (r) => r.designacao, true, false, true),
    textCol("bloco", "Bloco / Torre", (r) => r.bloco),
    numCol(
      "areaPrivPrincipal",
      "Área priv. principal",
      "areaPrivativaPrincipal",
      (r) => r.areaPrivativaPrincipal
    ),
    numCol(
      "areaPrivAcess",
      "Área priv. acessória",
      "areaPrivativaAcessoria",
      (r) => r.areaPrivativaAcessoria
    ),
    numCol("areaComum", "Área comum", "areaComum", (r) => r.areaComum),
    numCol("areaTotal", "Área total", "areaTotal", (r) => r.areaTotal),
    numCol(
      "fracaoPredial",
      "Fração predial",
      "fracaoPredial",
      (r) => r.fracaoPredial
    ),
    numCol(
      "fracaoTerrenoPct",
      "Fração de terreno (%)",
      "fracaoTerrenoPercentual",
      (r) => r.fracaoTerrenoPercentual
    ),
    numCol(
      "fracaoTerrenoM2",
      "Fração de terreno (m²)",
      "fracaoTerrenoM2",
      (r) => r.fracaoTerrenoM2
    ),
    numCol("valor", "Valor unidade (R$)", "valorUnidade", (r) => r.valorUnidade),
    {
      id: "confNorte",
      label: labels.norte,
      fieldKey: "confrontacaoNorte",
      wrap: true,
      getValue: (r) => r.confrontacaoNorte || null
    },
    {
      id: "confSul",
      label: labels.sul,
      fieldKey: "confrontacaoSul",
      wrap: true,
      getValue: (r) => r.confrontacaoSul || null
    },
    {
      id: "confLeste",
      label: labels.leste,
      fieldKey: "confrontacaoLeste",
      wrap: true,
      getValue: (r) => r.confrontacaoLeste || null
    },
    {
      id: "confOeste",
      label: labels.oeste,
      fieldKey: "confrontacaoOeste",
      wrap: true,
      getValue: (r) => r.confrontacaoOeste || null
    }
  ];
}
const QIVA_COLS = [
  textCol("designacao", "Unidade", (r) => r.designacao, true),
  textCol("bloco", "Bloco / Torre", (r) => r.bloco),
  numCol("areaEquiv", "Área equivalente", "areaEquivalente", (r) => r.areaEquivalente),
  numCol("custo", "Custo", "custo", (r) => r.custo),
  numCol("coef", "Coef. proporcionalidade", "coeficienteProporcionalidade", (r) => r.coeficienteProporcionalidade),
  numCol("qtd", "Qtd. idênticas", "quantidadeIdenticas", (r) => r.quantidadeIdenticas)
];
const QVI_COLS = [
  textCol("equipamento", "Equipamento", (r) => r.equipamento, true),
  textCol("tipo", "Tipo / Marca", (r) => r.tipoMarca, false, false, false, "tipoMarca"),
  textCol("acabamento", "Acabamento", (r) => r.acabamento)
];
const ACABAMENTO_COLS = [
  textCol("dependencia", "DEPENDÊNCIAS", (r) => r.dependencia, true, false, true),
  textCol("pisoRev", "Revestimento", (r) => r.pisoRevestimento, false, false, false, "pisoRevestimento"),
  textCol("pisoAcab", "Acabamento", (r) => r.pisoAcabamento, false, false, false, "pisoAcabamento"),
  textCol("pisoSoleira", "Soleira", (r) => r.pisoSoleira),
  textCol("paredeRev", "Revestimento", (r) => r.paredeRevestimento, false, false, false, "paredeRevestimento"),
  textCol("paredeAcab", "Acabamento", (r) => r.paredeAcabamento, false, false, false, "paredeAcabamento"),
  textCol("paredeRodape", "Rodapé", (r) => r.paredeRodape),
  textCol("tetoRev", "Revestimento", (r) => r.tetoRevestimento, false, false, false, "tetoRevestimento"),
  textCol("tetoAcab", "Acabamento", (r) => r.tetoAcabamento, false, false, false, "tetoAcabamento"),
  textCol("peitoril", "Peitoril", (r) => r.peitoril)
];
function buildQuadroTabelaView(quadro) {
  if (quadro.id === "qi" || quadro.id === "qcomp") {
    const linhas = quadro.linhas;
    const allCols = buildPavimentoColumns(quadro.id === "qcomp");
    return {
      colunas: filterColumnsWithData(linhas, allCols),
      linhas,
      filtroFn: (row, filtro) => row.pavimento.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "qii") {
    const linhas = quadro.linhas;
    return {
      colunas: filterColumnsWithData(linhas, QII_COLS),
      linhas,
      filtroFn: (row, filtro) => row.designacao.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "qivb") {
    const linhas = quadro.linhas;
    const allCols = buildQivbColumns(quadro);
    return {
      colunas: filterColumnsWithData(linhas, allCols),
      linhas,
      filtroFn: (row, filtro) => row.designacao.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "resumo") {
    const resumo = quadro;
    const linhas = resumo.linhas;
    const allCols = buildResumoCols(resumo.confrontacaoLabels);
    return {
      colunas: filterColumnsWithData(linhas, allCols),
      linhas,
      filtroFn: (row, filtro) => row.designacao.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "qiva") {
    const linhas = quadro.linhas;
    return {
      colunas: filterColumnsWithData(linhas, QIVA_COLS),
      linhas,
      filtroFn: (row, filtro) => row.designacao.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "qvi") {
    const linhas = quadro.linhas;
    return {
      colunas: filterColumnsWithData(linhas, QVI_COLS),
      linhas,
      filtroFn: (row, filtro) => row.equipamento.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  if (quadro.id === "qvii" || quadro.id === "qviii") {
    const linhas = quadro.linhas;
    const linhasComDados = linhas.filter((l) => !l.isSecao);
    return {
      colunas: filterColumnsWithData(linhasComDados, ACABAMENTO_COLS),
      linhas,
      filtroFn: (row, filtro) => row.dependencia.toLowerCase().includes(filtro.toLowerCase())
    };
  }
  return null;
}
function parseNumericInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—") return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const n = parseBrNumeric(normalized);
  if (n !== null) return n;
  const fallback = Number(normalized);
  return Number.isFinite(fallback) ? fallback : null;
}
function coerceValue(current, raw) {
  if (typeof current === "number" || current === null) {
    return parseNumericInput(raw);
  }
  if (current === void 0 && /^-?\d[\d.,]*$/.test(raw.trim())) {
    return parseNumericInput(raw);
  }
  const text = raw.trim();
  return text === "—" ? "" : text;
}
function updateLinhaInQuadro(quadro, lineIndex, fieldKey, raw) {
  if (!("linhas" in quadro) || !Array.isArray(quadro.linhas)) return quadro;
  if (lineIndex < 0 || lineIndex >= quadro.linhas.length) return quadro;
  const linhas = [...quadro.linhas];
  const atual = { ...linhas[lineIndex] };
  const nextValue = coerceValue(atual[fieldKey], raw);
  linhas[lineIndex] = {
    ...atual,
    [fieldKey]: nextValue
  };
  return { ...quadro, linhas };
}
function cellEditDisplayValue(value) {
  if (value === null || value === void 0) return "";
  if (typeof value === "number") {
    return String(value).replace(".", ",");
  }
  return value;
}
const SECTION_LABELS = {
  nao_prop: "Áreas de divisão não proporcional",
  prop: "Áreas de divisão proporcional",
  pavimento: "Área do pavimento",
  quantidade: "Quantidade (pav. idênticos)",
  unidade_areas: "Áreas da unidade autônoma",
  coef_area: "Coeficiente e área da unidade"
};
const GROUP_LABELS = {
  privativa: "Área privativa",
  uso_comum_np: "Área de uso comum",
  uso_comum_p: "Áreas de uso comum"
};
const PAVIMENTO_HEADER_META = {
  col2: { num: "2", short: "Coberta padrão", section: "nao_prop", group: "privativa" },
  col3: { num: "3", short: "Real", section: "nao_prop", group: "privativa" },
  col4: { num: "4", short: "Equivalente", section: "nao_prop", group: "privativa" },
  col5: { num: "5", short: "Real (2+3)", section: "nao_prop", group: "privativa" },
  col6: { num: "6", short: "Equiv. padrão (2+4)", section: "nao_prop", group: "privativa" },
  col7: { num: "7", short: "Coberta padrão", section: "nao_prop", group: "uso_comum_np" },
  col8: { num: "8", short: "Real", section: "nao_prop", group: "uso_comum_np" },
  col9: { num: "9", short: "Equivalente", section: "nao_prop", group: "uso_comum_np" },
  col10: { num: "10", short: "Real (7+8)", section: "nao_prop", group: "uso_comum_np" },
  col11: { num: "11", short: "Equiv. padrão (7+9)", section: "nao_prop", group: "uso_comum_np" },
  col12: { num: "12", short: "Coberta padrão", section: "prop", group: "uso_comum_p" },
  col13: { num: "13", short: "Real", section: "prop", group: "uso_comum_p" },
  col14: { num: "14", short: "Equivalente", section: "prop", group: "uso_comum_p" },
  col15: { num: "15", short: "Real (12+13)", section: "prop", group: "uso_comum_p" },
  col16: { num: "16", short: "Equiv. padrão (12+14)", section: "prop", group: "uso_comum_p" },
  col17: { num: "17", short: "Real (5+10+15)", section: "pavimento" },
  col18: { num: "18", short: "Equiv. padrão (6+11+16)", section: "pavimento" },
  colQtd: { num: "", short: "Nº idênticos", section: "quantidade" }
};
const ACABAMENTO_HEADER_META = {
  pisoRev: { num: "", short: "Revestimento", section: "pisos" },
  pisoAcab: { num: "", short: "Acabamento", section: "pisos" },
  pisoSoleira: { num: "", short: "Soleira", section: "pisos" },
  paredeRev: { num: "", short: "Revestimento", section: "paredes" },
  paredeAcab: { num: "", short: "Acabamento", section: "paredes" },
  paredeRodape: { num: "", short: "Rodapé", section: "paredes" },
  tetoRev: { num: "", short: "Revestimento", section: "tetos" },
  tetoAcab: { num: "", short: "Acabamento", section: "tetos" },
  peitoril: { num: "", short: "Peitoril", section: "peitoris" }
};
const ACABAMENTO_SECTION_LABELS = {
  pisos: "PISOS",
  paredes: "PAREDES",
  tetos: "TETOS",
  peitoris: "PEITORIS"
};
const RESUMO_HEADER_META = {
  confNorte: { num: "", short: "", section: "confrontacoes" },
  confSul: { num: "", short: "", section: "confrontacoes" },
  confLeste: { num: "", short: "", section: "confrontacoes" },
  confOeste: { num: "", short: "", section: "confrontacoes" }
};
const RESUMO_SECTION_LABELS = {
  confrontacoes: "CONFRONTAÇÕES"
};
const QII_HEADER_META = {
  col20: { num: "20", short: "Coberta padrão", section: "unidade_areas", group: "privativa" },
  col21: { num: "21", short: "Real", section: "unidade_areas", group: "privativa" },
  col22: { num: "22", short: "Equivalente", section: "unidade_areas", group: "privativa" },
  col23: { num: "23", short: "Real (20+21)", section: "unidade_areas", group: "privativa" },
  col24: { num: "24", short: "Equiv. padrão (20+22)", section: "unidade_areas", group: "privativa" },
  col25: { num: "25", short: "Coberta padrão", section: "unidade_areas", group: "uso_comum_np" },
  col26: { num: "26", short: "Real", section: "unidade_areas", group: "uso_comum_np" },
  col27: { num: "27", short: "Equivalente", section: "unidade_areas", group: "uso_comum_np" },
  col28: { num: "28", short: "Real (25+26)", section: "unidade_areas", group: "uso_comum_np" },
  col29: { num: "29", short: "Equiv. padrão (25+27)", section: "unidade_areas", group: "uso_comum_np" },
  col31: { num: "31", short: "Coef. proporcionalidade", section: "coef_area" },
  col37: { num: "37", short: "Área unidade real", section: "coef_area" },
  col38: { num: "38", short: "Área unidade equiv.", section: "coef_area" }
};
function usesGroupedHeader(quadroId) {
  return quadroId === "qi" || quadroId === "qcomp" || quadroId === "qii" || quadroId === "qvii" || quadroId === "qviii" || quadroId === "resumo";
}
function getMetaMap(quadroId) {
  if (quadroId === "qii") return QII_HEADER_META;
  if (quadroId === "qvii" || quadroId === "qviii") return ACABAMENTO_HEADER_META;
  if (quadroId === "resumo") return RESUMO_HEADER_META;
  return PAVIMENTO_HEADER_META;
}
function getSectionLabels(quadroId) {
  if (quadroId === "qvii" || quadroId === "qviii") return ACABAMENTO_SECTION_LABELS;
  if (quadroId === "resumo") return RESUMO_SECTION_LABELS;
  return SECTION_LABELS;
}
function isResumoQuadro(quadroId) {
  return quadroId === "resumo";
}
function isAcabamentoQuadro(quadroId) {
  return quadroId === "qvii" || quadroId === "qviii";
}
function sectionColCount(enriched, sectionKey) {
  return enriched.filter((e) => !e.col.sticky && e.meta?.section === sectionKey).length;
}
function leafCoveredBySectionRow(enriched, meta) {
  const count = sectionColCount(enriched, meta.section);
  return count === 1 && !meta.group;
}
function spanCells(items, level, labels) {
  const cells = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.col.sticky) {
      i++;
      continue;
    }
    if (!item.meta) {
      i++;
      continue;
    }
    const key = item.meta.group ?? item.meta.section;
    if (!item.meta.group) {
      i++;
      continue;
    }
    let j = i;
    while (j < items.length) {
      const next = items[j];
      if (next.col.sticky || !next.meta) break;
      const nextKey = next.meta.group ?? next.meta.section;
      if (nextKey !== key) break;
      j++;
    }
    const count = j - i;
    const label = labels[key] ?? key;
    cells.push({ label, colspan: count, rowspan: 1, tier: "group" });
    i = j;
  }
  return cells;
}
function buildGroupedHeaderRows(quadroId, colunas) {
  const metaMap = getMetaMap(quadroId);
  const sectionLabels = getSectionLabels(quadroId);
  const enriched = colunas.map((col, index) => ({
    col,
    index,
    meta: metaMap[col.id]
  }));
  const groupCells = spanCells(enriched, "group", GROUP_LABELS);
  const headerRowCount = groupCells.length > 0 ? 3 : 2;
  const sectionRowspanWhenNoGroup = headerRowCount - 1;
  const stickyCells = [];
  for (const item of enriched) {
    if (!item.col.sticky) break;
    const stickyStyle = getStickyColumnStyle(colunas, item.index);
    stickyCells.push({
      label: item.col.label,
      colspan: 1,
      rowspan: headerRowCount,
      colId: item.col.id,
      columnIndex: item.index,
      sticky: true,
      isLastSticky: stickyStyle?.isLastSticky ?? false
    });
  }
  const leafCells = enriched.filter((item) => !item.col.sticky && item.meta).filter((item) => item.meta && !leafCoveredBySectionRow(enriched, item.meta)).map((item) => {
    const label = item.meta ? item.meta.num ? `${item.meta.num} — ${item.meta.short}` : item.meta.short || item.col.label : item.col.label;
    return {
      label,
      colspan: 1,
      rowspan: 1,
      colId: item.col.id,
      columnIndex: item.index,
      tier: "leaf"
    };
  });
  const sectionRow = [...stickyCells];
  let dataIdx = 0;
  while (dataIdx < enriched.length) {
    const item = enriched[dataIdx];
    if (item.col.sticky) {
      dataIdx++;
      continue;
    }
    if (!item.meta) {
      sectionRow.push({
        label: item.col.label,
        colspan: 1,
        rowspan: leafCells.length > 0 ? headerRowCount : 1,
        tier: "column"
      });
      dataIdx++;
      continue;
    }
    const sectionKey = item.meta.section;
    let j = dataIdx;
    while (j < enriched.length) {
      const next = enriched[j];
      if (next.col.sticky || !next.meta || next.meta.section !== sectionKey) break;
      j++;
    }
    const count = j - dataIdx;
    const hasGroup = enriched.slice(dataIdx, j).some((e) => e.meta?.group);
    const singleColSection = count === 1 && !hasGroup;
    sectionRow.push({
      label: sectionLabels[sectionKey] ?? sectionKey,
      colspan: count,
      rowspan: hasGroup ? 1 : singleColSection ? sectionRowspanWhenNoGroup : 1,
      tier: "section"
    });
    dataIdx = j;
  }
  const rows = [sectionRow];
  if (groupCells.length > 0) rows.push(groupCells);
  if (leafCells.length > 0) rows.push(leafCells);
  return rows;
}
function getHeaderStickyStyle(colunas, columnIndex) {
  const sticky = getStickyColumnStyle(colunas, columnIndex);
  if (!sticky) return null;
  return { left: sticky.left, minWidth: sticky.minWidth };
}
function stickyHeaderClass(isLastSticky) {
  return [
    "sticky z-30 bg-muted/50 text-[10px] leading-tight",
    isLastSticky ? "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] border-r border-border/60" : ""
  ].join(" ");
}
function headerCellClass(quadroId, tier, isSectionRow, isLeafRow) {
  const resolvedTier = tier ?? (isSectionRow ? "section" : isLeafRow ? "leaf" : "group");
  if (isAcabamentoQuadro(quadroId) || isResumoQuadro(quadroId)) {
    if (resolvedTier === "section") {
      return "text-[10px] leading-tight text-center bg-muted/40 font-bold uppercase tracking-wide";
    }
    if (resolvedTier === "column") {
      return "text-[10px] leading-tight whitespace-nowrap min-w-[96px] text-center bg-muted/30 font-medium";
    }
    if (resolvedTier === "leaf") {
      return isResumoQuadro(quadroId) ? "text-[10px] leading-tight whitespace-nowrap min-w-[120px] text-center" : "text-[10px] leading-tight whitespace-nowrap min-w-[88px] text-center";
    }
    return "text-[10px] leading-tight text-center bg-muted/25 font-medium";
  }
  if (resolvedTier === "section") {
    return "text-[10px] leading-tight text-center bg-muted/30 font-semibold";
  }
  if (resolvedTier === "leaf") return "text-[10px] leading-tight whitespace-nowrap min-w-[96px]";
  return "text-[10px] leading-tight text-center bg-muted/20 font-medium";
}
function GroupedTableHeader({ quadroId, colunas }) {
  const rows = buildGroupedHeaderRows(quadroId, colunas);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: rows.map((row, rowIndex) => {
    const isSectionRow = rowIndex === 0;
    const isLeafRow = rowIndex === rows.length - 1;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "hover:bg-transparent", children: row.map((cell, cellIndex) => {
      const stickyStyle = cell.sticky && cell.columnIndex !== void 0 ? getHeaderStickyStyle(colunas, cell.columnIndex) : null;
      const stickyMeta = cell.sticky && cell.columnIndex !== void 0 ? getStickyColumnStyle(colunas, cell.columnIndex) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableHead,
        {
          colSpan: cell.colspan,
          rowSpan: cell.rowspan,
          className: `h-auto py-1.5 px-2 align-middle font-medium text-muted-foreground border-b border-border/50 ${cell.sticky ? stickyHeaderClass(stickyMeta?.isLastSticky ?? false) : headerCellClass(quadroId, cell.tier, isSectionRow, isLeafRow)}`,
          style: stickyStyle ? {
            left: stickyStyle.left,
            minWidth: stickyStyle.minWidth,
            width: stickyStyle.minWidth
          } : cell.tier === "leaf" || cell.tier === "column" ? { minWidth: cell.tier === "leaf" ? 96 : 88 } : void 0,
          children: cell.label
        },
        `${rowIndex}-${cellIndex}-${cell.label}`
      );
    }) }, rowIndex);
  }) });
}
const PAGE_SIZE = 15;
function numOrDash(value, decimals) {
  if (value === null || value === void 0) return "—";
  return formatCellValue(value, true, decimals);
}
function stickyClassNames(isHeader, isLastSticky) {
  return [
    "sticky z-10 bg-card",
    isHeader ? "z-20 bg-muted/40" : "group-hover:bg-muted/50",
    isLastSticky ? "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] border-r border-border/60" : ""
  ].join(" ");
}
function textColumnClassNames(col, sticky) {
  if (sticky) return "";
  if (col.wrap) {
    return "whitespace-normal break-words align-top min-w-[12rem] max-w-[min(32rem,55vw)]";
  }
  if (col.truncate) return "max-w-[200px] truncate";
  return "";
}
function QuadroTabelaStep({ quadro, alertas, onChange, onIrParaQuadro }) {
  const [page, setPage] = reactExports.useState(0);
  const [filtro, setFiltro] = reactExports.useState("");
  const editavel = Boolean(onChange);
  const view = buildQuadroTabelaView(quadro);
  const { colunas, linhas, totalPages } = reactExports.useMemo(() => {
    if (!view) return { colunas: [], linhas: [], totalPages: 1 };
    const needle = filtro.toLowerCase();
    const filtered = view.linhas.filter(
      (row) => needle ? view.filtroFn(row, needle) : true
    );
    return {
      colunas: view.colunas,
      linhas: filtered,
      totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    };
  }, [view, filtro]);
  const pageRows = linhas.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const groupedHeader = usesGroupedHeader(quadro.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    QuadroStepLayout,
    {
      titulo: quadro.titulo,
      descricao: `${linhas.length} registro(s). ${editavel ? "Clique nas células para corrigir valores." : "Exibindo " + colunas.length + " coluna(s) com dados."}`,
      alertas,
      onIrParaQuadro,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Filtrar por designação...",
              value: filtro,
              onChange: (e) => {
                setFiltro(e.target.value);
                setPage(0);
              },
              className: "max-w-xs"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-auto", children: [
            linhas.length,
            " registro(s) · ",
            colunas.length,
            " colunas visíveis"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border overflow-x-auto max-w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { className: "[&>div]:overflow-visible", children: [
          groupedHeader ? /* @__PURE__ */ jsxRuntimeExports.jsx(GroupedTableHeader, { quadroId: quadro.id, colunas }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: colunas.map((col, colIndex) => {
            const colDef = col;
            const sticky = getStickyColumnStyle(colunas, colIndex);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableHead,
              {
                className: `text-xs ${colDef.wrap ? "whitespace-normal" : "whitespace-nowrap"} ${sticky ? stickyClassNames(true, sticky.isLastSticky) : textColumnClassNames(colDef, null)}`,
                style: sticky ? {
                  left: sticky.left,
                  minWidth: sticky.minWidth,
                  width: sticky.minWidth
                } : void 0,
                children: col.label
              },
              col.id
            );
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            pageRows.map((linha, index) => {
              const acabamentoSecao = (quadro.id === "qvii" || quadro.id === "qviii") && linha.isSecao;
              if (acabamentoSecao) {
                return /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "bg-muted/30 hover:bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableCell,
                  {
                    colSpan: colunas.length,
                    className: "text-xs font-semibold text-foreground border-b border-border/70 py-2 px-3 underline decoration-muted-foreground/50 underline-offset-2",
                    children: linha.dependencia
                  }
                ) }, index);
              }
              const globalIndex = linhas.indexOf(linha);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "group", children: colunas.map((col, colIndex) => {
                const colDef = col;
                const raw = colDef.getValue(linha);
                const decimals = colDef.getDecimals?.(linha);
                const display = colDef.mono ? formatCellValue(raw, true, decimals) : formatCellValue(raw, false, decimals);
                const sticky = getStickyColumnStyle(colunas, colIndex);
                const fieldKey = colDef.fieldKey;
                const canEdit = editavel && fieldKey && globalIndex >= 0;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableCell,
                  {
                    className: `text-xs p-1 ${colDef.mono ? "text-mono-tabular" : ""} ${textColumnClassNames(
                      colDef,
                      sticky
                    )} ${colDef.alwaysShow || colDef.sticky ? "font-medium" : ""} ${sticky ? stickyClassNames(false, sticky.isLastSticky) : ""}`,
                    style: sticky ? { left: sticky.left, minWidth: sticky.minWidth, width: sticky.minWidth } : void 0,
                    children: canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        className: `h-8 text-xs ${colDef.mono ? "text-mono-tabular" : ""} ${colDef.wrap ? "min-w-[12rem]" : "min-w-[5rem]"}`,
                        value: cellEditDisplayValue(raw),
                        onChange: (e) => {
                          if (!onChange || !fieldKey) return;
                          onChange(
                            updateLinhaInQuadro(quadro, globalIndex, fieldKey, e.target.value)
                          );
                        }
                      }
                    ) : display
                  },
                  col.id
                );
              }) }, globalIndex >= 0 ? globalIndex : index);
            }),
            !pageRows.length && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableCell,
              {
                colSpan: colunas.length || 1,
                className: "text-center text-muted-foreground py-8",
                children: "Nenhum registro encontrado."
              }
            ) })
          ] })
        ] }) }),
        totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: page === 0,
              onClick: () => setPage((p) => Math.max(0, p - 1)),
              children: "Anterior"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Página ",
            page + 1,
            " de ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: page >= totalPages - 1,
              onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
              children: "Próxima"
            }
          )
        ] }),
        (quadro.id === "qi" || quadro.id === "qcomp") && "totais" in quadro && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 pt-2 border-t border-border text-sm", children: [
          quadro.totais.areaRealGlobal !== null && quadro.totais.areaRealGlobal !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Área real global" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-mono-tabular", children: numOrDash(quadro.totais.areaRealGlobal) })
          ] }),
          quadro.totais.areaEquivalenteGlobal !== null && quadro.totais.areaEquivalenteGlobal !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Área equivalente global" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-mono-tabular", children: numOrDash(quadro.totais.areaEquivalenteGlobal) })
          ] })
        ] })
      ]
    }
  );
}
function RevisaoStep({ documento, onIrParaQuadro, somenteLeitura }) {
  const cruzamento = validarCruzamento(documento);
  const qi = getQuadroById(documento, "qi");
  const qii = getQuadroById(documento, "qii");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");
  const tituloQivb = getQuadroIvBTitulo(documento);
  const modoB1 = isDocumentoQuadroIvB1(documento);
  const nome = documento.preliminares.campos.find((c) => c.chave === "projeto_nome")?.valor ?? documento.preliminares.cabecalho.empreendimento;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Revisão cruzada" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: somenteLeitura ? "Consistência verificada na importação. Consulte os alertas abaixo se houver divergências." : "Confira a consistência entre os quadros antes de criar o empreendimento." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertasValidacao, { alertas: cruzamento.alertas, onIrParaQuadro }),
    !cruzamento.alertas.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400", children: "Nenhuma divergência crítica detectada entre os quadros analisados." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border shadow-none space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Empreendimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Nome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-right", children: nome || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Arquivo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-right", children: documento.nomeArquivo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Quadros extraídos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-right", children: documento.quadros.length })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border shadow-none space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Consistência" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Pavimentos (QI)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-mono-tabular", children: qi?.linhas.length ?? 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Unidades (QII)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-mono-tabular", children: qii?.linhas.length ?? 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-muted-foreground", children: [
              "Unidades (",
              tituloQivb.replace("Quadro ", ""),
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-mono-tabular", children: qivb?.linhas.length ?? 0 })
          ] }),
          modoB1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Modo IV B.1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-right text-xs", children: "Substitui IV A e IV B" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Unidades (Resumo)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-mono-tabular", children: resumo?.linhas.length ?? 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Área real global" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-mono-tabular", children: qi?.totais.areaRealGlobal !== null && qi?.totais.areaRealGlobal !== void 0 ? fmtNum(qi.totais.areaRealGlobal, 2) : "—" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function QuadroAusenteStep({
  quadroId,
  tituloStep,
  nomeArquivo,
  documento
}) {
  const mensagemEsperada = documento && (quadroId === "qiva" || quadroId === "qivb") ? mensagemQuadroIvAusente(quadroId, documento) : void 0;
  const Icon = mensagemEsperada ? Info : FileXCorner;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-center max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-12 w-12 rounded-full flex items-center justify-center ${mensagemEsperada ? "bg-primary/10" : "bg-muted"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            className: `h-6 w-6 ${mensagemEsperada ? "text-primary" : "text-muted-foreground"}`
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: tituloStep }),
      mensagemEsperada ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: mensagemEsperada }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Você pode avançar para o próximo quadro." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sem quadro no documento anexado." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "O arquivo ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: nomeArquivo }),
          " não contém a aba",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: QUADRO_TITULOS[quadroId] }),
          ". Você pode avançar para o próximo quadro."
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Badge as B,
  PreliminaresStep as P,
  QuadroAusenteStep as Q,
  RevisaoStep as R,
  Textarea as T,
  validarCruzamento as a,
  getWizardStepDescricao as b,
  QuadroCamposStep as c,
  QuadroTabelaStep as d,
  getWizardStepTitulo as g,
  validarQuadroAtual as v
};
