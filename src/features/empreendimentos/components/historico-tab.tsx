import { History as HistoryIcon } from "lucide-react";

import { AuditTimeline } from "@/features/auditoria/components/audit-timeline";
import { useAuditEvents } from "@/features/auditoria/hooks";
import { useAuth } from "@/features/auth/use-auth";

import { SectionTitle } from "./detail-ui";

interface HistoricoTabProps {
  empreendimentoId: number | null;
}

export function HistoricoTab({ empreendimentoId }: HistoricoTabProps) {
  const { membership } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const { data: events, isLoading, isError } = useAuditEvents(orgId, empreendimentoId);

  if (empreendimentoId === null) {
    return (
      <AuditTimeline
        events={[]}
        isLoading={false}
        emptyMessage="Histórico disponível apenas para empreendimentos salvos no banco."
      />
    );
  }

  return (
    <div>
      <SectionTitle icon={HistoryIcon}>Linha do tempo</SectionTitle>
      <div className="mt-6">
        <AuditTimeline
          events={events}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Nenhum evento registrado para este empreendimento."
        />
      </div>
    </div>
  );
}
