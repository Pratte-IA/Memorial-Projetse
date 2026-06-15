import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";
import { removeQuadroTecnico } from "@/features/quadros-tecnicos/api";
import { fileFromBuffer } from "@/features/quadros-tecnicos/mime";
import { persistQuadroFile } from "@/features/quadros-tecnicos/persist-quadro";
import type { QuadroTecnicoRecord } from "@/features/quadros-tecnicos/types";

import { persistDocumentoEdits } from "./persist-documento-edits";
import type { ArquivoQuadroImportado } from "./types";

export async function replaceEmpreendimentoQuadro(input: {
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  documento: DocumentoNbrExtraido;
  arquivo: ArquivoQuadroImportado;
  quadroAtual: QuadroTecnicoRecord | null;
}): Promise<void> {
  if (input.quadroAtual) {
    await removeQuadroTecnico(input.quadroAtual, input.organizationId);
  }

  const file = fileFromBuffer(input.arquivo.buffer, input.arquivo.name, input.arquivo.type);

  await persistQuadroFile(
    {
      file,
      fileBuffer: input.arquivo.buffer,
      empreendimentoId: input.empreendimentoId,
      organizationId: input.organizationId,
      profileId: input.profileId,
    },
    {
      status: "processado",
      processedAt: new Date().toISOString(),
      allowStorageFailure: true,
      auditEventType: "substituicao_quadro",
      auditDescription: `Quadro CFMD "${input.arquivo.name}" substituiu o arquivo anterior.`,
    },
  );

  await persistDocumentoEdits({
    empreendimentoId: input.empreendimentoId,
    documento: input.documento,
    organizationId: input.organizationId,
    profileId: input.profileId,
  });
}
