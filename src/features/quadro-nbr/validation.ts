import type { AlertaValidacao, DocumentoNbrExtraido, QuadroId, ResultadoValidacao } from "./types";
import { getQuadroById } from "./parser";
import { getQuadroIvBTitulo } from "./quadro-iv";
import {
  cellNum,
  designacaoParaExibicao,
  isUnidadeDesignacaoValida,
} from "./parser/sheet-utils";

const TOLERANCIA_AREA = 0.05;

function approxEqual(a: number | null, b: number | null, tolerance = TOLERANCIA_AREA): boolean {
  if (a === null || b === null) return true;
  return Math.abs(a - b) <= tolerance;
}

function addAlerta(
  alertas: AlertaValidacao[],
  severidade: AlertaValidacao["severidade"],
  quadroOrigem: QuadroId,
  mensagem: string,
  quadroDestino?: QuadroId,
  detalhes?: AlertaValidacao["detalhes"],
): void {
  alertas.push({
    id: `${quadroOrigem}-${alertas.length}`,
    severidade,
    quadroOrigem,
    quadroDestino,
    mensagem,
    detalhes,
  });
}

function chaveDesignacao(designacao: string): string {
  return designacao.trim().toLowerCase();
}

function filtrarLinhasUnidade<T extends { designacao: string }>(linhas: T[]): T[] {
  return linhas.filter((l) => isUnidadeDesignacaoValida(l.designacao));
}

function listarDesignacoesUnicas(linhas: Array<{ designacao: string }>, outroConjunto: Set<string>): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];

  for (const linha of linhas) {
    const chave = chaveDesignacao(linha.designacao);
    if (!isUnidadeDesignacaoValida(linha.designacao)) continue;
    if (outroConjunto.has(chave)) continue;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    resultado.push(designacaoParaExibicao(linha.designacao));
  }

  return resultado;
}

function diffDesignacoes(
  linhasA: Array<{ designacao: string }>,
  linhasB: Array<{ designacao: string }>,
): { apenasEmA: string[]; apenasEmB: string[] } {
  const validA = filtrarLinhasUnidade(linhasA);
  const validB = filtrarLinhasUnidade(linhasB);
  const setB = new Set(validB.map((l) => chaveDesignacao(l.designacao)));
  const setA = new Set(validA.map((l) => chaveDesignacao(l.designacao)));

  return {
    apenasEmA: listarDesignacoesUnicas(validA, setB),
    apenasEmB: listarDesignacoesUnicas(validB, setA),
  };
}

function detalhesContagemUnidades(
  tituloA: string,
  tituloB: string,
  apenasEmA: string[],
  apenasEmB: string[],
): AlertaValidacao["detalhes"] {
  const detalhes: NonNullable<AlertaValidacao["detalhes"]> = [];

  if (apenasEmA.length) {
    detalhes.push({
      titulo: `${apenasEmA.length} unidade(s) apenas em ${tituloA}`,
      unidades: apenasEmA,
    });
  }

  if (apenasEmB.length) {
    detalhes.push({
      titulo: `${apenasEmB.length} unidade(s) apenas em ${tituloB}`,
      unidades: apenasEmB,
    });
  }

  return detalhes.length ? detalhes : undefined;
}

export function validarQuadroAtual(
  documento: DocumentoNbrExtraido,
  quadroId: QuadroId,
): ResultadoValidacao {
  const alertas: AlertaValidacao[] = [];

  if (quadroId === "preliminares") {
    const nome = documento.preliminares.campos.find((c) => c.chave === "projeto_nome")?.valor;
    const cnpj = documento.preliminares.campos.find((c) => c.chave === "incorporador_cnpj")?.valor;
    if (!nome?.trim()) addAlerta(alertas, "erro", "preliminares", "Nome do edifício (3.1) é obrigatório.");
    if (!cnpj?.trim()) addAlerta(alertas, "aviso", "preliminares", "CNPJ do incorporador (1.3) não informado.");
  }

  if (quadroId === "qi") {
    const qi = getQuadroById(documento, "qi");
    if (!qi?.linhas.length) {
      addAlerta(alertas, "erro", "qi", "Nenhum pavimento extraído do Quadro I.");
    }
  }

  if (quadroId === "qii") {
    const qii = getQuadroById(documento, "qii");
    if (!qii?.linhas.length) {
      addAlerta(alertas, "erro", "qii", "Nenhuma unidade extraída do Quadro II.");
    }
  }

  if (quadroId === "qivb") {
    const qivb = getQuadroById(documento, "qivb");
    const titulo = getQuadroIvBTitulo(documento);
    if (!qivb?.linhas.length) {
      addAlerta(alertas, "erro", "qivb", `Nenhuma unidade extraída do ${titulo}.`);
    }
  }

  if (quadroId === "resumo") {
    const resumo = getQuadroById(documento, "resumo");
    if (!resumo?.linhas.length) {
      addAlerta(alertas, "erro", "resumo", "Nenhuma unidade extraída do Quadro Resumo.");
    }
  }

  if (quadroId === "qcomp") {
    const qcomp = getQuadroById(documento, "qcomp");
    if (!qcomp?.linhas.length) {
      addAlerta(alertas, "erro", "qcomp", "Nenhum pavimento extraído do Quadro Complementar.");
    }
  }

  const opcionaisAusentes: QuadroId[] = ["qiva", "qcomp"];
  if (opcionaisAusentes.includes(quadroId) && !documento.quadrosPresentes.includes(quadroId)) {
    return { alertas: [], podeAvancar: true };
  }

  return {
    alertas,
    podeAvancar: !alertas.some((a) => a.severidade === "erro"),
  };
}

