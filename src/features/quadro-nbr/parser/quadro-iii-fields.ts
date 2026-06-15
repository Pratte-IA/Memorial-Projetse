import type { CampoExtraido } from "../types";
import {
  cellNum,
  cellStr,
  findLabelValue,
  findRowValueByItemNumber,
  findSameRowValue,
  isCurrencyUnitLabel,
  normalizeNumericDisplayPtBr,
  type CellMatrix,
} from "./sheet-utils";

export interface QuadroIIIFieldDef {
  chave: string;
  rotulo: string;
  grupo: string;
  /** Numeração NBR na planilha (ex.: "5.1.1"). */
  itemNumber?: string;
  /** Busca textual quando a numeração não está na célula. */
  labelBusca?: string;
}

export const QUADRO_III_SECOES_ORDEM = [
  "Classificação e projeto-padrão",
  "CUB — Custo Unitário Básico",
  "Áreas globais (item 4)",
  "Custo básico global (item 5)",
  "Parcelas adicionais (item 6)",
  "Subtotais, impostos e projetos (itens 7–10)",
  "Remunerações e custo global (itens 11–14)",
] as const;

export type QuadroIIIGrupo = (typeof QUADRO_III_SECOES_ORDEM)[number];

export const QUADRO_III_BLOCOS: Array<{
  titulo: string;
  grupos: QuadroIIIGrupo[];
}> = [
  {
    titulo: "Referência e classificação",
    grupos: ["Classificação e projeto-padrão", "CUB — Custo Unitário Básico"],
  },
  {
    titulo: "Áreas e custo base",
    grupos: ["Áreas globais (item 4)", "Custo básico global (item 5)"],
  },
  {
    titulo: "Parcelas adicionais",
    grupos: ["Parcelas adicionais (item 6)"],
  },
  {
    titulo: "Totalização da obra",
    grupos: [
      "Subtotais, impostos e projetos (itens 7–10)",
      "Remunerações e custo global (itens 11–14)",
    ],
  },
];

