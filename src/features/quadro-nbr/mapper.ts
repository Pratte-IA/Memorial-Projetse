import type { CreateEmpreendimentoInput } from "@/features/empreendimentos/types";
import {
  fmtArea,
  fmtNum,
  formatBrDateDisplay,
  parseBrNumeric,
  parseCidadeUf,
  parseLoteQuadra,
} from "@/lib/format";

import { buildQivbVagaLookup, buildUnidadeVagaLookupKeys, extractVaga, lookupVagaInfo, normalizeDesignacao } from "./extract-vaga";
import { resolvePosicaoUnidadeFromDocumento } from "./resolve-posicao-unidade";
import { CHAVE_VAGAS_TOTAL, parseQuantidadeVaga } from "./vaga-labels";
import type {
  ConfrontacaoLabels,
  DocumentoNbrExtraido,
  LinhaAcabamento,
  LinhaEquipamento,
  LinhaPavimento,
  LinhaResumo,
  LinhaUnidadeReal,
  QuadroExtraido,
  WithFormatDecimals,
} from "./types";
import { getQuadroById } from "./parser";

function getCampoValor(documento: DocumentoNbrExtraido, chave: string): string {
  return documento.preliminares.campos.find((c) => c.chave === chave)?.valor ?? "";
}

function parseIntFromText(raw: string): number {
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/** Extrai quantidade de vagas de um valor preliminar (ex.: "7", "160"). */
function parseVagasFromValor(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (!/\d/.test(trimmed)) return 0;
  const numbers = [...trimmed.matchAll(/\d+/g)].map((m) => Number(m[0])).filter((n) => n > 0);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0);
}

/** Total de vagas 3.8.x — usa item 3.8 ou soma dos subitens. */
function computeTotalVagas(documento: DocumentoNbrExtraido): number {
  const totalCampo = parseQuantidadeVaga(getCampoValor(documento, CHAVE_VAGAS_TOTAL));
  if (totalCampo > 0) return totalCampo;

  const fromSubitens = sumVagasSecao38(documento.preliminares.campos);
  if (fromSubitens > 0) return fromSubitens;

  let total = 0;
  for (const chave of ["projeto_vagas_ua", "projeto_vagas_38_2", "projeto_vagas_38_3"]) {
    total += parseQuantidadeVaga(getCampoValor(documento, chave));
  }
  return total;
}

/** Soma vagas dos subitens 3.8.x das informações preliminares. */
export function sumVagasSecao38(
  campos: Array<{ chave?: string; campo?: string; valor: string; rotulo?: string }>,
): number {
  let total = 0;
  const contabilizados = new Set<string>();

  for (const item of campos) {
    const chave = (item.chave ?? item.campo ?? "").trim();
    const rotulo = (item.rotulo ?? chave).trim();
    const valor = item.valor ?? "";

    if (chave === CHAVE_VAGAS_TOTAL) continue;

    const quantidade = parseVagasFromValor(valor);
    if (quantidade <= 0) continue;

    const isCampoVagas =
      chave.startsWith("projeto_vagas") ||
      /\b3\.8\.\d+/i.test(rotulo) ||
      (/\b3\.8\b/i.test(rotulo) && /\bvaga/i.test(rotulo));

    if (!isCampoVagas) continue;

    const chaveDedupe = chave.startsWith("projeto_vagas")
      ? chave
      : (rotulo.match(/\b3\.8\.\d+/i)?.[0]?.toLowerCase() ?? rotulo);

    if (contabilizados.has(chaveDedupe)) continue;
    contabilizados.add(chaveDedupe);
    total += quantidade;
  }

  return total;
}

function inferPavimento(designacao: string): string {
  if (/garden/i.test(designacao)) return "Térreo";
  const match = designacao.match(/(\d{3,4})/);
  if (!match) return "—";
  const numero = match[1];
  if (numero.length === 3) {
    const pav = numero[0];
    return pav === "0" ? "Térreo" : `${pav}º Pavimento`;
  }
  return `${numero.slice(0, 2)}º Pavimento`;
}

