import type { OrgRole } from "@/features/auth/types";

import type { ExportPrefs, OrganizationSettings, OrgMemberRecord } from "./types";

type SettingsJson = {
  razao_social?: string;
  cnpj?: string;
  endereco?: string;
  responsavel_tecnico?: string;
  export_prefs?: {
    incluir_logo?: boolean;
    numerar_paginas?: boolean;
    marca_dagua_revisao?: boolean;
    anexar_quadros?: boolean;
  };
};

const DEFAULT_EXPORT_PREFS: ExportPrefs = {
  incluirLogo: true,
  numerarPaginas: true,
  marcaDaguaRevisao: false,
  anexarQuadros: true,
};

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  razaoSocial: "Projetse Engenharia e Arquitetura LTDA",
  cnpj: "12.345.678/0001-90",
  endereco: "Rua das Palmeiras, 1.020 — Cascavel/PR",
  responsavelTecnico: "Francieli Luize Wagner Lima",
  exportPrefs: DEFAULT_EXPORT_PREFS,
};

export function parseSettingsJson(raw: unknown): OrganizationSettings {
  const data = (raw ?? {}) as SettingsJson;
  const prefs = data.export_prefs ?? {};

  return {
    razaoSocial: data.razao_social ?? DEFAULT_ORGANIZATION_SETTINGS.razaoSocial,
    cnpj: data.cnpj ?? DEFAULT_ORGANIZATION_SETTINGS.cnpj,
    endereco: data.endereco ?? DEFAULT_ORGANIZATION_SETTINGS.endereco,
    responsavelTecnico:
      data.responsavel_tecnico ?? DEFAULT_ORGANIZATION_SETTINGS.responsavelTecnico,
    exportPrefs: {
      incluirLogo: prefs.incluir_logo ?? DEFAULT_EXPORT_PREFS.incluirLogo,
      numerarPaginas: prefs.numerar_paginas ?? DEFAULT_EXPORT_PREFS.numerarPaginas,
      marcaDaguaRevisao: prefs.marca_dagua_revisao ?? DEFAULT_EXPORT_PREFS.marcaDaguaRevisao,
      anexarQuadros: prefs.anexar_quadros ?? DEFAULT_EXPORT_PREFS.anexarQuadros,
    },
  };
}

export function settingsToJson(settings: OrganizationSettings): SettingsJson {
  return {
    razao_social: settings.razaoSocial,
    cnpj: settings.cnpj,
    endereco: settings.endereco,
    responsavel_tecnico: settings.responsavelTecnico,
    export_prefs: {
      incluir_logo: settings.exportPrefs.incluirLogo,
      numerar_paginas: settings.exportPrefs.numerarPaginas,
      marca_dagua_revisao: settings.exportPrefs.marcaDaguaRevisao,
      anexar_quadros: settings.exportPrefs.anexarQuadros,
    },
  };
}

type MemberRow = {
  id: number;
  role: string;
  status: string;
  profile_id: number;
  profiles: { full_name: string; email: string } | null;
};

export function mapRowToMember(row: MemberRow): OrgMemberRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    fullName: row.profiles?.full_name ?? "—",
    email: row.profiles?.email ?? "—",
    role: row.role as OrgRole,
    status: row.status,
  };
}