export const QUADRO_III_FIELD_DEFS: QuadroIIIFieldDef[] = [
  // Classificação / projeto-padrão
  {
    chave: "classificacao_geral",
    rotulo: "Classificação geral",
    grupo: "Classificação e projeto-padrão",
    labelBusca: "classificação geral",
  },
  {
    chave: "designacao_padrao",
    rotulo: "Designação do projeto-padrão",
    grupo: "Classificação e projeto-padrão",
  },
  {
    chave: "padrao_acabamento",
    rotulo: "Padrão de acabamento",
    grupo: "Classificação e projeto-padrão",
  },
  {
    chave: "numero_pavimentos",
    rotulo: "Número de pavimentos",
    grupo: "Classificação e projeto-padrão",
  },
  {
    chave: "area_equivalente_padrao",
    rotulo: "Área equivalente do projeto-padrão",
    grupo: "Classificação e projeto-padrão",
  },

  // CUB
  {
    chave: "sindicato_cub",
    rotulo: "Sindicato que forneceu o CUB",
    grupo: "CUB — Custo Unitário Básico",
    labelBusca: "sindicato que forneceu",
  },
  {
    chave: "cub_mes",
    rotulo: "CUB — mês de referência",
    grupo: "CUB — Custo Unitário Básico",
    labelBusca: "custo unitário básico para o mês",
  },
  {
    chave: "cub_valor",
    rotulo: "CUB — valor (R$/m²)",
    grupo: "CUB — Custo Unitário Básico",
  },

  // Item 4 — áreas
  {
    chave: "area_real_privativa_global",
    rotulo: "4.1 — Área real privativa global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.1",
  },
  {
    chave: "area_real_uso_comum_global",
    rotulo: "4.2 — Área real de uso comum global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.2",
    labelBusca: "área real de uso comum",
  },
  {
    chave: "area_real_global",
    rotulo: "4.3 — Área real global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.3",
  },
  {
    chave: "area_equiv_privativa_global",
    rotulo: "4.4 — Área equivalente privativa global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.4",
  },
  {
    chave: "area_equiv_uso_comum_global",
    rotulo: "4.5 — Área equivalente de uso comum global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.5",
    labelBusca: "área equivalente de uso comum",
  },
  {
    chave: "area_equiv_global",
    rotulo: "4.6 — Área equivalente global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.6",
  },

  // Item 5 — custo básico
  {
    chave: "custo_basico_global",
    rotulo: "5 — Custo básico global da edificação",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5",
    labelBusca: "custo básico global da edificação",
  },
  {
    chave: "custo_materiais_5_1_1",
    rotulo: "5.1.1 — Custo básico de materiais e outros",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5.1.1",
  },
  {
    chave: "custo_mao_obra_5_1_2",
    rotulo: "5.1.2 — Custo básico de mão-de-obra",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5.1.2",
  },

  // Item 6 — parcelas adicionais
  {
    chave: "parcela_fundacoes_6_1",
    rotulo: "6.1 — Fundações",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.1",
  },
  {
    chave: "parcela_elevadores_6_2",
    rotulo: "6.2 — Elevador(es)",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.2",
  },
  {
    chave: "parcela_fogoes_6_3_1",
    rotulo: "6.3.1 — Fogões",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.1",
  },
  {
    chave: "parcela_aquecedores_6_3_2",
    rotulo: "6.3.2 — Aquecedores",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.2",
  },
  {
    chave: "parcela_bombas_6_3_3",
    rotulo: "6.3.3 — Bombas de recalque",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.3",
  },
  {
    chave: "parcela_incineracao_6_3_4",
    rotulo: "6.3.4 — Incineração",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.4",
  },
  {
    chave: "parcela_ar_condicionado_6_3_5",
    rotulo: "6.3.5 — Ar condicionado",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.5",
  },
  {
    chave: "parcela_calefacao_6_3_6",
    rotulo: "6.3.6 — Calefação",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.6",
  },
  {
    chave: "parcela_ventilacao_6_3_7",
    rotulo: "6.3.7 — Ventilação e exaustão",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.7",
  },
  {
    chave: "parcela_equip_outros_6_3_8",
    rotulo: "6.3.8 — Equipamentos — outros",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.8",
  },
  {
    chave: "parcela_playground_6_4",
    rotulo: "6.4 — Playground",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.4",
  },
  {
    chave: "parcela_urbanizacao_6_5_1",
    rotulo: "6.5.1 — Urbanização",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.1",
  },
  {
    chave: "parcela_recreacao_6_5_2",
    rotulo: "6.5.2 — Recreação (piscinas, campos)",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.2",
  },
  {
    chave: "parcela_ajardinamento_6_5_3",
    rotulo: "6.5.3 — Ajardinamento",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.3",
  },
  {
    chave: "parcela_instalacao_cond_6_5_4",
    rotulo: "6.5.4 — Instalação e regulamentação do condomínio",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.4",
  },
  {
    chave: "parcela_obras_outros_6_5_5",
    rotulo: "6.5.5 — Obras complementares — outros",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.5",
  },
  {
    chave: "parcela_outros_servicos_6_6",
    rotulo: "6.6 — Outros serviços",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.6",
  },

  // Itens 7–10
  {
    chave: "subtotal_1_7",
    rotulo: "7 — 1º subtotal",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "7",
  },
  {
    chave: "impostos_taxas_8",
    rotulo: "8 — Impostos, taxas e emolumentos cartoriais",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "8",
  },
  {
    chave: "projeto_arquitetonico_9_1",
    rotulo: "9.1 — Projetos arquitetônicos",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.1",
  },
  {
    chave: "projeto_estrutural_9_2",
    rotulo: "9.2 — Projeto estrutural",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.2",
  },
  {
    chave: "projeto_instalacoes_9_3",
    rotulo: "9.3 — Projeto de instalações",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.3",
  },
  {
    chave: "projetos_especiais_9_4",
    rotulo: "9.4 — Projetos especiais",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.4",
  },
  {
    chave: "subtotal_2_10",
    rotulo: "10 — 2º subtotal",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "10",
  },

  // Itens 11–14
  {
    chave: "remuneracao_construtor_11",
    rotulo: "11 — Remuneração do construtor",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "11",
  },
  {
    chave: "remuneracao_incorporador_12",
    rotulo: "12 — Remuneração do incorporador",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "12",
  },
  {
    chave: "custo_global_construcao_13",
    rotulo: "13 — Custo global da construção",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "13",
  },
  {
    chave: "custo_unitario_obra_14",
    rotulo: "14 — Custo unitário da obra (R$/m²)",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "14",
  },
];

function campoTemValor(valor: string): boolean {
  const text = valor.trim();
  if (!text) return false;
  if (cellNum(text) === 0) return false;
  return true;
}

function resolveFieldValue(
  matrix: CellMatrix,
  def: QuadroIIIFieldDef,
): { valor: string; row: number; col: number } | null {
  if (def.itemNumber) {
    const byNumber = findRowValueByItemNumber(matrix, def.itemNumber);
    if (byNumber) return byNumber;

    const byLabelItem = findLabelValue(matrix, def.itemNumber);
    if (byLabelItem) return byLabelItem;
  }

  if (def.labelBusca) {
    const byText = findLabelValue(matrix, def.labelBusca);
    if (byText) return byText;
  }

  return null;
}

function pushCampo(
  campos: CampoExtraido[],
  sheetName: string,
  def: Pick<QuadroIIIFieldDef, "chave" | "rotulo" | "grupo">,
  hit: { valor: string; row: number; col: number },
): void {
  if (!campoTemValor(hit.valor)) return;

  campos.push({
    chave: def.chave,
    rotulo: def.rotulo,
    valor: normalizeNumericDisplayPtBr(hit.valor),
    grupo: def.grupo,
    fonte: { sheet: sheetName, row: hit.row, col: hit.col },
  });
}

