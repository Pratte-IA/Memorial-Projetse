import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { AuditTimeline } from "@/features/auditoria/components/audit-timeline";
import { useAuditEvents } from "@/features/auditoria/hooks";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_app/historico")({
  component: Historico,
});

function Historico() {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const { data: events, isLoading, isError } = useAuditEvents(orgId);

  return (
    <>
      <PageHeader
        title="Histórico"
        subtitle="Rastreabilidade completa de eventos da esteira de memoriais."
        breadcrumb={[{ label: "Histórico" }]}
      />
      <div className="p-8 max-w-4xl">
        <AuditTimeline
          events={events}
          isLoading={isLoading}
          isError={isError}
          showEmpreendimento
          emptyMessage="Nenhum evento de auditoria registrado."
        />
      </div>
    </>
  );
}
