import type { CampoExtraido } from "../types";
import {
  cellStr,
  findLabelValue,
  findRowIndex,
  findSameRowValue,
  type CellMatrix,
} from "./sheet-utils";

export const QUADRO_V_SECOES_ORDEM = [
  "Informações gerais (itens a–c)",
  "Explicitação da numeração (item d)",
  "Pavimentos especiais (item e)",
  "Outras informações (itens f–g)",
] as const;

const GRUPO_GERAL = "Informações gerais (itens a–c)";
const GRUPO_EXPLICITACAO = "Explicitação da numeração (item d)";
const GRUPO_PAVIMENTOS = "Pavimentos especiais (item e)";
const GRUPO_OUTRAS = "Outras informações (itens f–g)";

function readQuadroVValue(row: CellMatrix[number], labelCol = 0): string | null {
  const preferred = findSameRowValue(row, labelCol, 4);
  if (preferred?.valor) return preferred.valor;

  for (const col of [4, 2, 3, 5, 1]) {
    const val = cellStr(row[col]);
    if (!val || val.endsWith(":")) continue;
    if (/^(nome|empreendimento|logradouro):/i.test(val)) continue;
    return val;
  }

  return null;
}

function pushCampo(
  campos: CampoExtraido[],
  sheetName: string,
  def: Pick<CampoExtraido, "chave" | "rotulo" | "grupo">,
  valor: string,
  row: number,
  col: number,
): void {
  const text = valor.trim();
  if (!text) return;

  campos.push({
    chave: def.chave,
    rotulo: def.rotulo,
    valor: text,
    grupo: def.grupo,
    fonte: { sheet: sheetName, row, col },
  });
}

function parseItensABC(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const campos: CampoExtraido[] = [];
  const items = [
    { chave: "tipo_edificacao", rotulo: "a) Tipo de edificação", busca: "a) tipo de edificação" },
    { chave: "numero_pavimentos", rotulo: "b) Número de pavimentos", busca: "b) numero de pavimentos" },
    {
      chave: "unidades_por_pavimento",
      rotulo: "c) Unidades autônomas por pavimento",
      busca: "c) número de unidades",
    },
  ] as const;

  for (const item of items) {
    const hit = findLabelValue(matrix, item.busca);
    pushCampo(
      campos,
      sheetName,
      { chave: item.chave, rotulo: item.rotulo, grupo: GRUPO_GERAL },
      hit?.valor ?? "",
      hit?.row ?? 0,
      hit?.col ?? 4,
    );
  }

  return campos;
}

/** Item d) — cada linha de explicitação (apartamentos, vagas, etc.). */
function parseExplicitacoes(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const startRow = findRowIndex(matrix, (row) => /d\)\s*explicitação/i.test(cellStr(row[0])));
  if (startRow < 0) return [];

  const campos: CampoExtraido[] = [];
  let idx = 0;

  const collectRow = (row: CellMatrix[number], r: number) => {
    const valor = readQuadroVValue(row, 0);
    if (!valor) return;

    idx += 1;
    campos.push({
      chave: `explicitacao_${idx}`,
      rotulo:
        idx === 1
          ? "d) Explicitação da numeração das unidades autônomas"
          : `d) Explicitação (${idx})`,
      valor,
      grupo: GRUPO_EXPLICITACAO,
      fonte: { sheet: sheetName, row: r, col: 4 },
    });
  };

  collectRow(matrix[startRow] ?? [], startRow);

  for (let r = startRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const col0 = cellStr(row[0]);

    if (/^e\)\s/i.test(col0) || /pavimentos especiais/i.test(col0)) break;
    if (/^[f-g]\)\s/i.test(col0)) break;

    if (col0 && /^[a-g]\)\s/i.test(col0)) break;

    collectRow(row, r);
  }

  return campos;
}

const PAVIMENTOS_ESPECIAIS = [
  { chave: "e_pilotis", rotulo: "Pilotis", pattern: /pilotis/i },
  { chave: "e_transicao", rotulo: "Pavimentos de transição", pattern: /transição/i },
  { chave: "e_garagens", rotulo: "Garagens", pattern: /garagens/i },
  { chave: "e_comunitarios", rotulo: "Pavimentos comunitários", pattern: /comunitários/i },
  { chave: "e_outros", rotulo: "Outros pavimentos", pattern: /outros pavimentos/i },
] as const;

function parsePavimentosEspeciais(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const campos: CampoExtraido[] = [];

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const col0 = cellStr(row[0]);
    if (!col0) continue;

    for (const def of PAVIMENTOS_ESPECIAIS) {
      if (!def.pattern.test(col0)) continue;

      const hit = findSameRowValue(row, 0, 4);
      pushCampo(
        campos,
        sheetName,
        { chave: def.chave, rotulo: `e) ${def.rotulo}`, grupo: GRUPO_PAVIMENTOS },
        hit?.valor ?? "",
        r,
        hit?.col ?? 4,
      );
      break;
    }
  }

  return campos;
}

function parseItensFG(matrix: CellMatrix, sheetName: string): CampoExtraido[] {
  const campos: CampoExtraido[] = [];

  const fHit = findLabelValue(matrix, "f) data da aprovação");
  pushCampo(
    campos,
    sheetName,
    {
      chave: "data_aprovacao",
      rotulo: "f) Data da aprovação do projeto e repartição competente",
      grupo: GRUPO_OUTRAS,
    },
    fHit?.valor ?? "",
    fHit?.row ?? 0,
    fHit?.col ?? 4,
  );

  const gHit = findLabelValue(matrix, "g) outras indicações");
  pushCampo(
    campos,
    sheetName,
    { chave: "outras_indicacoes", rotulo: "g) Outras indicações", grupo: GRUPO_OUTRAS },
    gHit?.valor ?? "",
    gHit?.row ?? 0,
    gHit?.col ?? 4,
  );

  return campos;
}

export function parseQuadroVCampos(matrix: CellMatrix, sheetName = "QUADRO V"): CampoExtraido[] {
  return [
    ...parseItensABC(matrix, sheetName),
    ...parseExplicitacoes(matrix, sheetName),
    ...parsePavimentosEspeciais(matrix, sheetName),
    ...parseItensFG(matrix, sheetName),
  ];
}
