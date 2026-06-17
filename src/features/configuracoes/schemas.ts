import { z } from "zod";

const orgRoleSchema = z.enum(["admin", "gestora", "responsavel_tecnica", "revisora"]);

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: orgRoleSchema,
});

export const editUserSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  role: orgRoleSchema,
});

export const userPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type EditUserForm = z.infer<typeof editUserSchema>;
export type UserPasswordForm = z.infer<typeof userPasswordSchema>;

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
