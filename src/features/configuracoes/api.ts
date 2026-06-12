import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { mapRowToMember, parseSettingsJson, settingsToJson } from "./mappers";
import { organizationSettingsSchema } from "./schemas";
import type {
  OrganizationSettings,
  OrgMemberRecord,
  SaveSettingsInput,
  UpdateMemberRoleInput,
} from "./types";

async function logAudit(
  organizationId: number,
  eventType: string,
  description: string,
  metadata?: Json,
) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    // Tipos gerados exigem number; o banco aceita null para eventos globais da org.
    p_empreendimento_id: null as unknown as number,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null,
  });
  if (error) throw error;
}

export async function fetchOrganizationSettings(
  organizationId: number,
): Promise<OrganizationSettings> {
  const { data, error } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", organizationId)
    .single();

  if (error) throw error;
  return parseSettingsJson((data as { settings?: unknown }).settings);
}

export async function saveOrganizationSettings(input: SaveSettingsInput): Promise<void> {
  const parsed = organizationSettingsSchema.safeParse(input.settings);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Configurações inválidas.");
  }

  const { error } = await supabase
    .from("organizations")
    .update({ settings: settingsToJson(parsed.data) as unknown as Json })
    .eq("id", input.organizationId);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    "configuracao",
    "Configurações da organização atualizadas.",
    { campos: ["razao_social", "cnpj", "endereco", "responsavel_tecnico", "export_prefs"] },
  );
}

export async function fetchOrganizationMembers(organizationId: number): Promise<OrgMemberRecord[]> {
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      id, role, status, profile_id,
      profiles ( full_name, email )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("created_at");

  if (error) throw error;
  return (data as Parameters<typeof mapRowToMember>[0][]).map(mapRowToMember);
}

export async function updateMemberRole(input: UpdateMemberRoleInput): Promise<void> {
  const { data: member, error: fetchError } = await supabase
    .from("organization_members")
    .select("id, role, profiles ( full_name )")
    .eq("id", input.memberId)
    .eq("organization_id", input.organizationId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("organization_members")
    .update({ role: input.role })
    .eq("id", input.memberId);

  if (error) throw error;

  const nome = (member.profiles as { full_name: string } | null)?.full_name ?? "Membro";

  await logAudit(
    input.organizationId,
    "configuracao",
    `Papel de "${nome}" alterado para ${input.role}.`,
    { member_id: input.memberId, role: input.role },
  );
}
