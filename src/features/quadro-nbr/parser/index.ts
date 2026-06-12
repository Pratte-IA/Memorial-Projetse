import type {
  CampoExtraido,
  DocumentoNbrExtraido,
  LinhaAcabamento,
  LinhaEquipamento,
  LinhaPavimento,
  LinhaResumo,
  LinhaUnidadeArea,
  LinhaUnidadeReal,
  QuadroComplementar,
  QuadroExtraido,
  QuadroI,
  QuadroII,
  QuadroIII,
  QuadroIVA,
  QuadroIVB,
  QuadroId,
  QuadroPreliminares,
  QuadroResumo,
  QuadroV,
  QuadroVI,
  QuadroVII,
  QuadroVIII,
} from "../types";
import { SHEET_MATCHERS, SHEET_PRELIMINARES } from "../constants";
import { parseCabecalhoPadrao } from "./cabecalho";
import {
  cellNum,
  cellStr,
  normalizeNumericDisplayPtBr,
  extractFolhaInfo,
  findLabelValue,
  findRowIndex,
  findSheetName,
  isDataEndRow,
  isTorreOuBlocoRow,
  isUnidadeDesignacaoValida,
  readWorkbookFromArrayBuffer,
  sheetToMatrix,
  slicePreview,
  type CellMatrix,
} from "./sheet-utils";
import {
  parseLinhaPavimentoFromRow,
  parseLinhaResumoFromRow,
  parseResumoConfrontacaoLabels,
  parseLinhaUnidadeAreaFromRow,
  parseLinhaUnidadeRealFromRow,
  parseQivaLinhaFromRow,
} from "./row-numerics";
import { parseLinhaAcabamentoFromRow } from "./acabamentos-utils";
import { parseQuadroIIICampos } from "./quadro-iii-fields";
import { parseQuadroVCampos } from "./quadro-v-fields";

const PRELIMINARES_LABELS: Array<{ chave: string; rotulo: string; busca: string }> = [
  { chave: "incorporador_nome", rotulo: "1.1 Nome", busca: "1.1" },
  { chave: "incorporador_cnpj", rotulo: "1.3 CNPJ", busca: "cnpj:" },
  { chave: "incorporador_endereco", rotulo: "1.4 Endereço", busca: "1.4" },
  { chave: "rt_nome", rotulo: "2.1 Responsável Técnico", busca: "2.1" },
  { chave: "rt_crea", rotulo: "2.2 CREA", busca: "2.2" },
  { chave: "rt_art", rotulo: "2.3 ART", busca: "2.3" },
  { chave: "rt_endereco", rotulo: "2.4 Endereço RT", busca: "2.4" },
  { chave: "projeto_nome", rotulo: "3.1 Nome do Edifício", busca: "3.1" },
  { chave: "projeto_logradouro", rotulo: "3.2.1 Logradouro", busca: "3.2.1" },
  { chave: "projeto_lote_quadra", rotulo: "3.2.2 Lote/Quadra", busca: "3.2.2" },
  { chave: "projeto_cep", rotulo: "3.2.3 CEP", busca: "3.2.3" },
  { chave: "projeto_cidade_uf", rotulo: "3.3 Cidade/UF", busca: "3.3" },
  { chave: "projeto_padrao_nbr", rotulo: "3.4 Projeto-padrão NBR", busca: "3.4" },
  { chave: "projeto_qtd_unidades", rotulo: "3.5 Qtd. unidades", busca: "3.5" },
  { chave: "projeto_acabamento", rotulo: "3.6 Padrão acabamento", busca: "3.6" },
  { chave: "projeto_pavimentos", rotulo: "3.7 Pavimentos", busca: "3.7" },
  { chave: "projeto_vagas_ua", rotulo: "3.8.1 Vagas UA", busca: "3.8.1" },
  { chave: "projeto_vagas_38_2", rotulo: "3.8.2 Vagas", busca: "3.8.2" },
  { chave: "projeto_vagas_38_3", rotulo: "3.8.3 Vagas", busca: "3.8.3" },
  { chave: "projeto_vagas_38_4", rotulo: "3.8.4 Vagas", busca: "3.8.4" },
  { chave: "projeto_area_terreno", rotulo: "3.9 Área terreno", busca: "3.9" },
  { chave: "projeto_data_aprovacao", rotulo: "3.10 Data aprovação", busca: "3.10" },
  { chave: "projeto_alvara", rotulo: "3.11 Alvará", busca: "3.11" },
];