export function validarCruzamento(documento: DocumentoNbrExtraido): ResultadoValidacao {
  const alertas: AlertaValidacao[] = [];
  const tituloQivb = getQuadroIvBTitulo(documento);

  const qi = getQuadroById(documento, "qi");
  const qiii = getQuadroById(documento, "qiii");
  const qii = getQuadroById(documento, "qii");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");

  const areaQiReal = qi?.totais.areaRealGlobal ?? null;
  const areaQiiiReal = qiii?.campos.find((c) => c.chave === "area_real_global");
  const areaQiiiValor = areaQiiiReal?.valor ? cellNum(areaQiiiReal.valor) : null;

  if (!approxEqual(areaQiReal, areaQiiiValor)) {
    addAlerta(
      alertas,
      "erro",
      "qi",
      `Área real global diverge: Quadro I (${areaQiReal ?? "—"}) vs Quadro III 4.3 (${areaQiiiValor ?? "—"}).`,
      "qiii",
    );
  }

  const countQii = qii ? filtrarLinhasUnidade(qii.linhas).length : 0;
  const countQivb = qivb ? filtrarLinhasUnidade(qivb.linhas).length : 0;
  const countResumo = resumo ? filtrarLinhasUnidade(resumo.linhas).length : 0;

  if (countQii && countQivb && countQii !== countQivb && qii && qivb) {
    const { apenasEmA, apenasEmB } = diffDesignacoes(
      filtrarLinhasUnidade(qii.linhas),
      filtrarLinhasUnidade(qivb.linhas),
    );
    addAlerta(
      alertas,
      "erro",
      "qii",
      `Contagem de unidades diverge: Quadro II (${countQii}) vs ${tituloQivb} (${countQivb}).`,
      "qivb",
      detalhesContagemUnidades("Quadro II", tituloQivb, apenasEmA, apenasEmB),
    );
  }

  if (countQivb && countResumo && countQivb !== countResumo && qivb && resumo) {
    const { apenasEmA, apenasEmB } = diffDesignacoes(
      filtrarLinhasUnidade(qivb.linhas),
      filtrarLinhasUnidade(resumo.linhas),
    );
    addAlerta(
      alertas,
      "erro",
      "qivb",
      `Contagem de unidades diverge: ${tituloQivb} (${countQivb}) vs Quadro Resumo (${countResumo}).`,
      "resumo",
      detalhesContagemUnidades(tituloQivb, "Quadro Resumo", apenasEmA, apenasEmB),
    );
  }

  if (qivb && resumo) {
    const divergentesArea: string[] = [];
    for (const linha of resumo.linhas) {
      const ref = qivb.linhas.find((u) => chaveDesignacao(u.designacao) === chaveDesignacao(linha.designacao));
      if (!ref) continue;
      if (!approxEqual(linha.areaTotal, ref.areaRealTotal)) {
        divergentesArea.push(designacaoParaExibicao(linha.designacao));
      }
    }
    if (divergentesArea.length > 0) {
      addAlerta(
        alertas,
        "aviso",
        "resumo",
        `${divergentesArea.length} unidade(s) com área total divergente entre ${tituloQivb} e Quadro Resumo.`,
        "qivb",
        [{ titulo: "Unidades com área total diferente", unidades: divergentesArea }],
      );
    }
  }

  const cabecalhos = documento.quadros
    .filter((q) => q.id !== "preliminares")
    .map((q) => q.cabecalho.empreendimento)
    .filter(Boolean);
  const nomesUnicos = new Set(cabecalhos);
  if (nomesUnicos.size > 1) {
    addAlerta(
      alertas,
      "aviso",
      "preliminares",
      "Nome do empreendimento difere entre cabeçalhos dos quadros.",
    );
  }

  return {
    alertas,
    podeAvancar: !alertas.some((a) => a.severidade === "erro"),
  };
}