function inferTipo(designacao: string): string {
  if (/garden/i.test(designacao)) return "Garden";
  if (/sala comercial/i.test(designacao)) return "Comercial";
  if (/depósito/i.test(designacao)) return "Depósito";
  if (/apartamento/i.test(designacao)) return "Apartamento";
  return "Unidade";
}

function resolveVagaQuadro(
  vagaLookup: ReturnType<typeof buildQivbVagaLookup>,
  nome: string,
  observacoesFallback: string | null,
  torre?: string | null,
): { vaga: string | null; observacoes: string | null } {
  const fromQuadro = lookupVagaInfo(vagaLookup, nome, torre);
  if (fromQuadro) {
    return {
      vaga: fromQuadro.vaga || extractVaga(fromQuadro.observacoes) || null,
      observacoes: fromQuadro.observacoes || observacoesFallback,
    };
  }

  const observacoes = observacoesFallback?.trim() || null;
  return {
    vaga: observacoes ? extractVaga(observacoes) || null : null,
    observacoes,
  };
}

function formatConfrontacoes(
  linha: {
    confrontacaoNorte: string;
    confrontacaoSul: string;
    confrontacaoLeste: string;
    confrontacaoOeste: string;
  },
  labels?: ConfrontacaoLabels,
): string {
  const dirs = labels ?? {
    norte: "Norte",
    sul: "Sul",
    leste: "Leste",
    oeste: "Oeste",
  };
  const parts = [
    linha.confrontacaoNorte && `${dirs.norte}: ${linha.confrontacaoNorte}`,
    linha.confrontacaoSul && `${dirs.sul}: ${linha.confrontacaoSul}`,
    linha.confrontacaoLeste && `${dirs.leste}: ${linha.confrontacaoLeste}`,
    linha.confrontacaoOeste && `${dirs.oeste}: ${linha.confrontacaoOeste}`,
  ].filter(Boolean);

  return parts.join(" | ");
}

export function mapDocumentoToWizardInput(
  documento: DocumentoNbrExtraido,
  organizationId: number,
  profileId: number,
): CreateEmpreendimentoInput {
  const qi = getQuadroById(documento, "qi");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");

  const cidadeUf = parseCidadeUf(getCampoValor(documento, "projeto_cidade_uf"));
  const socios = documento.preliminares.campos
    .filter((c) => c.chave.startsWith("incorporador_socio_"))
    .map((c) => c.valor)
    .filter(Boolean);

  const blocos = new Set<string>();
  for (const linha of qivb?.linhas ?? resumo?.linhas ?? []) {
    if (linha.bloco) blocos.add(linha.bloco);
  }

  const qcomp = getQuadroById(documento, "qcomp");
  for (const linha of qcomp?.linhas ?? []) {
    if (linha.torre) blocos.add(linha.torre);
  }

  const unidadesFonte = resumo?.linhas.length ? resumo.linhas : (qivb?.linhas ?? []);
  const totalUnidades =
    unidadesFonte.length || parseIntFromText(getCampoValor(documento, "projeto_qtd_unidades"));

  const torres = [...blocos].map((nome) => {
    const unidadesBloco = unidadesFonte.filter((u) => u.bloco === nome);
    const pavimentos = new Set(unidadesBloco.map((u) => inferPavimento(u.designacao)));
    return {
      nome,
      pavimentos: pavimentos.size || parseIntFromText(getCampoValor(documento, "projeto_pavimentos")),
      unidadesPorPavimento: Math.ceil(unidadesBloco.length / Math.max(pavimentos.size, 1)),
      totalUnidades: unidadesBloco.length,
    };
  });

  if (!torres.length) {
    torres.push({
      nome: "Bloco 01",
      pavimentos: parseIntFromText(getCampoValor(documento, "projeto_pavimentos")) || 1,
      unidadesPorPavimento: totalUnidades || 1,
      totalUnidades: totalUnidades || 1,
    });
  }

  const areaTerrenoRaw = getCampoValor(documento, "projeto_area_terreno");
  const areaTerrenoNum = parseBrNumeric(areaTerrenoRaw);
  const areaGlobal = qi?.totais.areaRealGlobal
    ? fmtArea(qi.totais.areaRealGlobal)
    : areaTerrenoNum !== null
      ? ""
      : "";

  const totaisQi = qi?.linhas.reduce(
    (acc, l) => ({
      privativa: acc.privativa + (l.areaPrivativaTotalReal ?? 0),
      comum:
        acc.comum +
        (l.areaUsoComumNaoPropTotalReal ?? 0) +
        (l.areaUsoComumPropTotalReal ?? 0),
    }),
    { privativa: 0, comum: 0 },
  );

  return {
    organizationId,
    profileId,
    identificacao: {
      nome: getCampoValor(documento, "projeto_nome") || documento.preliminares.cabecalho.empreendimento,
      incorporadora: getCampoValor(documento, "incorporador_nome"),
      cnpj: getCampoValor(documento, "incorporador_cnpj"),
      representante: socios[0] ?? "",
      incorporadoraEndereco: getCampoValor(documento, "incorporador_endereco"),
      socios,
    },
    localizacao: (() => {
      const loteQuadraRaw = getCampoValor(documento, "projeto_lote_quadra");
      const { lote, quadra } = parseLoteQuadra(loteQuadraRaw);
      return {
        endereco: getCampoValor(documento, "projeto_logradouro"),
        matricula: "",
        cidade: cidadeUf.cidade,
        uf: cidadeUf.uf,
        lote,
        quadra,
        bairro: "",
      };
    })(),
    torres,
    unidades: {
      total: totalUnidades,
      tipos: [...new Set(unidadesFonte.map((u) => inferTipo(u.designacao)))],
      vagas: computeTotalVagas(documento),
    },
    areas: {
      terreno: areaTerrenoNum !== null ? fmtArea(areaTerrenoNum) : "",
      construida: areaGlobal,
      privativa: totaisQi ? fmtArea(totaisQi.privativa) : "",
      comum: totaisQi ? fmtArea(totaisQi.comum) : "",
    },
    equipe: {
      responsavel: getCampoValor(documento, "rt_nome"),
      creaCau: getCampoValor(documento, "rt_crea"),
      observacoes: getCampoValor(documento, "rt_art"),
    },
    aprovacao: {
      alvara: getCampoValor(documento, "projeto_alvara"),
      dataAprovacao: formatBrDateDisplay(getCampoValor(documento, "projeto_data_aprovacao")),
    },
  };
}

