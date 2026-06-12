import { z } from "zod";

const cnpjSchema = z
  .string()
  .trim()
  .min(11, "CNPJ deve ter ao menos 11 caracteres.")
  .max(20, "CNPJ inválido.");

const matriculaSchema = z.string().trim().min(1, "Matrícula é obrigatória.");

const areaSchema = z
  .string()
  .trim()
  .min(1, "Informe a área.")
  .refine((v) => /\d/.test(v.replace(/\./g, "").replace(",", ".")), "Área inválida.");

const textoObrigatorio = z.string().trim().min(1, "Campo obrigatório.");

const dataSchema = z
  .string()
  .trim()
  .min(8, "Data inválida.")
  .refine((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v), "Use o formato DD/MM/AAAA.");

const CAMPO_SCHEMAS: Record<string, z.ZodType<string>> = {
  cnpj: cnpjSchema,
  matricula: matriculaSchema,
  area_terreno: areaSchema,
  area_global: areaSchema,
  area_privativa_total: areaSchema,
  area_comum_total: areaSchema,
  nome: textoObrigatorio,
  endereco: textoObrigatorio,
  cidade_uf: textoObrigatorio,
  razao_social: textoObrigatorio,
  alvara: textoObrigatorio,
  data_aprovacao: dataSchema,
  responsavel_tecnico: textoObrigatorio,
  crea: textoObrigatorio,
};

export function validateCampoValor(campo: string, valor: string): string | null {
  const schema = CAMPO_SCHEMAS[campo];
  if (!schema) return null;

  const result = schema.safeParse(valor);
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Valor inválido.";
  }
  return null;
}

export function isCampoCritico(campo: string): boolean {
  return campo in CAMPO_SCHEMAS;
}
