import { isUnidadesSection, getSecaoStatusLabel } from "@/features/memorial/status";
import type { MemorialRecord } from "@/features/memorial/types";
import type { UnidadeRecord } from "@/features/unidades/types";
import {
  ORDEM_PAVIMENTOS,
  NOME_PAVIMENTO_DOC,
  agruparUnidadesPorTorrePavimento,
  gerarDescricaoUnidade,
} from "@/features/unidades/utils/texto-unidade";

import type { ExportTipo } from "./types";

export function buildMemorialPlainText(input: {
  empreendimentoNome: string;
  memorial: MemorialRecord;
  tipo: ExportTipo;
  unidades: UnidadeRecord[];
}): string {
  const lines: string[] = [];
  const tipoLabel = input.tipo === "revisao" ? "VERSÃO DE REVISÃO" : "VERSÃO FINAL";

  lines.push(`MEMORIAL DE INCORPORAÇÃO — ${input.empreendimentoNome.toUpperCase()}`);
  lines.push(`${tipoLabel} · v${input.memorial.versao}`);
  lines.push("—".repeat(72));
  lines.push("");

  for (const secao of input.memorial.secoes) {
    lines.push(secao.titulo.toUpperCase());
    lines.push("");

    if (input.tipo === "revisao" && secao.status !== "aprovada") {
      lines.push(`[${getSecaoStatusLabel(secao.status).toUpperCase()}]`);
      lines.push("");
    }

    if (secao.conteudo) {
      lines.push(secao.conteudo);
      lines.push("");
    }

    if (isUnidadesSection(secao.titulo) && input.unidades.length > 0) {
      const grupos = agruparUnidadesPorTorrePavimento(input.unidades);
      for (const [torre, pavs] of Object.entries(grupos)) {
        lines.push(torre.toUpperCase());
        for (const pav of ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length)) {
          lines.push(NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase());
          for (const u of pavs[pav]) {
            lines.push(gerarDescricaoUnidade(u, { nome: input.empreendimentoNome }));
            lines.push("");
          }
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
