import { getQuadroById } from "@/features/quadro-nbr/parser";
import {
  designacaoParaExibicao,
  isUnidadeDesignacaoValida,
} from "@/features/quadro-nbr/parser/sheet-utils";
import type { DocumentoNbrExtraido, LinhaResumo } from "@/features/quadro-nbr/types";
import { fmtNum } from "@/lib/format";
import { valorMonetarioPorExtenso } from "@/lib/numero-extenso";

const TIPO_LABELS: Record<string, { plural: string; sufixo: string }> = {
  Apartamento: { plural: "Apartamentos", sufixo: "cada apartamento" },
  "Apartamento Garden": { plural: "Apartamentos Garden", sufixo: "cada apartamento garden" },
  Garden: { plural: "Gardens", sufixo: "cada garden" },
  "Sala Comercial": { plural: "Salas Comerciais", sufixo: "cada sala comercial" },
  Depósito: { plural: "Depósitos", sufixo: "cada depósito" },
  Loja: { plural: "Lojas", sufixo: "cada loja" },
  Garagem: { plural: "Garagens", sufixo: "cada garagem" },
  Box: { plural: "Boxes", sufixo: "cada box" },
  Cobertura: { plural: "Coberturas", sufixo: "cada cobertura" },
  Unidade: { plural: "Unidades", sufixo: "cada unidade" },
};

function inferTipoUnidade(designacao: string): string {
  if (/apartamento\s+garden/i.test(designacao)) return "Apartamento Garden";
  if (/sala comercial/i.test(designacao)) return "Sala Comercial";
  if (/depósito|deposito/i.test(designacao)) return "Depósito";
  if (/apartamento/i.test(designacao)) return "Apartamento";
  if (/garden/i.test(designacao)) return "Garden";
  if (/loja/i.test(designacao)) return "Loja";
  if (/garagem/i.test(designacao)) return "Garagem";
  if (/^box\s/i.test(designacao)) return "Box";
  if (/cobertura/i.test(designacao)) return "Cobertura";
  return "Unidade";
}

function extractNumeroUnidade(designacao: string): string {
  const normalized = designacao.trim().replace(/\s+/g, " ");

  const patterns = [
    /^apartamento\s+garden\s+([\w./-]+)/i,
    /^apartamento\s+([\w./-]+)/i,
    /^sala\s+comercial\s+([\w./-]+)/i,
    /^dep[óo]sito\s+([\w./-]+)/i,
    /^garden\s+([\w./-]+)/i,
    /^loja\s+([\w./-]+)/i,
    /^garagem\s+([\w./-]+)/i,
    /^box\s+([\w./-]+)/i,
    /^cobertura\s+([\w./-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return match[1];
  }

  const exibicao = designacaoParaExibicao(designacao);
  const fallback = exibicao.match(/\s+([\w./-]+)$/i);
  return fallback?.[1] ?? exibicao;
}

function sortNumerosUnidade(a: string, b: string): number {
  const na = Number(a.replace(/\D/g, ""));
  const nb = Number(b.replace(/\D/g, ""));
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, "pt-BR", { numeric: true });
}

function formatListaNumeros(numeros: string[]): string {
  if (numeros.length === 0) return "";
  if (numeros.length === 1) return numeros[0];
  if (numeros.length === 2) return `${numeros[0]} e ${numeros[1]}`;
  return `${numeros.slice(0, -1).join(", ")} e ${numeros[numeros.length - 1]}`;
}

function normalizeTorreNumero(bloco: string): string {
  const t = bloco.trim();
  if (!t) return "";
  const match = t.match(/torre\s*(\d+)/i);
  if (match) return match[1].padStart(2, "0");
  if (/^\d+$/.test(t)) return t.padStart(2, "0");
  return t;
}

function formatTorres(blocos: string[]): string {
  const numeros = [...new Set(blocos.map(normalizeTorreNumero).filter(Boolean))].sort(
    (a, b) => sortNumerosUnidade(a, b),
  );
  if (!numeros.length) return "";

  if (numeros.length === 1) return `(Torre ${numeros[0]})`;

  const last = numeros[numeros.length - 1];
  const rest = numeros.slice(0, -1).join(", ");
  return `(Torre ${rest} e ${last})`;
}

function letraItem(index: number): string {
  return String.fromCharCode("a".charCodeAt(0) + index);
}

interface GrupoOrcamentoUnidade {
  tipo: string;
  valor: number;
  numeros: string[];
  blocos: Set<string>;
}

function agruparLinhasPorValor(linhas: LinhaResumo[]): GrupoOrcamentoUnidade[] {
  const mapa = new Map<string, GrupoOrcamentoUnidade>();

  for (const linha of linhas) {
    if (!isUnidadeDesignacaoValida(linha.designacao)) continue;
    if (linha.valorUnidade == null || linha.valorUnidade <= 0) continue;

    const tipo = inferTipoUnidade(linha.designacao);
    const chave = `${tipo}|${linha.valorUnidade.toFixed(2)}`;
    const grupo = mapa.get(chave) ?? {
      tipo,
      valor: linha.valorUnidade,
      numeros: [],
      blocos: new Set<string>(),
    };

    grupo.numeros.push(extractNumeroUnidade(linha.designacao));
    if (linha.bloco?.trim()) grupo.blocos.add(linha.bloco.trim());
    mapa.set(chave, grupo);
  }

  return [...mapa.values()].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo, "pt-BR");
    return a.valor - b.valor;
  });
}

function formatGrupoOrcamento(grupo: GrupoOrcamentoUnidade, index: number): string {
  const labels = TIPO_LABELS[grupo.tipo] ?? TIPO_LABELS.Unidade;
  const numeros = [...new Set(grupo.numeros)].sort(sortNumerosUnidade);
  const torres = formatTorres([...grupo.blocos]);
  const valorFmt = fmtNum(grupo.valor, 2);
  const extenso = valorMonetarioPorExtenso(grupo.valor, { capitalize: true });

  const numerosTexto = formatListaNumeros(numeros);
  const torresTexto = torres ? ` ${torres}` : "";

  return `${letraItem(index)}) ${labels.plural} ${numerosTexto}${torresTexto}: R$ ${valorFmt} (${extenso}) ${labels.sufixo};`;
}

export function buildListaOrcamentoUnidades(documento: DocumentoNbrExtraido | null): string {
  const resumo = documento ? getQuadroById(documento, "resumo") : null;
  if (!resumo?.linhas.length) return "—";

  const grupos = agruparLinhasPorValor(resumo.linhas);
  if (!grupos.length) return "—";

  return grupos.map((grupo, index) => formatGrupoOrcamento(grupo, index)).join(" ");
}