export interface UnidadeInsertPayload {
  nome: string;
  torre: string;
  pavimento: string;
  tipo: string;
  areaPrivativa: number | null;
  areaComum: number | null;
  areaTotal: number | null;
  areaGarden: number | null;
  areaGaragem: number | null;
  areaTerrenoExclusivo: number | null;
  vaga: string | null;
  fracao: string | null;
  confrontacoes: string | null;
  observacoes: string | null;
  posicao: string | null;
}

function decimalsForField(linha: WithFormatDecimals, field: string, fallback: number): number {
  return linha.formatDecimals?.[field] ?? fallback;
}

function findQivbLinha(
  qivb: DocumentoNbrExtraido["quadros"][number] | undefined,
  designacao: string,
  bloco: string | null,
): LinhaUnidadeReal | undefined {
  if (!qivb || qivb.id !== "qivb" || !("linhas" in qivb)) return undefined;
  const normalized = normalizeDesignacao(designacao);
  return qivb.linhas.find(
    (linha) =>
      normalizeDesignacao(linha.designacao) === normalized &&
      (linha.bloco || "—") === (bloco || "—"),
  );
}

/** Fração territorial para o memorial — Quadro Resumo (% + m²). */
export function formatFracaoTerritorialTexto(linha: LinhaResumo): string | null {
  const pct = linha.fracaoTerrenoPercentual;
  const m2 = linha.fracaoTerrenoM2;

  if (pct != null) {
    const pctStr = fmtNum(pct, decimalsForField(linha, "fracaoTerrenoPercentual", 5));
    if (m2 != null) {
      const m2Str = fmtNum(m2, decimalsForField(linha, "fracaoTerrenoM2", 5));
      return `${pctStr}%, equivalente a ${m2Str} m²`;
    }
    return `${pctStr}%`;
  }

  if (m2 != null) {
    return `equivalente a ${fmtNum(m2, decimalsForField(linha, "fracaoTerrenoM2", 5))} m²`;
  }

  if (linha.fracaoPredial != null) {
    return fmtNum(linha.fracaoPredial, decimalsForField(linha, "fracaoPredial", 5));
  }

  return null;
}