function parsePreliminares(matrix: CellMatrix): QuadroPreliminares {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const campos: CampoExtraido[] = [];

  for (const def of PRELIMINARES_LABELS) {
    const hit = findPreliminarValue(matrix, def.busca);
    campos.push({
      chave: def.chave,
      rotulo: def.rotulo,
      valor: hit?.valor ?? "",
      fonte: hit ? { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col } : undefined,
    });
  }

  const socios = findSocioAdministradores(matrix);
  socios.forEach((nome, i) => {
    campos.push({
      chave: `incorporador_socio_${i + 1}`,
      rotulo: `1.2 Sócio Administrador ${i + 1}`,
      valor: nome,
    });
  });

  for (const vaga of parseCamposSecao38(matrix)) {
    const idx = campos.findIndex((c) => c.chave === vaga.chave);
    if (idx >= 0) {
      if (!campos[idx].valor.trim()) campos[idx] = { ...campos[idx], valor: vaga.valor, fonte: vaga.fonte };
    } else {
      campos.push(vaga);
    }
  }

  return {
    id: "preliminares",
    titulo: "NBR 12.721 — Informações Preliminares",
    folha,
    totalFolhas,
    cabecalho: buildCabecalhoFromPreliminares(campos),
    fontePreview: slicePreview(matrix),
    campos,
  };
}

/** Extrai todos os subitens 3.8.x (vagas) das informações preliminares. */
function parseCamposSecao38(matrix: CellMatrix): CampoExtraido[] {
  const campos: CampoExtraido[] = [];
  const seenSubs = new Set<string>();

  for (let sub = 1; sub <= 9; sub++) {
    const token = `3.8.${sub}`;
    const hit = findLabelValue(matrix, token);
    if (!hit) continue;

    const numeric = hit.valor.replace(/[^\d]/g, "");
    if (!numeric || Number(numeric) <= 0) continue;

    seenSubs.add(String(sub));
    campos.push({
      chave: sub === 1 ? "projeto_vagas_ua" : `projeto_vagas_38_${sub}`,
      rotulo: token,
      valor: hit.valor,
      fonte: { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col },
    });
  }

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cellText = cellStr(row[c]);
      const match = cellText.match(/\b3\.8\.(\d+)/i);
      if (!match) continue;

      const sub = match[1];
      if (seenSubs.has(sub)) continue;

      const hit = findLabelValue(matrix, `3.8.${sub}`);
      if (!hit) continue;

      const numeric = hit.valor.replace(/[^\d]/g, "");
      if (!numeric || Number(numeric) <= 0) continue;

      seenSubs.add(sub);
      campos.push({
        chave: sub === "1" ? "projeto_vagas_ua" : `projeto_vagas_38_${sub}`,
        rotulo: cellText.trim() || `3.8.${sub}`,
        valor: hit.valor,
        fonte: { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col },
      });
    }
  }

  return campos;
}

function findPreliminarValue(
  matrix: CellMatrix,
  token: string,
): { valor: string; row: number; col: number } | null {
  const needle = token.toLowerCase();

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const text = cellStr(row[c]).toLowerCase();
      if (!text.includes(needle)) continue;

      for (let k = c + 1; k < row.length; k++) {
        const val = cellStr(row[k]);
        if (!val || val.endsWith(":")) continue;
        if (val.toLowerCase().includes(needle.replace(":", ""))) continue;
        return { valor: normalizeNumericDisplayPtBr(val), row: r, col: k };
      }
    }
  }

  return null;
}

function findSocioAdministradores(matrix: CellMatrix): string[] {
  const socios: string[] = [];

  for (const row of matrix) {
    for (let c = 0; c < (row?.length ?? 0); c++) {
      const text = cellStr(row[c]).toLowerCase();
      if (!text.includes("sócio administrador") && !text.includes("administrador:")) continue;

      for (let k = c + 1; k < (row?.length ?? 0); k++) {
        const nome = cellStr(row[k]);
        if (nome && !nome.toLowerCase().includes("sócio")) {
          socios.push(nome);
          break;
        }
      }
    }
  }

  return socios;
}

