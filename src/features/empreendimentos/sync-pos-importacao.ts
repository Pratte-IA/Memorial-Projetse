import { supabase } from "@/lib/supabase/client";

import { DB_EMPREENDIMENTO_STATUS } from "./status";

/**
 * Empreendimentos importados pelo wizard NBR já passaram pela validação quadro a quadro.
 * Este sync corrige registros legados (unidades nao_revisado, campos extraido).
 */
export async function ensureValidacaoPosImportacao(empreendimentoId: number): Promise<void> {
  const { data: quadro, error: quadroError } = await supabase
    .from("quadros_tecnicos")
    .select("id, status")
    .eq("empreendimento_id", empreendimentoId)
    .eq("status", "processado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (quadroError) throw quadroError;
  if (!quadro) return;

  const now = new Date().toISOString();

  await supabase
    .from("unidades_autonomas")
    .update({ status: "validado", updated_at: now })
    .eq("empreendimento_id", empreendimentoId)
    .eq("status", "nao_revisado");

  await supabase
    .from("dados_extraidos")
    .update({
      status: "confirmado",
      reviewed_at: now,
    })
    .eq("empreendimento_id", empreendimentoId)
    .in("status", ["extraido", "pendente", "baixa_confianca"]);

  await supabase
    .from("empreendimentos")
    .update({
      status: DB_EMPREENDIMENTO_STATUS.pronto_para_gerar,
      progresso: 55,
    })
    .eq("id", empreendimentoId)
    .in("status", [
      DB_EMPREENDIMENTO_STATUS.dados_extraidos,
      DB_EMPREENDIMENTO_STATUS.em_validacao,
      DB_EMPREENDIMENTO_STATUS.quadro_enviado,
    ]);
}
