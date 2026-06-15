import type { DocumentoNbrExtraido } from "./types";
import { getQuadroById } from "./parser";

export interface VagaQuadroInfo {
  observacoes: string;
  vaga: string;
}

/** Extrai identificador de vaga do campo observações do Quadro IV B / B.1. */
export function extractVaga(observacoes: string): string {
  const text = observacoes.trim().replace(/\s+/g, " ");
  if (!text) return "";

  const direitoUsoCompacto = text.match(
    /direito\s+de\s+uso\s+de\s+(\d+)\s+vaga\s+([\w-]+)/i,
  );
  if (direitoUsoCompacto) {
    return `${direitoUsoCompacto[1]} Vaga ${direitoUsoCompacto[2]}`;
  }

  const direitoUso = text.match(
    /direito\s+de\s+uso\s+(?:de\s+)?(?:(?:\d+|0?\d+)\s+)?(?:\(\s*\w+\s*\)\s*)?(?:(\d+)\s+)?vaga\s+(.+?)(?:[.;,]|$)/i,
  );
  if (direitoUso) {
    const quantidade = direitoUso[1]?.trim();
    const tipo = direitoUso[2]?.trim();
    if (quantidade && tipo) return `${quantidade} Vaga ${tipo}`;
    if (tipo) return tipo;
  }

  const patterns: RegExp[] = [
    /vaga\s+aut[oô]noma\s*n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+(?:de\s+)?garagem\s*(?:descoberta\s*)?n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+([\w./-]+)/i,
    /\b(V-\d+)\b/i,
    /\b(G-\d+)\b/i,
    /\b(B-\d+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  if (/^(V|G|B)-\d+$/i.test(text)) return text;

  if (/vaga/i.test(text)) {
    const trecho = text.match(/vaga\s+(.+?)(?:[.;,]|$)/i);
    if (trecho?.[1]?.trim()) return trecho[1].trim();
  }

  return "";
}

export function normalizeDesignacao(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeTorre(torre: string): string {
  const text = torre.trim().replace(/\s+/g, " ").toLowerCase();
  const semPrefixo = text.replace(/^torre\s*/i, "").replace(/^bloco\s*/i, "");
  const numero = semPrefixo.match(/^0*(\d+)$/);
  if (numero) return numero[1];
  return semPrefixo || text;
}

function stripApartamentoPrefix(designacao: string): string {
  return designacao.replace(/^apartamento\s+/i, "").trim();
}

function extractTipoPrefix(designacao: string): string {
  if (/garden/i.test(designacao)) return "garden";
  if (/apartamento/i.test(designacao)) return "apartamento";
  if (/cobertura/i.test(designacao)) return "cobertura";
  return "";
}

function extractDesignacaoNumero(designacao: string): string | null {
  const trimmed = designacao.trim();
  if (/^vaga\s/i.test(trimmed)) return null;

  const match = trimmed.match(/(\d[\d./-]*)$/);
  return match?.[1] ?? null;
}

function numeroLookupVariants(numero: string): string[] {
  const bare = numero.replace(/^0+/, "") || "0";
  const padded = bare.padStart(2, "0");
  return [...new Set([numero, bare, padded])];
}

export function buildUnidadeVagaLookupKeys(designacao: string, torre?: string): string[] {
  const keys = new Set<string>();
  const normalized = normalizeDesignacao(designacao);
  const semApartamento = normalizeDesignacao(stripApartamentoPrefix(designacao));

  keys.add(normalized);
  if (semApartamento !== normalized) keys.add(semApartamento);

  const numero = extractDesignacaoNumero(designacao);
  const tipo = extractTipoPrefix(designacao);

  if (numero) {
    for (const variant of numeroLookupVariants(numero)) {
      keys.add(`num:${variant}`);
      if (tipo) keys.add(`num:${tipo}:${variant}`);
    }
  }

  if (torre) {
    const torreKey = normalizeTorre(torre);
    keys.add(`torre:${torreKey}:${normalized}`);
    if (semApartamento !== normalized) keys.add(`torre:${torreKey}:${semApartamento}`);
    if (numero && tipo) {
      for (const variant of numeroLookupVariants(numero)) {
        keys.add(`torre:${torreKey}:num:${tipo}:${variant}`);
      }
    }
  }

  return [...keys];
}

function registerLookupKeys(
  lookup: Map<string, VagaQuadroInfo>,
  keys: string[],
  entry: VagaQuadroInfo,
): void {
  for (const key of keys) {
    lookup.set(key, entry);
  }
}

/** Índice de vagas/observações a partir das linhas do Quadro IV B ou B.1. */
export function buildQivbVagaLookup(
  documento: DocumentoNbrExtraido,
): Map<string, VagaQuadroInfo> {
  const qivb = getQuadroById(documento, "qivb");
  const lookup = new Map<string, VagaQuadroInfo>();

  for (const linha of qivb?.linhas ?? []) {
    const observacoes = linha.observacoes?.trim() ?? "";
    if (!observacoes) continue;

    const vaga = extractVaga(observacoes);
    const entry: VagaQuadroInfo = { observacoes, vaga };

    registerLookupKeys(
      lookup,
      buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || undefined),
      entry,
    );
  }

  return lookup;
}

/** Busca vaga/observações do Quadro IV B ou B.1 para uma unidade cadastrada. */
export function lookupVagaInfo(
  lookup: Map<string, VagaQuadroInfo>,
  unidadeNome: string,
  torre?: string | null,
): VagaQuadroInfo | undefined {
  const torreNorm = torre && torre !== "—" ? torre : undefined;

  for (const key of buildUnidadeVagaLookupKeys(unidadeNome, torreNorm)) {
    const hit = lookup.get(key);
    if (hit) return hit;
  }

  if (/garden/i.test(unidadeNome)) {
    const numero = extractDesignacaoNumero(unidadeNome);
    if (numero) {
      for (const variant of numeroLookupVariants(numero)) {
        const gardenKey = torreNorm
          ? `torre:${normalizeTorre(torreNorm)}:num:garden:${variant}`
          : `num:garden:${variant}`;
        const hit = lookup.get(gardenKey);
        if (hit) return hit;
      }
    }
  }

  return undefined;
}

export function buildQivbVagaLookupFromObservacoesCampos(
  campos: Array<{ campo: string; valor: string | null }>,
): Map<string, VagaQuadroInfo> {
  const lookup = new Map<string, VagaQuadroInfo>();
  const prefix = "observacoes__";

  for (const { campo, valor } of campos) {
    if (!campo.startsWith(prefix)) continue;
    const observacoes = valor?.trim() ?? "";
    if (!observacoes) continue;

    const key = campo.slice(prefix.length);
    const entry: VagaQuadroInfo = {
      observacoes,
      vaga: extractVaga(observacoes),
    };
    lookup.set(key, entry);
  }

  return lookup;
}

export function mergeVagaLookups(
  primary: Map<string, VagaQuadroInfo>,
  secondary: Map<string, VagaQuadroInfo>,
): Map<string, VagaQuadroInfo> {
  const merged = new Map(primary);
  for (const [key, value] of secondary) {
    if (!merged.has(key)) merged.set(key, value);
  }
  return merged;
}
