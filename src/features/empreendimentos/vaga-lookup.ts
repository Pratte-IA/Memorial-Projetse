import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";
import { getQuadroById } from "@/features/quadro-nbr/parser";
import {
  buildQivbVagaLookup,
  buildQivbVagaLookupFromObservacoesCampos,
  buildUnidadeVagaLookupKeys,
  extractVaga,
  lookupVagaInfo,
  mergeVagaLookups,
  type VagaQuadroInfo,
} from "@/features/quadro-nbr/extract-vaga";
import { supabase } from "@/lib/supabase/client";

import { loadLatestQuadroDocumento } from "./load-quadro-documento";

async function persistQivbObservacoesDadosExtraidos(
  empreendimentoId: number,
  documento: DocumentoNbrExtraido,
): Promise<void> {
  const qivb = getQuadroById(documento, "qivb");
  if (!qivb?.linhas.length) return;

  const { data: existentes, error: readError } = await supabase
    .from("dados_extraidos")
    .select("campo")
    .eq("empreendimento_id", empreendimentoId)
    .eq("bloco", "qivb")
    .like("campo", "observacoes__%");

  if (readError) throw readError;

  const camposExistentes = new Set((existentes ?? []).map((row) => row.campo));
  const inserts: Array<{
    empreendimento_id: number;
    bloco: string;
    campo: string;
    valor: string;
    confianca: number;
    status: string;
  }> = [];

  for (const linha of qivb.linhas) {
    const observacoes = linha.observacoes?.trim() ?? "";
    if (!observacoes) continue;

    for (const key of buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || undefined)) {
      const campo = `observacoes__${key}`;
      if (camposExistentes.has(campo)) continue;
      inserts.push({
        empreendimento_id: empreendimentoId,
        bloco: "qivb",
        campo,
        valor: observacoes,
        confianca: 96,
        status: "extraido",
      });
    }
  }

  if (inserts.length === 0) return;

  const { error: insertError } = await supabase.from("dados_extraidos").insert(inserts);
  if (insertError) throw insertError;
}

export async function loadVagaLookupForEmpreendimento(
  empreendimentoId: number,
): Promise<Map<string, VagaQuadroInfo>> {
  const { data: qivbDados, error } = await supabase
    .from("dados_extraidos")
    .select("campo, valor")
    .eq("empreendimento_id", empreendimentoId)
    .eq("bloco", "qivb")
    .like("campo", "observacoes__%");

  if (error) throw error;

  let lookup = buildQivbVagaLookupFromObservacoesCampos(qivbDados ?? []);

  try {
    const documento = await loadLatestQuadroDocumento(empreendimentoId);
    if (documento) {
      lookup = mergeVagaLookups(buildQivbVagaLookup(documento), lookup);
      try {
        await persistQivbObservacoesDadosExtraidos(empreendimentoId, documento);
      } catch (persistError) {
        console.warn("Falha ao persistir observações do Quadro IV B em dados_extraidos:", persistError);
      }
    }
  } catch (loadError) {
    console.warn("Falha ao carregar quadro técnico para lookup de vagas:", loadError);
  }

  return lookup;
}

export function resolveVagaFromLookup(
  lookup: Map<string, VagaQuadroInfo>,
  nome: string,
  torre?: string | null,
  observacoesAtual?: string | null,
): { vaga: string; observacoes: string } | null {
  const ref = lookupVagaInfo(lookup, nome, torre);
  const observacoes = ref?.observacoes?.trim() || observacoesAtual?.trim() || "";
  if (!observacoes && !ref) return null;

  const vaga = ref?.vaga?.trim() || extractVaga(observacoes);
  if (!vaga) return null;

  return { vaga, observacoes: observacoes || ref?.observacoes || "" };
}
