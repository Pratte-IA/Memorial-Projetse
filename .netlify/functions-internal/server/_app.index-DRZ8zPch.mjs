import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { L as Link } from "./_libs/tanstack__react-router.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { S as StatusBadge } from "./_ssr/status-badge-BUUpRPwN.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { B as Button } from "./_ssr/button-DjOZMqFS.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { u as useQuery } from "./_libs/tanstack__react-query.mjs";
import { c as supabase } from "./_ssr/router-B3TCsBUu.mjs";
import { u as useEmpreendimentosList } from "./_ssr/hooks-C-EOYi9T.mjs";
import "./_libs/sonner.mjs";
import "./_ssr/index.mjs";
import { P as Plus, B as Building2, e as FileClock, f as FileCheckCorner, g as FileExclamationPoint, h as FileCheck, D as Download, A as ArrowUpRight } from "./_libs/lucide-react.mjs";
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
import "./_ssr/status-BduXORC_.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/tanstack__query-core.mjs";
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
const STATUS_EM_VALIDACAO = /* @__PURE__ */ new Set(["em_validacao", "dados_extraidos", "quadro_enviado"]);
const STATUS_MEMORIAL_GERADO = /* @__PURE__ */ new Set(["gerado", "em_revisao", "rascunho"]);
async function fetchDashboardIndicators() {
  const [empreendimentosRes, memoriaisRes] = await Promise.all([
    supabase.from("empreendimentos").select("status, pendencias_count"),
    supabase.from("memoriais").select("status")
  ]);
  if (empreendimentosRes.error) throw empreendimentosRes.error;
  if (memoriaisRes.error) throw memoriaisRes.error;
  const empreendimentos = empreendimentosRes.data ?? [];
  const memoriais = memoriaisRes.data ?? [];
  return {
    total: empreendimentos.length,
    emValidacao: empreendimentos.filter((e) => STATUS_EM_VALIDACAO.has(e.status)).length,
    geradas: memoriais.filter((m) => STATUS_MEMORIAL_GERADO.has(m.status)).length,
    pendentes: empreendimentos.filter((e) => e.pendencias_count > 0).length,
    aprovados: empreendimentos.filter((e) => e.status === "aprovado").length,
    exportados: empreendimentos.filter((e) => e.status === "exportado").length
  };
}
function useDashboardIndicators() {
  return useQuery({
    queryKey: ["dashboard", "indicators"],
    queryFn: fetchDashboardIndicators
  });
}
const indicadorConfig = [{
  key: "total",
  label: "Empreendimentos",
  icon: Building2,
  tone: "default"
}, {
  key: "emValidacao",
  label: "Em validação",
  icon: FileClock,
  tone: "atencao"
}, {
  key: "geradas",
  label: "Memoriais gerados",
  icon: FileCheckCorner,
  tone: "ceu"
}, {
  key: "pendentes",
  label: "Pendentes de revisão",
  icon: FileExclamationPoint,
  tone: "alerta"
}, {
  key: "aprovados",
  label: "Aprovados",
  icon: FileCheck,
  tone: "verde"
}, {
  key: "exportados",
  label: "Exportados",
  icon: Download,
  tone: "default"
}];
function toneClass(tone) {
  switch (tone) {
    case "atencao":
      return "text-[oklch(0.45_0.13_85)] bg-[var(--color-atencao)]/15";
    case "ceu":
      return "text-[var(--color-ceu)] bg-[var(--color-ceu)]/10";
    case "alerta":
      return "text-[var(--color-alerta)] bg-[var(--color-alerta)]/10";
    case "verde":
      return "text-[var(--color-verde-escuro)] bg-[var(--color-verde)]/15";
    default:
      return "text-foreground bg-muted";
  }
}
function Dashboard() {
  const {
    data: indicadores,
    isLoading: loadingIndicadores,
    isError: erroIndicadores
  } = useDashboardIndicators();
  const {
    data: empreendimentos,
    isLoading: loadingLista,
    isError: erroLista
  } = useEmpreendimentosList();
  const recentes = (empreendimentos ?? []).slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Dashboard", subtitle: "Acompanhamento técnico dos memoriais em andamento.", action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/empreendimentos/novo", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Novo empreendimento"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-8 max-w-[1600px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-[0.14em] text-muted-foreground mb-3 font-medium", children: "Indicadores operacionais" }),
        erroIndicadores && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 border-border shadow-none text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar os indicadores. Tente recarregar a página." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3", children: loadingIndicadores ? indicadorConfig.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border shadow-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-9 rounded-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-16 mt-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24 mt-2" })
        ] }, i.key)) : indicadorConfig.map((i) => {
          const Icon = i.icon;
          const value = indicadores?.[i.key] ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border shadow-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-md flex items-center justify-center ${toneClass(i.tone)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", strokeWidth: 1.8 }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-semibold tracking-tight text-mono-tabular", children: value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: i.label })
            ] })
          ] }, i.label);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium", children: "Empreendimentos recentes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Últimos memoriais com movimentação técnica." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/empreendimentos", children: [
            "Ver todos ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-none overflow-hidden p-0", children: erroLista ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-12 text-center text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar os empreendimentos." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Empreendimento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Incorporadora" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Cidade / UF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Responsável" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Atualizado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-5 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
            loadingLista && Array.from({
              length: 3
            }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", colSpan: 7, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }) }, i)),
            !loadingLista && recentes.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 font-medium text-foreground", children: e.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground", children: e.incorporadora }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5 text-muted-foreground", children: [
                e.cidade,
                "/",
                e.uf
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground", children: e.responsavel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: e.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground text-mono-tabular", children: e.atualizadoEm }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/empreendimentos/$id", params: {
                id: e.idParam
              }, children: "Abrir" }) }) })
            ] }, e.id)),
            !loadingLista && recentes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-5 py-12 text-center text-sm text-muted-foreground", children: "Nenhum empreendimento cadastrado ainda." }) })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
