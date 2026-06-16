import type { DocumentoNbrExtraido } from "./types";
import { normalizeTorre } from "./extract-vaga";
import { getQuadroById } from "./parser";

const PAVIMENTO_LIST_RE =
  /, no pavimento térreo, 1[º°o], 2[º°o], 3[º°o] e 4[°ºo] pavimento, respectivamente, /i;

function normalizeUnitNumber(value: string): string {
  return value.replace(/^0+/, "") || "0";
}

/** Remove a enumeração de pavimentos da explicitação do Quadro V. */
export function formatPosicaoMemorial(fragmento: string): string {
  return fragmento
    .replace(PAVIMENTO_LIST_RE, ", ")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

export function extractPosicaoFromExplicitacao(valor: string): string | null {
  const match = valor.match(/sendo o apartamento.+?(?:\.|$)/i);
  if (!match) return null;
  return formatPosicaoMemorial(match[0].replace(/\.$/, ""));
}

function extractNumbersFromExplicitacaoHeader(header: string): string[] {
  const beforeTorre = header.split(/\s+da\s+torre\s/i)[0] ?? header;
  return beforeTorre.match(/\d+/g) ?? [];
}

function unitNumberForMatch(nome: string): string | null {
  const match = nome.trim().match(/(\d+)$/);
  return match ? match[1] : null;
}

function explicitacaoMatchesUnit(header: string, nome: string, torre: string): boolean {
  if (/^torre\s*\d/i.test(header.trim())) return false;

  const torreInHeader = header.match(/torre\s*0*(\d+)/i);
  if (torreInHeader) {
    const unitTorre = normalizeTorre(torre);
    if (unitTorre !== torreInHeader[1]) return false;
  }

  const numero = unitNumberForMatch(nome);
  if (!numero) return false;

  const numeros = extractNumbersFromExplicitacaoHeader(header);
  const alvo = normalizeUnitNumber(numero);

  return numeros.some((n) => normalizeUnitNumber(n) === alvo);
}

export function resolvePosicaoFromExplicitacoes(
  explicitacoes: string[],
  nome: string,
  torre: string,
): string | null {
  for (const valor of explicitacoes) {
    const text = valor.trim();
    if (!text) continue;

    const header = text.split(/\s*-\s*/)[0] ?? text;
    if (!explicitacaoMatchesUnit(header, nome, torre)) continue;

    const posicao = extractPosicaoFromExplicitacao(text);
    if (posicao) return posicao;
  }

  return null;
}

export function collectQuadroVExplicitacoes(documento: DocumentoNbrExtraido): string[] {
  const qv = getQuadroById(documento, "qv");
  if (!qv || !("campos" in qv)) return [];

  return qv.campos
    .filter((c) => c.chave.startsWith("explicitacao_"))
    .sort((a, b) => {
      const ai = Number(a.chave.replace("explicitacao_", ""));
      const bi = Number(b.chave.replace("explicitacao_", ""));
      return ai - bi;
    })
    .map((c) => c.valor);
}

export function collectExplicitacoesFromDadosExtraidos(
  campos: Array<{ bloco: string; campo: string; valor: string | null }>,
): string[] {
  return campos
    .filter((d) => d.bloco === "qv" && d.campo.startsWith("explicitacao_"))
    .sort((a, b) => {
      const ai = Number(a.campo.replace("explicitacao_", ""));
      const bi = Number(b.campo.replace("explicitacao_", ""));
      return ai - bi;
    })
    .map((d) => d.valor ?? "")
    .filter((v) => v.trim().length > 0);
}

export function resolvePosicaoUnidadeFromDocumento(
  documento: DocumentoNbrExtraido,
  nome: string,
  torre: string,
): string | null {
  return resolvePosicaoFromExplicitacoes(collectQuadroVExplicitacoes(documento), nome, torre);
}
