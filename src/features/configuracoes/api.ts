import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { mapRowToMember, parseSettingsJson, settingsToJson } from "./mappers";
import { organizationSettingsSchema } from "./schemas";
import type {
  CreateUserInput,
  OrganizationSettings,
  OrgMemberRecord,
  SaveSettingsInput,
  UpdateMemberRoleInput,
  UpdateMemberStatusInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
  UserActionInput,
} from "./types";

type GerenciarUsuarioAction =
  | "create"
  | "update_profile"
  | "update_password"
  | "deactivate"
  | "activate"
  | "delete";

async function invokeGerenciarUsuario(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("gerenciar-usuario", { body });

  if (error) {
    throw new Error(error.message || "Não foi possível concluir a operação.");
  }

  const payload = data as { error?: string; ok?: boolean } | null;
  if (payload?.error) {
    throw new Error(payload.error);
  }

  return payload;
}

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
      profiles ( full_name, email, user_id )
    `,
    )
    .eq("organization_id", organizationId)
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

export async function updateMemberStatus(input: UpdateMemberStatusInput): Promise<void> {
  const { data: member, error: fetchError } = await supabase
    .from("organization_members")
    .select("id, status, profiles ( full_name )")
    .eq("id", input.memberId)
    .eq("organization_id", input.organizationId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("organization_members")
    .update({ status: input.status })
    .eq("id", input.memberId);

  if (error) throw error;

  const nome = (member.profiles as { full_name: string } | null)?.full_name ?? "Membro";
  const acao = input.status === "active" ? "reativado" : "inativado";

  await logAudit(
    input.organizationId,
    "configuracao",
    `Usuário "${nome}" ${acao}.`,
    { member_id: input.memberId, status: input.status },
  );
}

export async function createOrganizationUser(input: CreateUserInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "create" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    role: input.role,
  });

  await logAudit(
    input.organizationId,
    "configuracao",
    `Usuário "${input.fullName}" criado com papel ${input.role}.`,
    { email: input.email, role: input.role },
  );
}

export async function updateOrganizationUserProfile(input: UpdateUserProfileInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "update_profile" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    userId: input.userId,
    fullName: input.fullName,
    email: input.email,
  });

  await updateMemberRole({
    memberId: input.memberId,
    organizationId: input.organizationId,
    role: input.role,
  });
}

export async function updateOrganizationUserPassword(input: UpdateUserPasswordInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "update_password" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    userId: input.userId,
    password: input.password,
  });

  await logAudit(input.organizationId, "configuracao", "Senha de usuário atualizada.", {
    user_id: input.userId,
  });
}

export async function deactivateOrganizationUser(input: UserActionInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "deactivate" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    userId: input.userId,
  });

  await logAudit(input.organizationId, "configuracao", "Usuário desativado.", {
    user_id: input.userId,
  });
}

export async function activateOrganizationUser(input: UserActionInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "activate" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    userId: input.userId,
  });

  await logAudit(input.organizationId, "configuracao", "Usuário reativado.", {
    user_id: input.userId,
  });
}

export async function deleteOrganizationUser(input: UserActionInput): Promise<void> {
  await invokeGerenciarUsuario({
    action: "delete" satisfies GerenciarUsuarioAction,
    organizationId: input.organizationId,
    userId: input.userId,
  });

  await logAudit(input.organizationId, "configuracao", "Usuário excluído permanentemente.", {
    user_id: input.userId,
  });
}