function buildCabecalhoFromPreliminares(campos: CampoExtraido[]) {
  const get = (chave: string) => campos.find((c) => c.chave === chave)?.valor ?? "";
  const socios = campos
    .filter((c) => c.chave.startsWith("incorporador_socio_"))
    .map((c) => c.valor)
    .filter(Boolean);

  return {
    empreendimento: get("projeto_nome"),
    logradouro: get("projeto_logradouro"),
    loteQuadra: get("projeto_lote_quadra"),
    municipioUf: get("projeto_cidade_uf"),
    incorporadorNome: get("incorporador_nome"),
    incorporadorSocios: socios,
    responsavelNome: get("rt_nome"),
    responsavelCrea: get("rt_crea"),
  };
}

function parseQuadroI(matrix: CellMatrix, sheetName: string): QuadroI {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toLowerCase() === "pavimento");
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "1" && cellStr(row[1]) === "2");

  const linhas: LinhaPavimento[] = [];
  let observacoes = "";

  if (headerRow >= 0 && colNumsRow >= 0) {
    for (let r = colNumsRow + 1; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const pavimento = cellStr(row[0]);
      if (!pavimento || isDataEndRow(pavimento)) {
        if (pavimento.toUpperCase().startsWith("OBSERVA")) {
          observacoes = cellStr(row[1]) || cellStr(row[4]) || "";
        }
        if (isDataEndRow(pavimento)) break;
        continue;
      }

      linhas.push(parseLinhaPavimentoFromRow(row, { pavimento }));
    }
  }

  const totaisRow = matrix.find((row) => cellStr(row[0]).toUpperCase() === "TOTAIS");
  const areaRealGlobal =
    findLabelValue(matrix, "área real global")?.valor !== undefined
      ? cellNum(findLabelValue(matrix, "área real global")?.valor)
      : cellNum(totaisRow?.[16]);
  const areaEquivalenteGlobal =
    findLabelValue(matrix, "área equivalente global")?.valor !== undefined
      ? cellNum(findLabelValue(matrix, "área equivalente global")?.valor)
      : cellNum(totaisRow?.[17]);

  return {
    id: "qi",
    titulo: "Quadro I — Cálculo das Áreas nos Pavimentos",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    totais: { areaRealGlobal, areaEquivalenteGlobal },
    observacoes,
  };
}

function parseUnidadesComBloco<T>(
  matrix: CellMatrix,
  colNumsRow: number,
  mapRow: (row: CellMatrix[number], bloco: string) => T | null,
): T[] {
  const linhas: T[] = [];
  let blocoAtual = "";

  for (let r = colNumsRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const designacao = cellStr(row[0]);
    if (!designacao) continue;
    if (isDataEndRow(designacao)) break;

    if (isTorreOuBlocoRow(designacao)) {
      blocoAtual = designacao;
      continue;
    }

    if (!isUnidadeDesignacaoValida(designacao)) continue;

    const parsed = mapRow(row, blocoAtual);
    if (parsed) linhas.push(parsed);
  }

  return linhas;
}

function parsePavimentosComTorre(
  matrix: CellMatrix,
  colNumsRow: number,
  sheetName: string,
): LinhaPavimento[] {
  const linhas: LinhaPavimento[] = [];
  let torreAtual = "";

  for (let r = colNumsRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const first = cellStr(row[0]);
    if (!first) continue;
    if (isDataEndRow(first)) break;

    if (isTorreOuBlocoRow(first)) {
      torreAtual = first;
      continue;
    }

    const isPavimento = /pavimento|térreo|terreo|subsolo|cobertura/i.test(first);
    if (!isPavimento && cellNum(row[1]) === null && cellNum(row[16]) === null) continue;

    linhas.push(
      parseLinhaPavimentoFromRow(row, { pavimento: first, torre: torreAtual || undefined }),
    );
  }

  return linhas;
}