function resolveAreasTerrenoUnidade(
  designacao: string,
  linhaResumo: LinhaResumo | null,
  refQivb: LinhaUnidadeReal | undefined,
): Pick<UnidadeInsertPayload, "areaGarden" | "areaGaragem" | "areaTerrenoExclusivo"> {
  const isGarden = /garden/i.test(designacao);
  const terrenoExclusivo = refQivb?.areaTerrenoExclusivo ?? null;

  const gardenCandidate =
    (isGarden ? linhaResumo?.areaPrivativaAcessoria : null) ??
    (isGarden ? refQivb?.areaPrivativaAcessoria : null);
  const garden =
    gardenCandidate != null && gardenCandidate > 0 ? gardenCandidate : isGarden ? null : null;

  let garagem: number | null = null;
  if (terrenoExclusivo != null && garden != null && garden > 0) {
    garagem = Math.round((terrenoExclusivo - garden) * 100000) / 100000;
  } else if (terrenoExclusivo != null) {
    garagem = terrenoExclusivo;
  }

  const areaTerrenoExclusivo =
    terrenoExclusivo ??
    (garden != null && garagem != null ? Math.round((garden + garagem) * 100) / 100 : garagem);

  return { areaGarden: garden, areaGaragem: garagem, areaTerrenoExclusivo };
}

function formatFracaoFromQivb(linha: LinhaUnidadeReal): string | null {
  const pct = linha.coeficienteTerreno;
  if (pct != null) {
    return `${fmtNum(pct, decimalsForField(linha, "coeficienteTerreno", 5))}%`;
  }
  if (linha.coeficienteProporcionalidade != null) {
    return fmtNum(
      linha.coeficienteProporcionalidade,
      decimalsForField(linha, "coeficienteProporcionalidade", 5),
    );
  }
  return null;
}

export function mapDocumentoToUnidades(documento: DocumentoNbrExtraido): UnidadeInsertPayload[] {
  const resumo = getQuadroById(documento, "resumo");
  const qivb = getQuadroById(documento, "qivb");
  const vagaLookup = buildQivbVagaLookup(documento);
  const resolvePosicao = (nome: string, torre: string) =>
    resolvePosicaoUnidadeFromDocumento(documento, nome, torre);

  if (resumo?.linhas.length) {
    return resumo.linhas.map((linha) => {
      const refQivb = findQivbLinha(qivb, linha.designacao, linha.bloco || null);
      const { vaga, observacoes } = resolveVagaQuadro(
        vagaLookup,
        linha.designacao,
        refQivb?.observacoes ?? null,
        linha.bloco || refQivb?.bloco || null,
      );
      const terreno = resolveAreasTerrenoUnidade(linha.designacao, linha, refQivb);

      return {
        nome: linha.designacao,
        torre: linha.bloco || "—",
        pavimento: inferPavimento(linha.designacao),
        tipo: inferTipo(linha.designacao),
        areaPrivativa: linha.areaPrivativaPrincipal,
        areaComum: linha.areaComum,
        areaTotal: linha.areaTotal,
        ...terreno,
        vaga,
        fracao: formatFracaoTerritorialTexto(linha),
        confrontacoes: formatConfrontacoes(linha, resumo.confrontacaoLabels) || null,
        observacoes,
        posicao: resolvePosicao(linha.designacao, linha.bloco || "—"),
      };
    });
  }

  return (qivb?.linhas ?? [])
    .filter((linha) => !/^vaga\s/i.test(linha.designacao.trim()))
    .map((linha) => {
      const { vaga, observacoes } = resolveVagaQuadro(
        vagaLookup,
        linha.designacao,
        linha.observacoes || null,
        linha.bloco || null,
      );
      const terreno = resolveAreasTerrenoUnidade(linha.designacao, null, linha);

      return {
        nome: linha.designacao,
        torre: linha.bloco || "—",
        pavimento: inferPavimento(linha.designacao),
        tipo: inferTipo(linha.designacao),
        areaPrivativa: linha.areaPrivativaPrincipal,
        areaComum: linha.areaUsoComum,
        areaTotal: linha.areaRealTotal,
        ...terreno,
        vaga,
        fracao: formatFracaoFromQivb(linha),
        confrontacoes: null,
        observacoes,
        posicao: resolvePosicao(linha.designacao, linha.bloco || "—"),
      };
    });
}

