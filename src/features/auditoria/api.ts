import { supabase } from "@/lib/supabase/client";

import { mapRowToAuditEvent } from "./mappers";
import type { AuditEventRecord } from "./types";

const AUDIT_SELECT = `
  id,
  event_type,
  description,
  created_at,
  empreendimento_id,
  profiles:profile_id ( full_name ),
  empreendimentos ( nome )
`;

export async function fetchAuditEvents(input: {
  organizationId: number;
  empreendimentoId?: number | null;
  limit?: number;
}): Promise<AuditEventRecord[]> {
  let query = supabase
    .from("audit_events")
    .select(AUDIT_SELECT)
    .eq("organization_id", input.organizationId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 50);

  if (input.empreendimentoId) {
    query = query.eq("empreendimento_id", input.empreendimentoId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as Parameters<typeof mapRowToAuditEvent>[0][]).map(mapRowToAuditEvent);
}
