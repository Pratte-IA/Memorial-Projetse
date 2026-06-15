import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { c as cn, B as Button } from "./_ssr/button-DjOZMqFS.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { v as validarQuadroAtual, a as validarCruzamento, g as getWizardStepTitulo, b as getWizardStepDescricao, B as Badge, P as PreliminaresStep, R as RevisaoStep, Q as QuadroAusenteStep, c as QuadroCamposStep, d as QuadroTabelaStep } from "./_ssr/quadro-ausente-step-CM3YDkPt.mjs";
import { u as useAuthContext, Q as QUADROS_WIZARD_STEPS, A as ACCEPTED_QUADRO_EXTENSIONS, r as resolveQuadroContentType, p as parseQuadroNbrFile, e as updateQuadroInDocumento } from "./_ssr/router-B3TCsBUu.mjs";
import { c as useCreateEmpreendimentoFromNbr } from "./_ssr/hooks-C-EOYi9T.mjs";
import "./_ssr/index.mjs";
import { j as CircleCheck, n as ArrowLeft, o as ArrowRight, i as LoaderCircle, p as FileSpreadsheet, U as Upload } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_ssr/input-D_U8fI25.mjs";
import "./_ssr/label-C8WJLhmR.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/xlsx.mjs";
import "./_libs/date-fns.mjs";
import "./_libs/zod.mjs";
import "./_ssr/api-DHVf6FlI.mjs";
import "./_ssr/status-BduXORC_.mjs";
const TABULAR_IDS = /* @__PURE__ */ new Set([
  "qi",
  "qii",
  "qiva",
  "qivb",
  "qvi",
  "qvii",
  "qviii",
  "qcomp",
  "resumo"
]);
const CAMPOS_IDS = /* @__PURE__ */ new Set(["qiii", "qv"]);
function NovoEmpreendimentoWizard() {
  const navigate = useNavigate();
  const { membership, profile } = useAuthContext();
  const createMutation = useCreateEmpreendimentoFromNbr();
  const fileRef = reactExports.useRef(null);
  const [stepIdx, setStepIdx] = reactExports.useState(0);
  const [arquivo, setArquivo] = reactExports.useState(null);
  const [processando, setProcessando] = reactExports.useState(false);
  const [documento, setDocumento] = reactExports.useState(null);
  const step = QUADROS_WIZARD_STEPS[stepIdx];
  const irParaStep = (index) => {
    if (index === stepIdx) return;
    if (index > 0 && !documento) return;
    setStepIdx(index);
  };
  const irParaQuadro = (quadroId) => {
    const index = QUADROS_WIZARD_STEPS.findIndex((s) => s.id === quadroId);
    if (index >= 0) irParaStep(index);
  };
  const handleArquivo = async (file) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_QUADRO_EXTENSIONS.includes(ext)) {
      toast.error("Formato não suportado", {
        description: "Envie um arquivo .xlsx, .xls ou .csv no padrão CFMD NBR 12.721."
      });
      return;
    }
    setProcessando(true);
    try {
      const buffer = await file.arrayBuffer();
      const importado = {
        name: file.name,
        type: resolveQuadroContentType(file.name, file.type),
        size: file.size,
        buffer
      };
      setArquivo(importado);
      const parsed = await parseQuadroNbrFile(
        new File([buffer], importado.name, { type: importado.type })
      );
      setDocumento(parsed);
      setStepIdx(1);
      toast.success("Quadro processado", {
        description: `${parsed.quadros.length} seções extraídas. Valide quadro a quadro.`
      });
    } catch (error) {
      toast.error("Falha ao processar arquivo", {
        description: error instanceof Error ? error.message : "Verifique o formato do quadro."
      });
      setArquivo(null);
    } finally {
      setProcessando(false);
    }
  };
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleArquivo(file);
  };
  const handleQuadroChange = (quadro) => {
    if (!documento) return;
    setDocumento(updateQuadroInDocumento(documento, quadro));
  };
  const avancar = () => {
    if (!documento || step.id === "upload" || step.id === "revisao") {
      setStepIdx((i) => i + 1);
      return;
    }
    const quadroId = step.id;
    if (!documento.quadrosPresentes.includes(quadroId)) {
      setStepIdx((i) => i + 1);
      return;
    }
    const resultado = validarQuadroAtual(documento, quadroId);
    if (!resultado.podeAvancar) {
      toast.error("Pendências no quadro", {
        description: resultado.alertas.find((a) => a.severidade === "erro")?.mensagem
      });
      return;
    }
    setStepIdx((i) => i + 1);
  };
  const finalizar = async () => {
    if (!documento || !arquivo || !membership || !profile) {
      toast.error("Sessão inválida", {
        description: arquivo ? "Faça login novamente para continuar." : "Volte ao passo inicial e envie o arquivo CFMD novamente."
      });
      return;
    }
    try {
      const id = await createMutation.mutateAsync({
        documento,
        arquivo,
        organizationId: membership.organization_id,
        profileId: profile.id
      });
      toast.success("Empreendimento criado", {
        description: "Dados dos quadros NBR validados e gravados."
      });
      navigate({ to: "/empreendimentos/$id", params: { id: String(id) } });
    } catch (error) {
      const message = error instanceof Error ? error.message : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string" ? error.message : "Não foi possível salvar os dados. Tente novamente.";
      toast.error("Erro ao criar empreendimento", {
        description: message
      });
    }
  };
  const alertasAtuais = (() => {
    if (!documento || step.id === "upload") return [];
    const quadroId = step.id;
    const base = step.id === "revisao" ? [] : validarQuadroAtual(documento, quadroId).alertas;
    const stepsComCruzamento = /* @__PURE__ */ new Set(["qii", "qivb", "resumo", "revisao"]);
    if (!stepsComCruzamento.has(step.id)) return base;
    const cruzamento = validarCruzamento(documento).alertas.filter(
      (a) => step.id === "revisao" || a.quadroOrigem === quadroId || a.quadroDestino === quadroId
    );
    return [...base, ...cruzamento];
  })();
  const stepTitulo = getWizardStepTitulo(step.id, documento, step.titulo);
  const stepDescricao = getWizardStepDescricao(step.id, documento, step.descricao);
  const renderStepContent = () => {
    if (step.id === "upload") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onDragOver: (e) => e.preventDefault(),
          onDrop,
          onClick: () => fileRef.current?.click(),
          className: "border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/30 transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                accept: ".xlsx,.xls,.csv",
                className: "hidden",
                onChange: (e) => e.target.files?.[0] && void handleArquivo(e.target.files[0])
              }
            ),
            processando ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Extraindo quadros NBR 12.721..." })
            ] }) : arquivo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-10 w-10 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: arquivo.name })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Arraste o quadro CFMD aqui ou clique para selecionar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Aceita .xlsx, .xls ou .csv" })
              ] })
            ] })
          ]
        }
      ) });
    }
    if (!documento) return null;
    if (step.id === "preliminares") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        PreliminaresStep,
        {
          quadro: documento.preliminares,
          alertas: alertasAtuais,
          onChange: handleQuadroChange
        }
      );
    }
    if (step.id === "revisao") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(RevisaoStep, { documento, onIrParaQuadro: irParaQuadro });
    }
    const quadro = documento.quadros.find((q) => q.id === step.id);
    if (!quadro) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        QuadroAusenteStep,
        {
          quadroId: step.id,
          tituloStep: stepTitulo,
          nomeArquivo: documento.nomeArquivo,
          documento
        }
      );
    }
    if (CAMPOS_IDS.has(quadro.id)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        QuadroCamposStep,
        {
          quadro,
          alertas: alertasAtuais,
          onChange: handleQuadroChange
        }
      );
    }
    if (TABULAR_IDS.has(quadro.id)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        QuadroTabelaStep,
        {
          quadro,
          alertas: alertasAtuais,
          onChange: handleQuadroChange,
          onIrParaQuadro: irParaQuadro
        }
      );
    }
    return null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Novo empreendimento",
        subtitle: "Faça o upload do quadro CFMD e valide cada seção conforme a NBR 12.721.",
        breadcrumb: [{ label: "Empreendimentos" }, { label: "Novo" }]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-6xl space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: QUADROS_WIZARD_STEPS.map((s, i) => {
        const podeNavegar = i === 0 || documento !== null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: i === stepIdx ? "default" : i < stepIdx ? "secondary" : "outline",
              role: podeNavegar ? "button" : void 0,
              tabIndex: podeNavegar ? 0 : void 0,
              title: podeNavegar ? `Ir para: ${getWizardStepTitulo(s.id, documento, s.titulo)}` : void 0,
              className: cn(
                "rounded-full text-[10px]",
                podeNavegar && "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !podeNavegar && "opacity-50 cursor-not-allowed"
              ),
              onClick: () => podeNavegar && irParaStep(i),
              onKeyDown: (e) => {
                if (!podeNavegar) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  irParaStep(i);
                }
              },
              children: [
                i < stepIdx && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
                i + 1,
                ". ",
                getWizardStepTitulo(s.id, documento, s.titulo)
              ]
            }
          ),
          i < QUADROS_WIZARD_STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "›" })
        ] }, s.id);
      }) }),
      step.id !== "upload" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: stepDescricao }),
      renderStepContent(),
      step.id !== "upload" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => navigate({ to: "/empreendimentos" }),
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => setStepIdx((i) => Math.max(0, i - 1)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
                " Voltar"
              ]
            }
          ),
          stepIdx < QUADROS_WIZARD_STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: avancar, children: [
            "Validar e continuar ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: finalizar, disabled: createMutation.isPending, children: createMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
            " Salvando..."
          ] }) : "Criar empreendimento" })
        ] })
      ] })
    ] })
  ] });
}
const SplitComponent = NovoEmpreendimentoWizard;
export {
  SplitComponent as component
};