export interface DadoExtraidoInsertPayload {
  bloco: string;
  campo: string;
  valor: string;
  confianca: number;
  status: "extraido" | "confirmado";
}

function dadoExtraidoKey(bloco: string, campo: string): string {
  return `${bloco}:${campo}`;
}

function upsertDadoExtraido(
  index: Map<string, DadoExtraidoInsertPayload>,
  record: DadoExtraidoInsertPayload,
): void {
  index.set(dadoExtraidoKey(record.bloco, record.campo), record);
}

function upsertMemorialLinhaCampo(
  index: Map<string, DadoExtraidoInsertPayload>,
  bloco: "qvi" | "qvii" | "qviii",
  linhaIdx: number,
  campo: string,
  valor: string,
  statusCampo: "extraido" | "confirmado",
): void {
  const trimmed = valor.trim();
  if (!trimmed) return;

  upsertDadoExtraido(index, {
    bloco,
    campo: `linha__${linhaIdx}__${campo}`,
    valor: trimmed,
    confianca: 92,
    status: statusCampo,
  });
}

function mapMemorialEquipamentosToDadosExtraidos(
  index: Map<string, DadoExtraidoInsertPayload>,
  linhas: LinhaEquipamento[],
  statusCampo: "extraido" | "confirmado",
): void {
  linhas.forEach((linha, i) => {
    upsertMemorialLinhaCampo(index, "qvi", i, "equipamento", linha.equipamento, statusCampo);
    upsertMemorialLinhaCampo(index, "qvi", i, "tipo_marca", linha.tipoMarca, statusCampo);
    upsertMemorialLinhaCampo(index, "qvi", i, "acabamento", linha.acabamento, statusCampo);
  });
}

function mapMemorialAcabamentosToDadosExtraidos(
  index: Map<string, DadoExtraidoInsertPayload>,
  bloco: "qvii" | "qviii",
  linhas: LinhaAcabamento[],
  statusCampo: "extraido" | "confirmado",
): void {
  linhas.forEach((linha, i) => {
    upsertMemorialLinhaCampo(index, bloco, i, "dependencia", linha.dependencia, statusCampo);
    if (linha.isSecao) return;

    upsertMemorialLinhaCampo(index, bloco, i, "piso_revestimento", linha.pisoRevestimento, statusCampo);
    upsertMemorialLinhaCampo(index, bloco, i, "piso_acabamento", linha.pisoAcabamento, statusCampo);
    upsertMemorialLinhaCampo(index, bloco, i, "parede_revestimento", linha.paredeRevestimento, statusCampo);
    upsertMemorialLinhaCampo(index, bloco, i, "parede_acabamento", linha.paredeAcabamento, statusCampo);
    upsertMemorialLinhaCampo(index, bloco, i, "teto_revestimento", linha.tetoRevestimento, statusCampo);
    upsertMemorialLinhaCampo(index, bloco, i, "teto_acabamento", linha.tetoAcabamento, statusCampo);
  });
}

