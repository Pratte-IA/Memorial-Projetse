import { isUnidadesSection, getSecaoStatusLabel } from "@/features/memorial/status";
import type { MemorialRecord } from "@/features/memorial/types";
import type { UnidadeRecord } from "@/features/unidades/types";
import {
  ORDEM_PAVIMENTOS,
  NOME_PAVIMENTO_DOC,
  agruparUnidadesPorTorrePavimento,
  gerarDescricaoUnidade,
} from "@/features/unidades/utils/texto-unidade";

import {
  blockFromContentLine,
  blockFromPlainLine,
  blockFromSectionTitle,
  blockFromUnitDescription,
  blocksFromContent,
} from "./document-format";
import type { DocumentBlock, MemorialDocument } from "./document-types";
import type { ExportTipo } from "./types";

export function buildMemorialDocument(input: {
  empreendimentoNome: string;
  memorial: MemorialRecord;
  tipo: ExportTipo;
  unidades: UnidadeRecord[];
}): MemorialDocument {
  const blocks: DocumentBlock[] = [];
  const tipoLabel = input.tipo === "revisao" ? "VERSÃO DE REVISÃO" : "VERSÃO FINAL";

  blocks.push(
    blockFromPlainLine(`MEMORIAL DE INCORPORAÇÃO — ${input.empreendimentoNome.toUpperCase()}`, {
      bold: true,
      align: "justify",
    }),
  );
  blocks.push(
    blockFromPlainLine(`${tipoLabel} · v${input.memorial.versao}`, {
      align: "justify",
    }),
  );
  blocks.push(blockFromPlainLine("—".repeat(72), { align: "left" }));
  blocks.push(blockFromPlainLine("", { align: "left" }));

  for (const secao of input.memorial.secoes) {
    blocks.push(blockFromSectionTitle(secao.titulo));
    blocks.push(blockFromPlainLine("", { align: "left" }));

    if (input.tipo === "revisao" && secao.status !== "aprovada") {
      blocks.push(
        blockFromPlainLine(`[${getSecaoStatusLabel(secao.status).toUpperCase()}]`, {
          bold: true,
          align: "left",
        }),
      );
      blocks.push(blockFromPlainLine("", { align: "left" }));
    }

    if (secao.conteudo) {
      blocks.push(...blocksFromContent(secao.conteudo));
      blocks.push(blockFromPlainLine("", { align: "left" }));
    }

    if (isUnidadesSection(secao.titulo) && input.unidades.length > 0) {
      const grupos = agruparUnidadesPorTorrePavimento(input.unidades);
      for (const [torre, pavs] of Object.entries(grupos)) {
        blocks.push(blockFromContentLine(torre.toUpperCase()));
        for (const pav of ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length)) {
          blocks.push(blockFromContentLine(NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase()));
          for (const u of pavs[pav]) {
            blocks.push(
              blockFromUnitDescription(
                gerarDescricaoUnidade(u, { nome: input.empreendimentoNome }),
              ),
            );
            blocks.push(blockFromPlainLine("", { align: "left" }));
          }
        }
      }
    }

    blocks.push(blockFromPlainLine("", { align: "left" }));
  }

  return { blocks };
}

/** Texto simples para depuração ou compatibilidade legada. */
export function buildMemorialPlainText(input: {
  empreendimentoNome: string;
  memorial: MemorialRecord;
  tipo: ExportTipo;
  unidades: UnidadeRecord[];
}): string {
  const { blocks } = buildMemorialDocument(input);
  return (
    blocks
      .map((block) => block.runs.map((run) => run.text).join(""))
      .join("\n")
      .trim() + "\n"
  );
}
