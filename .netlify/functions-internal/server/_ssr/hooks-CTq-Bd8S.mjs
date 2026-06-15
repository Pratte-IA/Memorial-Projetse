import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card } from "./card-BtiUI6Md.mjs";
import { S as Skeleton } from "./skeleton-BIi6OkoP.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as supabase } from "./router-B3TCsBUu.mjs";
function AuditTimeline({
  events,
  isLoading,
  isError,
  emptyMessage = "Nenhum evento registrado.",
  showEmpreendimento = false
}) {
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none space-y-4", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar o histórico." });
  }
  if (!events || events.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-muted-foreground", children: emptyMessage });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l-2 border-border ml-2 space-y-6", children: events.map((h) => {
    const d = new Date(h.createdAt);
    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "pl-6 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-card border-2 border-[var(--color-verde-claro)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-mono-tabular text-muted-foreground", children: [
          data,
          " · ",
          hora
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-[var(--color-verde-escuro)] font-medium", children: h.userName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-muted", children: h.eventTypeLabel }),
        showEmpreendimento && h.empreendimentoNome && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: h.empreendimentoNome })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: h.description })
    ] }, h.id);
  }) }) });
}
const EVENT_LABELS = {
  criacao: "Criação",
  upload: "Upload",
  extracao: "Extração",
  validacao: "Validação",
  edicao: "Edição",
  geracao: "Geração",
  aprovacao: "Aprovação",
  exportacao: "Exportação",
  configuracao: "Configuração"
};
function getEventTypeLabel(eventType) {
  return EVENT_LABELS[eventType] ?? eventType;
}
function mapRowToAuditEvent(row) {
  return {
    id: row.id,
    eventType: row.event_type,
    eventTypeLabel: getEventTypeLabel(row.event_type),
    description: row.description,
    createdAt: row.created_at,
    userName: row.profiles?.full_name ?? "Sistema",
    empreendimentoId: row.empreendimento_id,
    empreendimentoNome: row.empreendimentos?.nome ?? null
  };
}
const AUDIT_SELECT = `
  id,
  event_type,
  description,
  created_at,
  empreendimento_id,
  profiles:profile_id ( full_name ),
  empreendimentos ( nome )
`;
async function fetchAuditEvents(input) {
  let query = supabase.from("audit_events").select(AUDIT_SELECT).eq("organization_id", input.organizationId).order("created_at", { ascending: false }).limit(input.limit ?? 50);
  if (input.empreendimentoId) {
    query = query.eq("empreendimento_id", input.empreendimentoId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapRowToAuditEvent);
}
function auditEventsQueryKey(organizationId, empreendimentoId) {
  return ["audit-events", organizationId, empreendimentoId ?? "all"];
}
function useAuditEvents(organizationId, empreendimentoId) {
  return useQuery({
    queryKey: organizationId !== null ? auditEventsQueryKey(organizationId, empreendimentoId) : ["audit-events", "disabled"],
    queryFn: () => fetchAuditEvents({
      organizationId,
      empreendimentoId: empreendimentoId ?? void 0
    }),
    enabled: organizationId !== null && organizationId > 0
  });
}
export {
  AuditTimeline as A,
  useAuditEvents as u
};