export function mapDocumentoToDadosExtraidos(
  documento: DocumentoNbrExtraido,
  options?: { validadoNoWizard?: boolean },
): DadoExtraidoInsertPayload[] {
  const index = new Map<string, DadoExtraidoInsertPayload>();
  const statusCampo = options?.validadoNoWizard ? ("confirmado" as const) : ("extraido" as const);
  const statusPreliminares = "confirmado" as const;

  for (const campo of documento.preliminares.campos) {
    upsertDadoExtraido(index, {
      bloco: "preliminares",
      campo: campo.chave,
      valor: campo.valor,
      confianca: 95,
      status: statusPreliminares,
    });
  }

  for (const quadro of documento.quadros) {
    if (quadro.id === "preliminares") continue;

    if ("campos" in quadro && quadro.campos) {
      for (const campo of quadro.campos) {
        if (!campo.valor.trim()) continue;
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: campo.chave,
          valor: campo.valor,
          confianca: 92,
          status: statusCampo,
        });
      }
    }

    if ((quadro.id === "qi" || quadro.id === "qcomp") && "totais" in quadro) {
      const areaRealGlobal =
        quadro.totais.areaRealGlobal !== null ? String(quadro.totais.areaRealGlobal) : "";
      if (areaRealGlobal) {
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: "area_real_global",
          valor: areaRealGlobal,
          confianca: 98,
          status: statusCampo,
        });
      }

      const areaEquivGlobal =
        quadro.totais.areaEquivalenteGlobal !== null
          ? String(quadro.totais.areaEquivalenteGlobal)
          : "";
      if (areaEquivGlobal) {
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: "area_equiv_global",
          valor: areaEquivGlobal,
          confianca: 98,
          status: statusCampo,
        });
      }
    }

    if (quadro.id === "qivb" && "linhas" in quadro) {
      for (const linha of quadro.linhas) {
        const observacoes = linha.observacoes?.trim() ?? "";
        if (!observacoes) continue;

        for (const key of buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || undefined)) {
          upsertDadoExtraido(index, {
            bloco: "qivb",
            campo: `observacoes__${key}`,
            valor: observacoes,
            confianca: 96,
            status: statusCampo,
          });
        }
      }
    }

    if (quadro.id === "qvi" && "linhas" in quadro) {
      mapMemorialEquipamentosToDadosExtraidos(index, quadro.linhas, statusCampo);
    }

    if ((quadro.id === "qvii" || quadro.id === "qviii") && "linhas" in quadro) {
      mapMemorialAcabamentosToDadosExtraidos(index, quadro.id, quadro.linhas, statusCampo);
    }
  }

  return [...index.values()];
}

export function updateQuadroInDocumento(
  documento: DocumentoNbrExtraido,
  quadroAtualizado: QuadroExtraido,
): DocumentoNbrExtraido {
  const quadros = documento.quadros.map((q) =>
    q.id === quadroAtualizado.id ? quadroAtualizado : q,
  );

  return {
    ...documento,
    quadros,
    preliminares:
      quadroAtualizado.id === "preliminares"
        ? (quadroAtualizado as DocumentoNbrExtraido["preliminares"])
        : documento.preliminares,
  };
}

export interface CondominioPavimentoInsertPayload {
  torre: string | null;
  nome: string;
  areaReal: number | null;
  areaEquivalente: number | null;
  ordem: number;
  fonteQuadro: "qi" | "qcomp";
}

export interface CondominioEspacoComumInsertPayload {
  nome: string;
  ordem: number;
  fonteQuadro: "qviii";
}

function normalizarNomePavimento(nome: string): string {
  return nome.trim().toLowerCase();
}

function linhasPavimentoToCondominioPayload(
  linhas: LinhaPavimento[],
  fonteQuadro: "qi" | "qcomp",
  aggregateByNome: boolean,
): CondominioPavimentoInsertPayload[] {
  const filtered = linhas.filter((linha) => linha.pavimento.trim());

  if (!aggregateByNome) {
    return filtered.map((linha, ordem) => ({
      torre: linha.torre?.trim() || null,
      nome: linha.pavimento.trim(),
      areaReal: linha.areaPavimentoReal,
      areaEquivalente: linha.areaPavimentoEquivalente,
      ordem,
      fonteQuadro,
    }));
  }

  const byNome = new Map<
    string,
    CondominioPavimentoInsertPayload & { ordemPrimeiraOcorrencia: number }
  >();

  for (const [index, linha] of filtered.entries()) {
    const nome = linha.pavimento.trim();
    const key = normalizarNomePavimento(nome);
    const existing = byNome.get(key);

    if (existing) {
      if (linha.areaPavimentoReal != null) {
        existing.areaReal = (existing.areaReal ?? 0) + linha.areaPavimentoReal;
      }
      if (linha.areaPavimentoEquivalente != null) {
        existing.areaEquivalente =
          (existing.areaEquivalente ?? 0) + linha.areaPavimentoEquivalente;
      }
      continue;
    }

    byNome.set(key, {
      torre: null,
      nome,
      areaReal: linha.areaPavimentoReal,
      areaEquivalente: linha.areaPavimentoEquivalente,
      ordem: byNome.size,
      fonteQuadro,
      ordemPrimeiraOcorrencia: index,
    });
  }

  return [...byNome.values()]
    .sort((a, b) => a.ordemPrimeiraOcorrencia - b.ordemPrimeiraOcorrencia)
    .map(({ ordemPrimeiraOcorrencia: _, ...payload }, ordem) => ({ ...payload, ordem }));
}

