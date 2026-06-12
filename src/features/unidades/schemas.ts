import { z } from "zod";

export const updateUnidadeSchema = z.object({
  nome: z.string().trim().min(1, "Nome da unidade é obrigatório."),
  torre: z.string().trim().min(1, "Torre é obrigatória."),
  pavimento: z.string().trim().min(1, "Pavimento é obrigatório."),
  tipo: z.string().trim().min(1, "Tipo é obrigatório."),
  vaga: z.string().trim().min(1, "Vaga é obrigatória."),
  fracao: z.string().trim().min(1, "Fração territorial é obrigatória."),
  confrontacoes: z.string().trim().min(10, "Descreva as confrontações."),
  areaPrivativa: z.number().positive("Área privativa deve ser maior que zero."),
  areaComum: z.number().nonnegative("Área comum inválida."),
  areaTotal: z.number().positive("Área total deve ser maior que zero."),
  areaGarden: z.number().nonnegative("Área garden inválida."),
});

export type UpdateUnidadeFormValues = z.infer<typeof updateUnidadeSchema>;

export function parseAreaInput(value: string): number | null {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}
