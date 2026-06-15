import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { S as StatusBadge } from "./_ssr/status-badge-BUUpRPwN.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { B as Button } from "./_ssr/button-DjOZMqFS.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { u as useAuthContext } from "./_ssr/router-B3TCsBUu.mjs";
import { u as useModelos } from "./_ssr/hooks-BtBViZpk.mjs";
import "./_libs/sonner.mjs";
import "./_ssr/index.mjs";
import { F as FileText, E as Eye } from "./_libs/lucide-react.mjs";
import "./_ssr/status-BduXORC_.mjs";
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
function Modelos() {
  const {
    membership
  } = useAuthContext();
  const orgId = membership?.organization_id ?? null;
  const {
    data: modelos,
    isLoading,
    isError,
    refetch
  } = useModelos(orgId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Modelos de Documento", subtitle: "Templates usados pela esteira para gerar memoriais, cláusulas e descrições de unidades.", breadcrumb: [{
      label: "Modelos"
    }] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-[1600px]", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: Array.from({
        length: 3
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40" }, i)) }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 border-border shadow-none text-center space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar os modelos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void refetch(), children: "Tentar novamente" })
      ] }),
      !isLoading && !isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: [
        (modelos ?? []).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-border shadow-none hover:border-primary/40 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-md bg-[var(--color-verde-escuro)]/10 text-[var(--color-verde-escuro)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5", strokeWidth: 1.6 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: m.status === "ativo" ? "Aprovado" : "Rascunho" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm leading-tight mb-1", children: m.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: m.tipo }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-5 pt-4 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Atualizado em ",
              m.atualizadoEm
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
              " Visualizar"
            ] })
          ] })
        ] }, m.id)),
        (modelos ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none col-span-full text-center text-sm text-muted-foreground", children: "Nenhum modelo cadastrado." })
      ] })
    ] })
  ] });
}
export {
  Modelos as component
};
