import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { I as Input } from "./_ssr/input-D_U8fI25.mjs";
import { B as Button } from "./_ssr/button-DjOZMqFS.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { u as useAuthContext } from "./_ssr/router-B3TCsBUu.mjs";
import { a as useClausulas } from "./_ssr/hooks-BtBViZpk.mjs";
import "./_libs/sonner.mjs";
import "./_ssr/index.mjs";
import { k as Search } from "./_libs/lucide-react.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/tanstack__react-router.mjs";
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
function Clausulas() {
  const {
    membership
  } = useAuthContext();
  const orgId = membership?.organization_id ?? null;
  const {
    data: clausulas,
    isLoading,
    isError,
    refetch
  } = useClausulas(orgId);
  const [busca, setBusca] = reactExports.useState("");
  const [cat, setCat] = reactExports.useState("Todas");
  const [sel, setSel] = reactExports.useState(null);
  const categorias = reactExports.useMemo(() => ["Todas", ...Array.from(new Set((clausulas ?? []).map((c) => c.categoria)))], [clausulas]);
  const lista = (clausulas ?? []).filter((c) => {
    const okB = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase());
    const okC = cat === "Todas" || c.categoria === cat;
    return okB && okC;
  });
  reactExports.useEffect(() => {
    if (!sel && lista.length > 0) setSel(lista[0]);
  }, [lista, sel]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Biblioteca de Cláusulas", subtitle: "Blocos de texto padrão da Projetse utilizados na composição dos memoriais.", breadcrumb: [{
      label: "Cláusulas"
    }] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 grid grid-cols-12 gap-5 max-w-[1600px]", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-5 h-96" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-7 h-96" })
      ] }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 p-8 border-border shadow-none text-center space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar as cláusulas." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void refetch(), children: "Tentar novamente" })
      ] }),
      !isLoading && !isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 lg:col-span-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 border-border shadow-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: busca, onChange: (e) => setBusca(e.target.value), placeholder: "Buscar cláusula...", className: "pl-9" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-3", children: categorias.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCat(c), className: `px-2.5 py-1 text-xs font-medium rounded-md border ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`, children: c }, c)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border shadow-none p-0 overflow-hidden divide-y divide-border", children: [
            lista.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSel(c), className: `w-full text-left p-4 hover:bg-muted/40 transition-colors ${sel?.id === c.id ? "bg-muted/60" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: c.titulo }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: c.categoria })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${c.status === "publicada" ? "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)]" : "bg-muted text-muted-foreground"}`, children: c.statusLabel })
            ] }) }, c.id)),
            lista.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground text-center", children: "Nenhuma cláusula encontrada." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 lg:col-span-7", children: sel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border shadow-none p-0 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-border bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: sel.categoria }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mt-1", children: sel.titulo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: sel.resumo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 min-h-[400px] space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm leading-7 text-foreground whitespace-pre-wrap", children: renderTemplate(sel.template) }),
            sel.variaveis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "Variáveis preenchidas a partir do empreendimento" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: sel.variaveis.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-2 py-0.5 text-[11px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono", children: `{{${v}}}` }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-3 border-t border-border bg-muted/20 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Atualizado em ",
              sel.atualizadoEm
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: true, children: "Duplicar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Editar cláusula" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-muted-foreground", children: "Selecione uma cláusula." }) })
      ] })
    ] })
  ] });
}
function renderTemplate(text) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) => p.startsWith("{{") && p.endsWith("}}") ? /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-1.5 py-0.5 mx-0.5 text-[12px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono", children: p }, i) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p }, i));
}
export {
  Clausulas as component
};