/** Consolida pavimentos repetidos (ex.: QCOMP por torre) em totais do condomínio. */
export function aggregateCondominioPavimentos<
  T extends { nome: string; areaReal: number | null; ordem: number },
>(pavimentos: T[]): T[] {
  const byNome = new Map<string, T & { ordemPrimeiraOcorrencia: number }>();

  for (const [index, pavimento] of pavimentos.entries()) {
    const nome = pavimento.nome.trim();
    if (!nome) continue;

    const key = normalizarNomePavimento(nome);
    const existing = byNome.get(key);

    if (existing) {
      if (pavimento.areaReal != null) {
        existing.areaReal = ((existing.areaReal ?? 0) + pavimento.areaReal) as T["areaReal"];
      }
      continue;
    }

    byNome.set(key, { ...pavimento, nome, ordemPrimeiraOcorrencia: index });
  }

  return [...byNome.values()]
    .sort((a, b) => a.ordemPrimeiraOcorrencia - b.ordemPrimeiraOcorrencia)
    .map((item, ordem) => {
      const { ordemPrimeiraOcorrencia: _, ...payload } = item;
      return { ...payload, ordem } as unknown as T;
    });
}

/** Áreas por pavimento — Quadro I (item 17) tem totais do condomínio; QCOMP só como fallback agregado. */
export function mapDocumentoToCondominioPavimentos(
  documento: DocumentoNbrExtraido,
): CondominioPavimentoInsertPayload[] {
  const qcomp = getQuadroById(documento, "qcomp");
  const qi = getQuadroById(documento, "qi");

  if (quadroTemPavimentosUtil(qi) && qi) {
    return linhasPavimentoToCondominioPayload(qi.linhas, "qi", false);
  }

  if (quadroTemPavimentosUtil(qcomp) && qcomp) {
    return linhasPavimentoToCondominioPayload(qcomp.linhas, "qcomp", true);
  }

  if (qi?.linhas.length) {
    return linhasPavimentoToCondominioPayload(qi.linhas, "qi", false);
  }

  if (qcomp?.linhas.length) {
    return linhasPavimentoToCondominioPayload(qcomp.linhas, "qcomp", true);
  }

  return [];
}

function quadroTemPavimentosUtil(
  quadro?: Pick<Extract<QuadroExtraido, { id: "qi" | "qcomp" }>, "linhas">,
): boolean {
  return (quadro?.linhas ?? []).some(
    (linha) =>
      linha.pavimento.trim().length > 0 &&
      ((linha.areaPavimentoReal != null && linha.areaPavimentoReal > 0) ||
        (linha.areaPavimentoEquivalente != null && linha.areaPavimentoEquivalente > 0)),
  );
}

/** Espaços de uso comum — dependências do Quadro VIII (acabamentos comuns). */
export function mapDocumentoToEspacosComuns(
  documento: DocumentoNbrExtraido,
): CondominioEspacoComumInsertPayload[] {
  const qviii = getQuadroById(documento, "qviii");
  if (!qviii?.linhas.length) return [];

  const vistos = new Set<string>();
  const espacos: CondominioEspacoComumInsertPayload[] = [];

  for (const linha of qviii.linhas) {
    if (linha.isSecao) continue;
    const nome = linha.dependencia.trim();
    if (!nome) continue;

    const chave = nome.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);

    espacos.push({
      nome,
      ordem: espacos.length,
      fonteQuadro: "qviii",
    });
  }

  return espacos;
}
