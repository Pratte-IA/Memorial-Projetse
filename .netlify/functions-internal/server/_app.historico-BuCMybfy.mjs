import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { u as useAuditEvents, A as AuditTimeline } from "./_ssr/hooks-CTq-Bd8S.mjs";
import { u as useAuthContext } from "./_ssr/router-B3TCsBUu.mjs";
import "./_libs/sonner.mjs";
import "./_ssr/index.mjs";
import "./_ssr/button-DjOZMqFS.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/lucide-react.mjs";
import "./_ssr/card-BtiUI6Md.mjs";
import "./_ssr/skeleton-BIi6OkoP.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/tanstack__query-core.mjs";
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
function Historico() {
  const {
    membership
  } = useAuthContext();
  const orgId = membership?.organization_id ?? null;
  const {
    data: events,
    isLoading,
    isError
  } = useAuditEvents(orgId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Histórico", subtitle: "Rastreabilidade completa de eventos da esteira de memoriais.", breadcrumb: [{
      label: "Histórico"
    }] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 max-w-4xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditTimeline, { events, isLoading, isError, showEmpreendimento: true, emptyMessage: "Nenhum evento de auditoria registrado." }) })
  ] });
}
export {
  Historico as component
};
