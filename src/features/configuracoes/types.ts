import type { OrgRole } from "@/features/auth/types";

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
  fullName: string;
  email: string;
  role: OrgRole;
  status: string;
}

export interface UpdateMemberRoleInput {
  memberId: number;
  organizationId: number;
  role: OrgRole;
}

export interface SaveSettingsInput {
  organizationId: number;
  settings: OrganizationSettings;
}
