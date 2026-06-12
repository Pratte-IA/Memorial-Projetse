import type { CreateEmpreendimentoInput } from "@/features/empreendimentos/types";
import { fmtArea, parseBrNumeric, parseLoteQuadra } from "@/lib/format";

import type { DocumentoNbrExtraido, QuadroExtraido } from "./types";
import { getQuadroById } from "./parser";

function getCampoValor(documento: DocumentoNbrExtraido, chave: string): string {
  return documento.preliminares.campos.find((c) => c.chave === chave)?.valor ?? "";
}

function parseCidadeUf(raw: string): { cidade: string; uf: string } {
  const parts = raw.split("/").map((s) => s.trim());
  return { cidade: parts[0] ?? "", uf: parts[1] ?? "" };
}

function parseIntFromText(raw: string): number {
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/** Extrai quantidade de vagas — soma todos os números quando há mais de um no texto. */
function parseVagasFromValor(raw: string): number {
  const numbers = [...raw.matchAll(/\d+/g)].map((m) => Number(m[0])).filter((n) => n > 0);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0);
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

function extractVaga(observacoes: string): string {
  const match = observacoes.match(/vaga\s*n[º°]?\s*([\w-]+)/i);
  return match ? match[1] : "";
}

function formatConfrontacoes(linha: {
  confrontacaoNorte: string;
  confrontacaoSul: string;
  confrontacaoLeste: string;
  confrontacaoOeste: string;
}): string {
  const parts = [
    linha.confrontacaoNorte && `Norte: ${linha.confrontacaoNorte}`,
    linha.confrontacaoSul && `Sul: ${linha.confrontacaoSul}`,
    linha.confrontacaoLeste && `Leste: ${linha.confrontacaoLeste}`,
    linha.confrontacaoOeste && `Oeste: ${linha.confrontacaoOeste}`,
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
        lote: lote || loteQuadraRaw,
        quadra,
        bairro: "",
      };
    })(),
    torres,
    unidades: {
      total: totalUnidades,
      tipos: [...new Set(unidadesFonte.map((u) => inferTipo(u.designacao)))],
      vagas: sumVagasSecao38(documento.preliminares.campos),
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
      dataAprovacao: getCampoValor(documento, "projeto_data_aprovacao"),
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
  vaga: string | null;
  fracao: string | null;
  confrontacoes: string | null;
  observacoes: string | null;
}

export function mapDocumentoToUnidades(documento: DocumentoNbrExtraido): UnidadeInsertPayload[] {
  const resumo = getQuadroById(documento, "resumo");
  const qivb = getQuadroById(documento, "qivb");

  if (resumo?.linhas.length) {
    return resumo.linhas.map((linha) => {
      const refQivb = qivb?.linhas.find((u) => u.designacao === linha.designacao);
      return {
        nome: linha.designacao,
        torre: linha.bloco || "—",
        pavimento: inferPavimento(linha.designacao),
        tipo: inferTipo(linha.designacao),
        areaPrivativa: linha.areaPrivativaPrincipal,
        areaComum: linha.areaComum,
        areaTotal: linha.areaTotal,
        areaGarden: /garden/i.test(linha.designacao) ? linha.areaPrivativaAcessoria : null,
        vaga: refQivb ? extractVaga(refQivb.observacoes) || null : null,
        fracao:
          linha.fracaoTerrenoPercentual !== null
            ? String(linha.fracaoTerrenoPercentual)
            : linha.fracaoPredial !== null
              ? String(linha.fracaoPredial)
              : null,
        confrontacoes: formatConfrontacoes(linha) || null,
        observacoes: refQivb?.observacoes || null,
      };
    });
  }

  return (qivb?.linhas ?? []).map((linha) => ({
    nome: linha.designacao,
    torre: linha.bloco || "—",
    pavimento: inferPavimento(linha.designacao),
    tipo: inferTipo(linha.designacao),
    areaPrivativa: linha.areaPrivativaPrincipal,
    areaComum: linha.areaUsoComum,
    areaTotal: linha.areaRealTotal,
    areaGarden: /garden/i.test(linha.designacao) ? linha.areaPrivativaAcessoria : null,
    vaga: extractVaga(linha.observacoes) || null,
    fracao: linha.coeficienteProporcionalidade !== null ? String(linha.coeficienteProporcionalidade) : null,
    confrontacoes: null,
    observacoes: linha.observacoes || null,
  }));
}

export interface DadoExtraidoInsertPayload {
  bloco: string;
  campo: string;
  valor: string;
  confianca: number;
  status: "extraido" | "confirmado";
}

export function mapDocumentoToDadosExtraidos(documento: DocumentoNbrExtraido): DadoExtraidoInsertPayload[] {
  const records: DadoExtraidoInsertPayload[] = [];

  for (const campo of documento.preliminares.campos) {
    records.push({
      bloco: "preliminares",
      campo: campo.chave,
      valor: campo.valor,
      confianca: 95,
      status: "confirmado",
    });
  }

  for (const quadro of documento.quadros) {
    if (quadro.id === "preliminares") continue;

    if ("campos" in quadro && quadro.campos) {
      for (const campo of quadro.campos) {
        if (!campo.valor.trim()) continue;
        records.push({
          bloco: quadro.id,
          campo: campo.chave,
          valor: campo.valor,
          confianca: 92,
          status: "extraido",
        });
      }
    }

    if ((quadro.id === "qi" || quadro.id === "qcomp") && "totais" in quadro) {
      records.push(
        {
          bloco: quadro.id,
          campo: "area_real_global",
          valor: quadro.totais.areaRealGlobal !== null ? String(quadro.totais.areaRealGlobal) : "",
          confianca: 98,
          status: "extraido",
        },
        {
          bloco: quadro.id,
          campo: "area_equivalente_global",
          valor:
            quadro.totais.areaEquivalenteGlobal !== null
              ? String(quadro.totais.areaEquivalenteGlobal)
              : "",
          confianca: 98,
          status: "extraido",
        },
      );
    }
  }

  return records;
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
