import { supabase } from "@/lib/supabase/client";

import type { DashboardIndicators } from "./types";

const STATUS_EM_VALIDACAO = new Set(["em_validacao", "dados_extraidos", "quadro_enviado"]);
const STATUS_MEMORIAL_GERADO = new Set(["gerado", "em_revisao", "rascunho"]);

export async function fetchDashboardIndicators(): Promise<DashboardIndicators> {
  const [empreendimentosRes, memoriaisRes] = await Promise.all([
    supabase.from("empreendimentos").select("status, pendencias_count"),
    supabase.from("memoriais").select("status"),
  ]);

  if (empreendimentosRes.error) throw empreendimentosRes.error;
  if (memoriaisRes.error) throw memoriaisRes.error;

  const empreendimentos = empreendimentosRes.data ?? [];
  const memoriais = memoriaisRes.data ?? [];

  return {
    total: empreendimentos.length,
    emValidacao: empreendimentos.filter((e) => STATUS_EM_VALIDACAO.has(e.status)).length,
    geradas: memoriais.filter((m) => STATUS_MEMORIAL_GERADO.has(m.status)).length,
    pendentes: empreendimentos.filter((e) => e.pendencias_count > 0).length,
    aprovados: empreendimentos.filter((e) => e.status === "aprovado").length,
    exportados: empreendimentos.filter((e) => e.status === "exportado").length,
  };
}
