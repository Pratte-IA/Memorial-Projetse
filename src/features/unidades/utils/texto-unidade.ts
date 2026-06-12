import type { Empreendimento } from "@/lib/mock-data";

import { fmtNum } from "@/lib/format";

/** Campos mínimos para preview textual e agrupamento (mock ou banco). */
export interface UnidadeTextoInput {
  nome: string;
  torre: string;
  pavimento: string;
  tipo: string;
  areaPrivativa: number;
  areaComum: number;
  areaTotal: number;
  vaga: string;
  fracao: string;
  confrontacoes: string;
}

export function numeroExtenso(n: number): string {
  const map: Record<number, string> = {
    1: "um",
    2: "dois",
    3: "três",
    4: "quatro",
    5: "cinco",
    6: "seis",
    7: "sete",
    8: "oito",
    9: "nove",
    10: "dez",
  };
  return map[n] ?? String(n);
}

export function numeroExtensoLongo(n: number): string {
  if (n === 0) return "zero";
  if (n === 100) return "cem";
  const u = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais: Record<number, string> = {
    10: "dez",
    11: "onze",
    12: "doze",
    13: "treze",
    14: "catorze",
    15: "quinze",
    16: "dezesseis",
    17: "dezessete",
    18: "dezoito",
    19: "dezenove",
  };
  const dez = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const cen = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (n < 10) return u[n];
  if (especiais[n]) return especiais[n];
  if (n < 100) {
    const d = Math.floor(n / 10),
      r = n % 10;
    return r === 0 ? dez[d] : `${dez[d]} e ${u[r]}`;
  }
  const c = Math.floor(n / 100),
    rest = n % 100;
  if (rest === 0) return cen[c];
  return `${cen[c]} e ${numeroExtensoLongo(rest)}`;
}

export function gerarDescricaoUnidade(
  u: UnidadeTextoInput,
  emp: Pick<Empreendimento, "nome">,
): string {
  const numMatch = u.nome.match(/(\d+)$/);
  const numero = numMatch ? parseInt(numMatch[1], 10) : 0;
  const numeroExt = numeroExtensoLongo(numero);
  const localPav = u.pavimento === "Térreo" ? "Pavimento térreo" : u.pavimento;
  const enderecoBase =
    "situar-se-á na Rua Ilhas Canárias, no 359, Bairro Interlagos, nesta Cidade e Comarca de CASCAVEL, Estado do PARANÁ";
  const areas = `terá a área construída total de ${fmtNum(u.areaTotal, 3)} m², sendo ${fmtNum(u.areaPrivativa, 2)} m² de área privativa e ${fmtNum(u.areaComum, 3)} m² de área de uso comum`;
  const terreno =
    u.tipo === "Garden"
      ? `, com área de terreno exclusiva correspondente a área de garden e de garagem`
      : `, com área de terreno exclusiva correspondente à área de garagem`;
  const fracao = `, correspondendo-lhe a fração territorial de ${u.fracao}`;
  const confront = `Confrontar-se-á conforme: ${u.confrontacoes}`;
  const vaga = `; terá ainda, o direito de uso privativo e exclusivo de 01 vaga descoberta (${u.vaga}), localizada no pavimento térreo do Condomínio`;
  return `${u.nome.toUpperCase()} (${numeroExt}), localizar-se-á no ${localPav} da ${u.torre} do ${emp.nome}, ${enderecoBase}, ${areas}${terreno}${fracao}. ${confront}${vaga}; tudo conforme alocado no referido projeto arquitetônico.`;
}

export const ORDEM_PAVIMENTOS = [
  "Térreo",
  "1º Pavimento",
  "2º Pavimento",
  "3º Pavimento",
  "4º Pavimento",
];
export const NOME_PAVIMENTO_DOC: Record<string, string> = {
  Térreo: "PAVIMENTO TÉRREO",
  "1º Pavimento": "PRIMEIRO PAVIMENTO",
  "2º Pavimento": "SEGUNDO PAVIMENTO",
  "3º Pavimento": "TERCEIRO PAVIMENTO",
  "4º Pavimento": "QUARTO PAVIMENTO",
};

export function agruparUnidadesPorTorrePavimento<T extends UnidadeTextoInput>(unidades: T[]) {
  const grupos: Record<string, Record<string, T[]>> = {};
  for (const u of unidades) {
    grupos[u.torre] ??= {};
    grupos[u.torre][u.pavimento] ??= [];
    grupos[u.torre][u.pavimento].push(u);
  }
  return grupos;
}
