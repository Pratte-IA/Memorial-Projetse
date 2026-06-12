import { getEventTypeLabel } from "./status";
import type { AuditEventRecord } from "./types";

type AuditRow = {
  id: number;
  event_type: string;
  description: string;
  created_at: string;
  empreendimento_id: number | null;
  profiles: { full_name: string | null } | null;
  empreendimentos: { nome: string } | null;
};

export function mapRowToAuditEvent(row: AuditRow): AuditEventRecord {
  return {
    id: row.id,
    eventType: row.event_type,
    eventTypeLabel: getEventTypeLabel(row.event_type),
    description: row.description,
    createdAt: row.created_at,
    userName: row.profiles?.full_name ?? "Sistema",
    empreendimentoId: row.empreendimento_id,
    empreendimentoNome: row.empreendimentos?.nome ?? null,
  };
}
