import { z } from "zod";

export const exportPrefsSchema = z.object({
  incluirLogo: z.boolean(),
  numerarPaginas: z.boolean(),
  marcaDaguaRevisao: z.boolean(),
  anexarQuadros: z.boolean(),
});

export const organizationSettingsSchema = z.object({
  razaoSocial: z.string().trim().min(1, "Razão social é obrigatória."),
  cnpj: z.string().trim().min(1, "CNPJ é obrigatório."),
  endereco: z.string().trim().min(1, "Endereço é obrigatório."),
  responsavelTecnico: z.string().trim().min(1, "Responsável técnico é obrigatório."),
  exportPrefs: exportPrefsSchema,
});

export type OrganizationSettingsForm = z.infer<typeof organizationSettingsSchema>;
