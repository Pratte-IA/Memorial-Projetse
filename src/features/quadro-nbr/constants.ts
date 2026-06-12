import type { QuadroId } from "./types";

export const SHEET_PRELIMINARES = "INFORMAÇÕES PRELIMINARES";

/** Padrões de nome de aba por quadro (primeiro match vence). */
export const SHEET_MATCHERS: Record<Exclude<QuadroId, "preliminares">, Array<string | RegExp>> = {
  qi: [/^QUADRO I$/i],
  qii: [/^QUADRO II$/i],
  qiii: [/^QUADRO III$/i],
  qiva: [/^QUADRO IV\s*A$/i],
  qivb: [/^QUADRO IV\s*B$/i, /^QUADRO IV\s*B[\s.]?1$/i, /^QUADRO IV B1$/i],
  qv: [/^QUADRO V$/i],
  qvi: [/^QUADRO VI$/i],
  qvii: [/^QUADRO VII$/i],
  qviii: [/^QUADRO VIII$/i],
  qcomp: [/^QUADRO COMP/i, /COMPLEMENTAR/i],
  resumo: [/^QUADRO RESUMO$/i],
};

/** @deprecated Use SHEET_MATCHERS — mantido para referência legada. */
export const SHEET_QUADRO_MAP: Record<Exclude<QuadroId, "preliminares">, string> = {
  qi: "QUADRO I",
  qii: "QUADRO II",
  qiii: "QUADRO III",
  qiva: "QUADRO IV A",
  qivb: "QUADRO IV B",
  qv: "QUADRO V",
  qvi: "QUADRO VI",
  qvii: "QUADRO VII",
  qviii: "QUADRO VIII",
  qcomp: "QUADRO COMP.",
  resumo: "QUADRO RESUMO",
};

export const QUADROS_WIZARD_STEPS: Array<{
  id: QuadroId | "upload" | "revisao";
  titulo: string;
  descricao: string;
}> = [
  {
    id: "upload",
    titulo: "Upload do quadro",
    descricao: "Envie o arquivo XLS/XLSX no padrão ABNT NBR 12.721.",
  },
  {
    id: "preliminares",
    titulo: "Informações Preliminares",
    descricao: "Valide incorporador, responsável técnico e dados do projeto.",
  },
  {
    id: "qi",
    titulo: "Quadro I",
    descricao: "Cálculo das áreas nos pavimentos (colunas 1 a 18).",
  },
  {
    id: "qii",
    titulo: "Quadro II",
    descricao: "Cálculo das áreas das unidades autônomas (colunas 19 a 38).",
  },
  {
    id: "qiii",
    titulo: "Quadro III",
    descricao: "Avaliação do custo global e unitário da construção.",
  },
  {
    id: "qiva",
    titulo: "Quadro IV A",
    descricao: "Custo de construção por unidade e re-rateio.",
  },
  {
    id: "qivb",
    titulo: "Quadro IV B",
    descricao: "Resumo das áreas reais para registro (colunas A a G ou IV B.1).",
  },
  {
    id: "qv",
    titulo: "Quadro V",
    descricao: "Informações gerais e explicitação das unidades.",
  },
  {
    id: "qvi",
    titulo: "Quadro VI",
    descricao: "Memorial descritivo dos equipamentos.",
  },
  {
    id: "qvii",
    titulo: "Quadro VII",
    descricao: "Memorial descritivo dos acabamentos (uso privativo).",
  },
  {
    id: "qviii",
    titulo: "Quadro VIII",
    descricao: "Memorial descritivo dos acabamentos (uso comum).",
  },
  {
    id: "qcomp",
    titulo: "Quadro Complementar",
    descricao: "Áreas nos pavimentos por torre (variante multi-torre).",
  },
  {
    id: "resumo",
    titulo: "Quadro Resumo",
    descricao: "Frações, valores e confrontações por unidade.",
  },
  {
    id: "revisao",
    titulo: "Revisão cruzada",
    descricao: "Confira alertas entre quadros antes de criar o empreendimento.",
  },
];

export const QUADRO_TITULOS: Record<QuadroId, string> = {
  preliminares: "Informações Preliminares",
  qi: "Quadro I — Áreas nos Pavimentos",
  qii: "Quadro II — Áreas das Unidades",
  qiii: "Quadro III — Custo Global",
  qiva: "Quadro IV A — Custo por Unidade",
  qivb: "Quadro IV B — Áreas Reais",
  qv: "Quadro V — Informações Gerais",
  qvi: "Quadro VI — Equipamentos",
  qvii: "Quadro VII — Acabamentos Privativos",
  qviii: "Quadro VIII — Acabamentos Comuns",
  qcomp: "Quadro Complementar — Áreas por Torre",
  resumo: "Quadro Resumo — Frações e Confrontações",
};

export const ACCEPTED_QUADRO_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;
