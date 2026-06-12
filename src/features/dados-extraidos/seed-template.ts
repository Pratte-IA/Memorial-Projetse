import { fmtNum } from "@/lib/format";
import type { Empreendimento } from "@/lib/mock-data";

import type { DadoExtraidoStatus } from "./types";

export interface SeedFieldTemplate {
  bloco: string;
  campo: string;
  label: string;
  valor: string;
  confianca: number;
  status: DadoExtraidoStatus;
}

export const CAMPO_LABELS: Record<string, string> = {
  nome: "Nome",
  endereco: "Endereço",
  cidade_uf: "Cidade/UF",
  matricula: "Matrícula",
  razao_social: "Razão social",
  cnpj: "CNPJ",
  area_terreno: "Área do terreno",
  area_global: "Área global",
  area_privativa_total: "Área privativa total",
  area_comum_total: "Área comum total",
  alvara: "Alvará",
  data_aprovacao: "Data de aprovação",
  responsavel_tecnico: "Responsável técnico",
  crea: "CREA",
};

export function buildSeedFieldsFromEmpreendimento(emp: Empreendimento): SeedFieldTemplate[] {
  const areaPrivativa = fmtNum(emp.areaTerreno * 0.65, 2);
  const areaComum = fmtNum(emp.areaTerreno * 0.35, 2);

  return [
    {
      bloco: "empreendimento",
      campo: "nome",
      label: "Nome",
      valor: emp.nome,
      confianca: 96,
      status: "confirmado",
    },
    {
      bloco: "empreendimento",
      campo: "endereco",
      label: "Endereço",
      valor: emp.endereco,
      confianca: 94,
      status: "confirmado",
    },
    {
      bloco: "empreendimento",
      campo: "cidade_uf",
      label: "Cidade/UF",
      valor: `${emp.cidade}/${emp.uf}`,
      confianca: 95,
      status: "confirmado",
    },
    {
      bloco: "empreendimento",
      campo: "matricula",
      label: "Matrícula",
      valor: emp.matricula,
      confianca: 88,
      status: "extraido",
    },
    {
      bloco: "incorporadora",
      campo: "razao_social",
      label: "Razão social",
      valor: emp.incorporadora,
      confianca: 97,
      status: "confirmado",
    },
    {
      bloco: "incorporadora",
      campo: "cnpj",
      label: "CNPJ",
      valor: emp.cnpj,
      confianca: 86,
      status: "extraido",
    },
    {
      bloco: "areas",
      campo: "area_terreno",
      label: "Área do terreno",
      valor: `${fmtNum(emp.areaTerreno, 2)} m²`,
      confianca: 93,
      status: "confirmado",
    },
    {
      bloco: "areas",
      campo: "area_global",
      label: "Área global",
      valor: `${fmtNum(emp.areaGlobal, 2)} m²`,
      confianca: 91,
      status: "confirmado",
    },
    {
      bloco: "areas",
      campo: "area_privativa_total",
      label: "Área privativa total",
      valor: `${areaPrivativa} m²`,
      confianca: 62,
      status: "baixa_confianca",
    },
    {
      bloco: "areas",
      campo: "area_comum_total",
      label: "Área comum total",
      valor: `${areaComum} m²`,
      confianca: 84,
      status: "extraido",
    },
    {
      bloco: "aprovacao",
      campo: "alvara",
      label: "Alvará",
      valor: emp.alvara,
      confianca: 71,
      status: "baixa_confianca",
    },
    {
      bloco: "aprovacao",
      campo: "data_aprovacao",
      label: "Data de aprovação",
      valor: emp.dataAprovacao,
      confianca: 85,
      status: "extraido",
    },
    {
      bloco: "aprovacao",
      campo: "responsavel_tecnico",
      label: "Responsável técnico",
      valor: emp.responsavel,
      confianca: 96,
      status: "confirmado",
    },
    {
      bloco: "aprovacao",
      campo: "crea",
      label: "CREA",
      valor: emp.crea,
      confianca: 94,
      status: "confirmado",
    },
  ];
}