function parseQuadroComplementar(matrix: CellMatrix, sheetName: string): QuadroComplementar {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "1" && cellStr(row[1]) === "2");
  const linhas = colNumsRow >= 0 ? parsePavimentosComTorre(matrix, colNumsRow, sheetName) : [];

  const totaisRow = matrix.find((row) => cellStr(row[0]).toUpperCase() === "TOTAIS");

  return {
    id: "qcomp",
    titulo: "Quadro Complementar — Áreas nos Pavimentos por Torre",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    totais: {
      areaRealGlobal: cellNum(totaisRow?.[16]) ?? findLabelValue(matrix, "área real global")?.valor
        ? cellNum(findLabelValue(matrix, "área real global")?.valor)
        : null,
      areaEquivalenteGlobal:
        cellNum(totaisRow?.[17]) ??
        (findLabelValue(matrix, "área equivalente global")?.valor
          ? cellNum(findLabelValue(matrix, "área equivalente global")?.valor)
          : null),
    },
    observacoes: "",
  };
}

function parseQuadroII(matrix: CellMatrix): QuadroII {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "19");

  const linhas =
    colNumsRow >= 0
      ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco): LinhaUnidadeArea | null => {
          const designacao = cellStr(row[0]);
          if (!designacao) return null;

          return parseLinhaUnidadeAreaFromRow(row, { designacao, bloco });
        })
      : [];

  return {
    id: "qii",
    titulo: "Quadro II — Cálculo das Áreas das Unidades Autônomas",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
  };
}

function parseQuadroIII(matrix: CellMatrix): QuadroIII {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const campos = parseQuadroIIICampos(matrix);

  return {
    id: "qiii",
    titulo: "Quadro III — Avaliação do Custo Global",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    campos,
  };
}

function parseQuadroIVA(matrix: CellMatrix): QuadroIVA {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "39");

  const linhas =
    colNumsRow >= 0
      ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco) => {
          const designacao = cellStr(row[0]);
          if (!designacao) return null;
          return parseQivaLinhaFromRow(row, { designacao, bloco });
        })
      : [];

  return {
    id: "qiva",
    titulo: "Quadro IV A — Custo por Unidade",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
  };
}

function parseQuadroIVB(matrix: CellMatrix): QuadroIVB {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "A");

  const linhas =
    colNumsRow >= 0
      ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco): LinhaUnidadeReal | null => {
          const designacao = cellStr(row[0]);
          if (!designacao) return null;

          return parseLinhaUnidadeRealFromRow(row, { designacao, bloco });
        })
      : [];

  return {
    id: "qivb",
    titulo: "Quadro IV B — Áreas Reais para Registro",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
  };
}

function parseQuadroV(matrix: CellMatrix): QuadroV {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);

  return {
    id: "qv",
    titulo: "Quadro V — Informações Gerais",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix, 32),
    campos: parseQuadroVCampos(matrix),
    textosDescritivos: [],
  };
}

function parseQuadroVI(matrix: CellMatrix): QuadroVI {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "EQUIPAMENTOS");
  const linhas: LinhaEquipamento[] = [];

  if (headerRow >= 0) {
    for (let r = headerRow + 1; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const equipamento = cellStr(row[0]);
      if (!equipamento) continue;
      linhas.push({
        equipamento,
        tipoMarca: cellStr(row[2]),
        acabamento: cellStr(row[4]),
      });
    }
  }

  return {
    id: "qvi",
    titulo: "Quadro VI — Memorial de Equipamentos",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
  };
}

function parseAcabamentos(matrix: CellMatrix, id: "qvii" | "qviii", titulo: string): QuadroVII | QuadroVIII {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "DEPENDÊNCIAS");
  const linhas: LinhaAcabamento[] = [];

  if (headerRow >= 0) {
    for (let r = headerRow + 2; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const parsed = parseLinhaAcabamentoFromRow(row);
      if (parsed) linhas.push(parsed);
    }
  }

  const base = {
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
  };

  if (id === "qvii") {
    return { id: "qvii", titulo, ...base };
  }

  return { id: "qviii", titulo, ...base };
}

function findResumoDataStart(matrix: CellMatrix, headerRow: number): number {
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const first = cellStr(matrix[r]?.[0]);
    if (!first) continue;
    if (
      isTorreOuBlocoRow(first) ||
      /apartamento|sala|depósito|garagem|loja/i.test(first)
    ) {
      return r;
    }
  }
  return headerRow + 2;
}

function isResumoFormatoMadrid(matrix: CellMatrix): boolean {
  return matrix.some((row) =>
    (row ?? []).some((cell) => /noroeste|sudoeste/i.test(cellStr(cell))),
  );
}