/** Linha de dados do projeto-padrão (designação, acabamento, pavimentos, área). */
function parseProjetoPadraoCampos(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const campos: CampoExtraido[] = [];

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];

    for (let c = 0; c < row.length; c++) {
      if (!/classificação\s+geral/i.test(cellStr(row[c]))) continue;
      const hit = findSameRowValue(row, c, 5);
      if (hit) {
        pushCampo(
          campos,
          sheetName,
          {
            chave: "classificacao_geral",
            rotulo: "Classificação geral",
            grupo: "Classificação e projeto-padrão",
          },
          { valor: hit.valor, row: r, col: hit.col },
        );
      }
      break;
    }

    const pavCell = cellStr(row[3]);
    if (!/^\d+\s*pavimentos?/i.test(pavCell)) continue;

    const projetoDefs: Array<{ chave: string; rotulo: string; col: number }> = [
      { chave: "designacao_padrao", rotulo: "Designação do projeto-padrão", col: 1 },
      { chave: "padrao_acabamento", rotulo: "Padrão de acabamento", col: 2 },
      { chave: "numero_pavimentos", rotulo: "Número de pavimentos", col: 3 },
      { chave: "area_equivalente_padrao", rotulo: "Área equivalente do projeto-padrão", col: 4 },
    ];

    for (const pd of projetoDefs) {
      const valor = cellStr(row[pd.col]);
      if (!campoTemValor(valor)) continue;
      pushCampo(campos, sheetName, {
        chave: pd.chave,
        rotulo: pd.rotulo,
        grupo: "Classificação e projeto-padrão",
      }, { valor, row: r, col: pd.col });
    }
  }

  return campos;
}

/** Tabela de dependências privativas (quartos, salas, banheiros, empregados). */
function parseDependenciasPrivativas(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const campos: CampoExtraido[] = [];
  let inSection = false;
  let configIdx = 0;

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const rowText = row.map((cell) => cellStr(cell)).join(" ");

    if (/dependências de uso privativo/i.test(rowText)) {
      inSection = true;
      continue;
    }

    if (inSection && /sindicato que forneceu|custo unitário básico/i.test(rowText)) break;
    if (!inSection) continue;

    const quartos = cellStr(row[5]);
    const salas = cellStr(row[6]);
    const banheiros = cellStr(row[7]);
    const empregados = cellStr(row[9]);

    if (!quartos || !salas || !banheiros) continue;
    if (/^quartos$/i.test(quartos)) continue;

    const quartosNum = cellNum(quartos);
    if (quartosNum === null && !/não há/i.test(quartos)) continue;

    configIdx += 1;
    campos.push({
      chave: `dependencia_config_${configIdx}`,
      rotulo: `Dependências privativas — configuração ${configIdx}`,
      valor: [quartos, salas, banheiros, empregados || "—"].join(" | "),
      grupo: "Classificação e projeto-padrão",
      fonte: { sheet: sheetName, row: r, col: 5 },
    });
  }

  return campos;
}

const PROJETO_PADRAO_CHAVES = new Set([
  "classificacao_geral",
  "designacao_padrao",
  "padrao_acabamento",
  "numero_pavimentos",
  "area_equivalente_padrao",
]);

/** Linha 3 — CUB (R$/m²): valor numérico após "R$ por m2", não o rótulo. */
function parseCubValorCampo(matrix: CellMatrix, sheetName: string): CampoExtraido | null {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const rowText = row.map((cell) => cellStr(cell)).join(" ");
    if (!/custo unitário básico/i.test(rowText)) continue;

    for (let k = row.length - 1; k >= 0; k--) {
      const valor = cellStr(row[k]);
      if (!valor || isPercentOnlyCell(valor)) continue;
      if (isCurrencyUnitLabel(valor)) continue;
      if (cellNum(valor) === null) continue;

      return {
        chave: "cub_valor",
        rotulo: "CUB — valor (R$/m²)",
        valor: normalizeNumericDisplayPtBr(valor),
        grupo: "CUB — Custo Unitário Básico",
        fonte: { sheet: sheetName, row: r, col: k },
      };
    }
  }

  return null;
}

function isPercentOnlyCell(value: string): boolean {
  const cleaned = value.replace(/\s/g, "");
  return /^\d+([.,]\d+)?%$/.test(cleaned);
}

export function parseQuadroIIICampos(matrix: CellMatrix, sheetName = "QUADRO III"): CampoExtraido[] {
  const campos = [
    ...parseProjetoPadraoCampos(matrix, sheetName),
    ...parseDependenciasPrivativas(matrix, sheetName),
  ];

  const cubValor = parseCubValorCampo(matrix, sheetName);
  if (cubValor) campos.push(cubValor);

  for (const def of QUADRO_III_FIELD_DEFS) {
    if (PROJETO_PADRAO_CHAVES.has(def.chave)) continue;
    if (def.chave === "cub_valor") continue;

    const hit = resolveFieldValue(matrix, def);
    if (!hit) continue;

    pushCampo(campos, sheetName, def, hit);
  }

  return campos;
}
