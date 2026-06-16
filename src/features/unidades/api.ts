import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import {
  backfillUnidadesMedidasFromDocumento,
  backfillUnidadesPosicaoFromDocumento,
  backfillUnidadesVagasFromDocumento,
  loadLatestQuadroDocumento,
} from "@/features/empreendimentos/sync-unidades-vagas-from-quadro";
import {
  collectExplicitacoesFromDadosExtraidos,
  resolvePosicaoFromExplicitacoes,
} from "@/features/quadro-nbr/resolve-posicao-unidade";
import {
  loadVagaLookupForEmpreendimento,
  resolveVagaFromLookup,
} from "@/features/empreendimentos/vaga-lookup";

import { computeResumo, mapRowToUnidade } from "./mappers";
import { updateUnidadeSchema } from "./schemas";
import type { UnidadeDbStatus, UnidadeRecord, UnidadesResumo, UpdateUnidadeInput } from "./types";

function enrichUnidadesPosicao(
  unidades: UnidadeRecord[],
  explicitacoes: string[],
): UnidadeRecord[] {
  if (!explicitacoes.length) return unidades;

  return unidades.map((unidade) => {
    if (unidade.posicao.trim()) return unidade;

    const posicao = resolvePosicaoFromExplicitacoes(
      explicitacoes,
      unidade.nome,
      unidade.torre,
    );
    if (!posicao) return unidade;

    return { ...unidade, posicao };
  });
}

function enrichUnidadesFromQuadroLookup(
  unidades: UnidadeRecord[],
  lookup: Awaited<ReturnType<typeof loadVagaLookupForEmpreendimento>>,
): UnidadeRecord[] {
  return unidades.map((unidade) => {
    if (unidade.vaga !== "—") return unidade;

    const resolved = resolveVagaFromLookup(
      lookup,
      unidade.nome,
      unidade.torre,
      unidade.observacoes,
    );
    if (!resolved) return unidade;

    return {
      ...unidade,
      vaga: resolved.vaga,
      observacoes: unidade.observacoes || resolved.observacoes,
    };
  });
}

async function logAudit(
  organizationId: number,
  empreendimentoId: number,
  eventType: string,
  description: string,
  metadata?: Json,
) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null,
  });
  if (error) throw error;
}

export async function fetchUnidades(empreendimentoId: number): Promise<UnidadeRecord[]> {
  const { data, error } = await supabase
    .from("unidades_autonomas")
    .select("*")
    .eq("empreendimento_id", empreendimentoId)
    .order("torre")
    .order("pavimento")
    .order("nome");

  if (error) throw error;

  let rows = data ?? [];
  let unidades = rows.map(mapRowToUnidade);

  try {
    const lookup = await loadVagaLookupForEmpreendimento(empreendimentoId);
    if (lookup.size > 0) {
      unidades = enrichUnidadesFromQuadroLookup(unidades, lookup);
    }

    const documento = await loadLatestQuadroDocumento(empreendimentoId);
    if (documento) {
      let changed = false;

      if (unidades.some((u) => u.vaga === "—")) {
        changed =
          (await backfillUnidadesVagasFromDocumento(empreendimentoId, documento)) > 0 || changed;
      }

      changed =
        (await backfillUnidadesMedidasFromDocumento(empreendimentoId, documento)) > 0 || changed;

      changed =
        (await backfillUnidadesPosicaoFromDocumento(empreendimentoId, documento)) > 0 || changed;

      if (changed) {
        const { data: refreshed, error: refreshError } = await supabase
          .from("unidades_autonomas")
          .select("*")
          .eq("empreendimento_id", empreendimentoId)
          .order("torre")
          .order("pavimento")
          .order("nome");

        if (refreshError) throw refreshError;
        rows = refreshed ?? [];
        unidades = rows.map(mapRowToUnidade);
        if (lookup.size > 0) {
          unidades = enrichUnidadesFromQuadroLookup(unidades, lookup);
        }
      }
    }

    const { data: qvDados } = await supabase
      .from("dados_extraidos")
      .select("bloco, campo, valor")
      .eq("empreendimento_id", empreendimentoId)
      .eq("bloco", "qv")
      .like("campo", "explicitacao_%");

    const explicitacoes = collectExplicitacoesFromDadosExtraidos(qvDados ?? []);
    if (explicitacoes.length > 0) {
      unidades = enrichUnidadesPosicao(unidades, explicitacoes);
    }
  } catch (syncError) {
    console.warn("Falha ao sincronizar unidades a partir do quadro técnico:", syncError);
  }

  return unidades;
}

export async function fetchUnidadesResumo(empreendimentoId: number): Promise<UnidadesResumo> {
  const unidades = await fetchUnidades(empreendimentoId);
  return computeResumo(unidades);
}

export async function updateUnidade(input: UpdateUnidadeInput): Promise<void> {
  const parsed = updateUnidadeSchema.safeParse({
    nome: input.patch.nome,
    torre: input.patch.torre,
    pavimento: input.patch.pavimento,
    tipo: input.patch.tipo,
    vaga: input.patch.vaga,
    fracao: input.patch.fracao,
    confrontacoes: input.patch.confrontacoes,
    posicao: input.patch.posicao,
    areaPrivativa: input.patch.areaPrivativa,
    areaComum: input.patch.areaComum,
    areaTotal: input.patch.areaTotal,
    areaGarden: input.patch.areaGarden,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const v = parsed.data;

  const { error } = await supabase
    .from("unidades_autonomas")
    .update({
      nome: v.nome,
      torre: v.torre,
      pavimento: v.pavimento,
      tipo: v.tipo,
      vaga: v.vaga,
      fracao: v.fracao,
      confrontacoes: v.confrontacoes,
      posicao: v.posicao ?? null,
      area_privativa: v.areaPrivativa,
      area_comum: v.areaComum,
      area_total: v.areaTotal,
      area_garden: v.areaGarden,
    })
    .eq("id", input.id);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Unidade "${v.nome}" atualizada.`,
    { unidade_id: input.id },
  );
}

export async function updateUnidadeStatus(input: {
  ids: number[];
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  status: UnidadeDbStatus;
  descricaoAuditoria: string;
}): Promise<void> {
  if (input.ids.length === 0) return;

  const { error } = await supabase
    .from("unidades_autonomas")
    .update({ status: input.status })
    .eq("empreendimento_id", input.empreendimentoId)
    .in("id", input.ids);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "validacao",
    input.descricaoAuditoria,
    { unidade_ids: input.ids, status: input.status },
  );
}

export async function validarUnidadesEmMassa(input: {
  ids: number[];
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<number> {
  const pendentes = input.ids;
  if (pendentes.length === 0) return 0;

  await updateUnidadeStatus({
    ...input,
    ids: pendentes,
    status: "validado",
    descricaoAuditoria: `${pendentes.length} unidade(s) validada(s) em massa.`,
  });

  return pendentes.length;
}