function parseQuadroResumo(matrix: CellMatrix): QuadroResumo {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "UNIDADE");
  const linhas: LinhaResumo[] = [];
  let blocoAtual = "";
  const formatoMadrid = isResumoFormatoMadrid(matrix);

  if (headerRow >= 0) {
    const startRow = findResumoDataStart(matrix, headerRow);
    for (let r = startRow; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const designacao = cellStr(row[0]);
      if (!designacao) continue;
      if (isDataEndRow(designacao)) break;
      if (designacao.length === 1 && /^[A-Z]$/i.test(designacao)) continue;

      if (isTorreOuBlocoRow(designacao)) {
        blocoAtual = designacao;
        continue;
      }

      if (!isUnidadeDesignacaoValida(designacao)) continue;

      linhas.push(
        parseLinhaResumoFromRow(row, { designacao, bloco: blocoAtual }, formatoMadrid),
      );
    }
  }

  const confrontacaoLabels =
    headerRow >= 0
      ? parseResumoConfrontacaoLabels(matrix, headerRow, formatoMadrid)
      : { norte: "Norte", sul: "Sul", leste: "Leste", oeste: "Oeste" };

  return {
    id: "resumo",
    titulo: "Quadro Resumo — Frações e Confrontações",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    confrontacaoLabels,
  };
}

export async function parseQuadroNbrFile(file: File): Promise<DocumentoNbrExtraido> {
  const buffer = await file.arrayBuffer();
  const workbook = readWorkbookFromArrayBuffer(buffer);

  const preliminaresSheet = workbook.SheetNames.find((n) =>
    n.toUpperCase().includes("PRELIMINAR"),
  );
  if (!preliminaresSheet) {
    throw new Error("Aba 'Informações Preliminares' não encontrada no arquivo.");
  }

  const preliminaresMatrix = sheetToMatrix(workbook, preliminaresSheet);
  const preliminares = parsePreliminares(preliminaresMatrix);

  const quadros: QuadroExtraido[] = [preliminares];
  const quadrosPresentes: QuadroId[] = [];

  const parserById: Record<
    Exclude<QuadroId, "preliminares">,
    (matrix: CellMatrix, sheetName: string) => QuadroExtraido
  > = {
    qi: (matrix, sheet) => parseQuadroI(matrix, sheet),
    qii: (matrix) => parseQuadroII(matrix),
    qiii: (matrix) => parseQuadroIII(matrix),
    qiva: (matrix) => parseQuadroIVA(matrix),
    qivb: (matrix) => parseQuadroIVB(matrix),
    qv: (matrix) => parseQuadroV(matrix),
    qvi: (matrix) => parseQuadroVI(matrix),
    qvii: (matrix) =>
      parseAcabamentos(matrix, "qvii", "Quadro VII — Acabamentos Privativos"),
    qviii: (matrix) =>
      parseAcabamentos(matrix, "qviii", "Quadro VIII — Acabamentos Comuns"),
    qcomp: (matrix, sheet) => parseQuadroComplementar(matrix, sheet),
    resumo: (matrix) => parseQuadroResumo(matrix),
  };

  const quadroOrder: Array<Exclude<QuadroId, "preliminares">> = [
    "qi",
    "qii",
    "qiii",
    "qiva",
    "qivb",
    "qv",
    "qvi",
    "qvii",
    "qviii",
    "qcomp",
    "resumo",
  ];

  for (const quadroId of quadroOrder) {
    const sheet = findSheetName(workbook.SheetNames, SHEET_MATCHERS[quadroId]);
    if (!sheet) continue;

    const matrix = sheetToMatrix(workbook, sheet);
    const parsed = parserById[quadroId](matrix, sheet);

    if (quadroId === "qivb" && /B[\s.]?1/i.test(sheet)) {
      parsed.titulo = "Quadro IV B.1 — Áreas Reais para Registro";
    }

    quadros.push(parsed);
    quadrosPresentes.push(quadroId);
  }

  return {
    nomeArquivo: file.name,
    quadros,
    preliminares,
    quadrosPresentes,
  };
}

export function getQuadroById<T extends QuadroExtraido["id"]>(
  documento: DocumentoNbrExtraido,
  id: T,
): Extract<QuadroExtraido, { id: T }> | undefined {
  return documento.quadros.find((q) => q.id === id) as Extract<QuadroExtraido, { id: T }> | undefined;
}
