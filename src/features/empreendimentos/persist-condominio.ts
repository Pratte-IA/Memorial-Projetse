import { supabase } from "@/lib/supabase/client";

import type {
  CondominioEspacoComumInsertPayload,
  CondominioPavimentoInsertPayload,
} from "@/features/quadro-nbr/mapper";

export async function persistCondominioComposicao(
  empreendimentoId: number,
  pavimentos: CondominioPavimentoInsertPayload[],
  espacosComuns: CondominioEspacoComumInsertPayload[],
): Promise<void> {
  const { error: deletePavError } = await supabase
    .from("condominio_pavimentos")
    .delete()
    .eq("empreendimento_id", empreendimentoId);

  if (deletePavError) throw deletePavError;

  const { error: deleteEspError } = await supabase
    .from("condominio_espacos_comuns")
    .delete()
    .eq("empreendimento_id", empreendimentoId);

  if (deleteEspError) throw deleteEspError;

  if (pavimentos.length > 0) {
    const { error } = await supabase.from("condominio_pavimentos").insert(
      pavimentos.map((p) => ({
        empreendimento_id: empreendimentoId,
        torre: p.torre,
        nome: p.nome,
        area_real: p.areaReal,
        area_equivalente: p.areaEquivalente,
        ordem: p.ordem,
        fonte_quadro: p.fonteQuadro,
      })),
    );

    if (error) throw error;
  }

  if (espacosComuns.length > 0) {
    const { error } = await supabase.from("condominio_espacos_comuns").insert(
      espacosComuns.map((e) => ({
        empreendimento_id: empreendimentoId,
        nome: e.nome,
        ordem: e.ordem,
        fonte_quadro: e.fonteQuadro,
      })),
    );

    if (error) throw error;
  }
}
