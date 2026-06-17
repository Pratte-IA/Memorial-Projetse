import type { OrgRole } from "@/features/auth/types";

export type MemberStatus = "active" | "invited" | "disabled";

export interface ExportPrefs {
  incluirLogo: boolean;
  numerarPaginas: boolean;
  marcaDaguaRevisao: boolean;
  anexarQuadros: boolean;
}

export interface OrganizationSettings {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  responsavelTecnico: string;
  exportPrefs: ExportPrefs;
}

export interface OrgMemberRecord {
  id: number;
  profileId: number;
  userId: string;
  fullName: string;
  email: string;
  role: OrgRole;
  status: MemberStatus;
}

export interface UpdateMemberRoleInput {
  memberId: number;
  organizationId: number;
  role: OrgRole;
}

export interface UpdateMemberStatusInput {
  memberId: number;
  organizationId: number;
  status: MemberStatus;
}

export interface CreateUserInput {
  organizationId: number;
  fullName: string;
  email: string;
  password: string;
  role: OrgRole;
}

export interface UpdateUserProfileInput {
  organizationId: number;
  userId: string;
  fullName: string;
  email: string;
  role: OrgRole;
  memberId: number;
}

export interface UpdateUserPasswordInput {
  organizationId: number;
  userId: string;
  password: string;
}

export interface UserActionInput {
  organizationId: number;
  userId: string;
}

export interface SaveSettingsInput {
  organizationId: number;
  settings: OrganizationSettings;
}
