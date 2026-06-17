import {
  getSecaoStatusLabel,
  isQualificacaoSection,
  isUnidadesSection,
} from "@/features/memorial/status";
import type { MemorialRecord } from "@/features/memorial/types";
import type { UnidadeRecord } from "@/features/unidades/types";
import {
  ORDEM_PAVIMENTOS,
  NOME_PAVIMENTO_DOC,
  agruparUnidadesPorTorrePavimento,
  gerarDescricaoUnidade,
} from "@/features/unidades/utils/texto-unidade";

import { buildMemorialTituloPadrao } from "./constants";
import {
  blockFromContentLine,
  blockFromPlainLine,
  blockFromSectionTitle,
  blockFromUnitDescription,
  blocksFromContent,
} from "./document-format";
import type { DocumentBlock, MemorialDocument } from "./document-types";
import type { MadridBoldContext } from "./memorial-bold";
import type { ExportTipo } from "./types";

export function buildMemorialDocument(input: {
  empreendimentoNome: string;
  memorial: MemorialRecord;
  tipo: ExportTipo;
  unidades: UnidadeRecord[];
  madridBold?: MadridBoldContext;
}): MemorialDocument {
  const formatOptions = {
    madridBold: input.madridBold,
  };
  const blocks: DocumentBlock[] = [];

  blocks.push(
    blockFromPlainLine(buildMemorialTituloPadrao(input.empreendimentoNome), {
      bold: true,
      align: "justify",
    }),
  );
  blocks.push(blockFromPlainLine("", { align: "left" }));

  for (const secao of input.memorial.secoes) {
    if (!isQualificacaoSection(secao)) {
      blocks.push(blockFromSectionTitle(secao.titulo));
      blocks.push(blockFromPlainLine("", { align: "left" }));
    }

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
      blocks.push(...blocksFromContent(secao.conteudo, formatOptions));
      blocks.push(blockFromPlainLine("", { align: "left" }));
    }

    if (isUnidadesSection(secao.titulo) && input.unidades.length > 0) {
      const grupos = agruparUnidadesPorTorrePavimento(input.unidades);
      for (const [torre, pavs] of Object.entries(grupos)) {
        blocks.push(blockFromContentLine(torre.toUpperCase(), formatOptions));
        for (const pav of ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length)) {
          blocks.push(blockFromContentLine(NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase(), formatOptions));
          for (const u of pavs[pav]) {
            blocks.push(
              blockFromUnitDescription(
                gerarDescricaoUnidade(u, { nome: input.empreendimentoNome }),
                formatOptions,
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
