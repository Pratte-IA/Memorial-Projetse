import { useQuery } from "@tanstack/react-query";

import { fetchAuditEvents } from "./api";

export function auditEventsQueryKey(organizationId: number, empreendimentoId?: number | null) {
  return ["audit-events", organizationId, empreendimentoId ?? "all"] as const;
}

export function useAuditEvents(organizationId: number | null, empreendimentoId?: number | null) {
  return useQuery({
    queryKey:
      organizationId !== null
        ? auditEventsQueryKey(organizationId, empreendimentoId)
        : ["audit-events", "disabled"],
    queryFn: () =>
      fetchAuditEvents({
        organizationId: organizationId!,
        empreendimentoId: empreendimentoId ?? undefined,
      }),
    enabled: organizationId !== null && organizationId > 0,
  });
}
