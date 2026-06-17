import { fetchClausulas } from "@/features/documentos/api";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { fetchMemorialContext } from "./context";
import { ensureClausulasMemorialPadrao } from "./ensure-clausulas-padrao";
import { generateSecaoConteudo } from "./engine";
import { mapRowToMemorial } from "./mappers";
import {
  buildMemorialSecoesRows,
  syncMemorialSecoesWithClausulas,
} from "./sync-memorial-secoes";
import { isSecaoExtra, isUnidadesSection } from "./status";
import { listarRenumeracoesTitulo, montarTituloClausulaExtra } from "./titulo-clausula";
import type { MemorialRecord, SecaoDbStatus, SecaoRecord } from "./types";

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

type MemorialFetchRow = Parameters<typeof mapRowToMemorial>[0] & {
  empreendimentos: { organization_id: number } | { organization_id: number }[] | null;
};

function resolveOrganizationId(
  empreendimentos: MemorialFetchRow["empreendimentos"],
): number | null {
  if (!empreendimentos) return null;
  if (Array.isArray(empreendimentos)) {
    return empreendimentos[0]?.organization_id ?? null;
  }
  return empreendimentos.organization_id;
}

export async function fetchMemorial(empreendimentoId: number): Promise<MemorialRecord | null> {
  const { data, error } = await supabase
    .from("memoriais")
    .select(
      `
      id, empreendimento_id, versao, status,
      empreendimentos!inner ( organization_id ),
      memorial_secoes (
        id, memorial_id, clausula_id, titulo, conteudo, status, ordem, updated_at
      )
    `,
    )
    .eq("empreendimento_id", empreendimentoId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as MemorialFetchRow;
  let memorial = mapRowToMemorial(row);

  const organizationId = resolveOrganizationId(row.empreendimentos);
  if (organizationId !== null) {
    const clausulasSynced = await ensureClausulasMemorialPadrao(organizationId);
    const secoesSynced = await syncMemorialSecoesWithClausulas(memorial, organizationId);
    if (clausulasSynced || secoesSynced) {
      const refreshed = await fetchMemorialWithoutSync(empreendimentoId);
      if (refreshed) memorial = refreshed;
    }

    if (memorial.secoes.some((s) => isSecaoExtra(s))) {
      await renumerarTitulosClausulasMemorial(empreendimentoId, organizationId);
      const titulosAtualizados = await fetchMemorialWithoutSync(empreendimentoId);
      if (titulosAtualizados) memorial = titulosAtualizados;
    }
  }

  return memorial;
}

async function fetchMemorialWithoutSync(
  empreendimentoId: number,
): Promise<MemorialRecord | null> {
  const { data, error } = await supabase
    .from("memoriais")
    .select(
      `
      id, empreendimento_id, versao, status,
      memorial_secoes (
        id, memorial_id, clausula_id, titulo, conteudo, status, ordem, updated_at
      )
    `,
    )
    .eq("empreendimento_id", empreendimentoId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRowToMemorial(data as Parameters<typeof mapRowToMemorial>[0]);
}

async function createMemorialFromClausulas(input: {
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<MemorialRecord> {
  const clausulas = await fetchClausulas(input.organizationId);

  const { data: memorial, error: memError } = await supabase
    .from("memoriais")
    .insert({
      empreendimento_id: input.empreendimentoId,
      versao: 1,
      status: "rascunho",
      created_by_profile_id: input.profileId,
    })
    .select("id")
    .single();

  if (memError) throw memError;

  const secoesInsert = buildMemorialSecoesRows(memorial.id, clausulas);

  const { error: secError } = await supabase.from("memorial_secoes").insert(secoesInsert);
  if (secError) throw secError;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "criacao",
    "Memorial criado a partir do modelo padrão.",
    { memorial_id: memorial.id },
  );

  const created = await fetchMemorial(input.empreendimentoId);
  if (!created) throw new Error("Memorial não encontrado após criação.");
  return created;
}

export async function ensureMemorial(input: {
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<MemorialRecord> {
  const existing = await fetchMemorial(input.empreendimentoId);
  if (existing) return existing;
  return createMemorialFromClausulas(input);
}

export async function regenerateSecao(input: {
  secaoId: number;
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<string> {
  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) throw new Error("Memorial não encontrado.");

  const secao = memorial.secoes.find((s) => s.id === input.secaoId);
  if (!secao) throw new Error("Seção não encontrada.");
  if (isSecaoExtra(secao)) {
    throw new Error("Cláusulas extras não podem ser regeneradas a partir do modelo padrão.");
  }

  const [context, clausulas] = await Promise.all([
    fetchMemorialContext(input.empreendimentoId),
    fetchClausulas(input.organizationId),
  ]);

  const conteudo = generateSecaoConteudo(secao, clausulas, context);
  const novoStatus: SecaoDbStatus =
    secao.status === "aprovada"
      ? "aprovada"
      : isUnidadesSection(secao.titulo)
        ? "em_revisao"
        : "gerada";

  const { error } = await supabase
    .from("memorial_secoes")
    .update({ conteudo, status: novoStatus })
    .eq("id", input.secaoId);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "geracao",
    `Seção "${secao.titulo}" regenerada.`,
    { secao_id: input.secaoId, memorial_id: input.memorialId },
  );

  return conteudo;
}

export async function saveSecaoConteudo(input: {
  secaoId: number;
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  titulo: string;
  conteudo: string;
}): Promise<void> {
  const { error } = await supabase
    .from("memorial_secoes")
    .update({ conteudo: input.conteudo })
    .eq("id", input.secaoId);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Seção "${input.titulo}" editada manualmente.`,
    { secao_id: input.secaoId, memorial_id: input.memorialId },
  );
}

export async function updateSecaoStatus(input: {
  secaoId: number;
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
  titulo: string;
  status: SecaoDbStatus;
  descricaoAuditoria: string;
}): Promise<void> {
  const patch: {
    status: SecaoDbStatus;
    approved_by_profile_id?: number;
    approved_at?: string;
  } = { status: input.status };

  if (input.status === "aprovada") {
    patch.approved_by_profile_id = input.profileId;
    patch.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("memorial_secoes").update(patch).eq("id", input.secaoId);
  if (error) throw error;

  const eventType = input.status === "aprovada" ? "aprovacao" : "validacao";

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    eventType,
    input.descricaoAuditoria,
    { secao_id: input.secaoId, memorial_id: input.memorialId, status: input.status },
  );
}

export async function generateMemorialCompleto(input: {
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  profileId: number;
}): Promise<number> {
  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) throw new Error("Memorial não encontrado.");

  const [context, clausulas] = await Promise.all([
    fetchMemorialContext(input.empreendimentoId),
    fetchClausulas(input.organizationId),
  ]);

  let geradas = 0;

  for (const secao of memorial.secoes) {
    if (isSecaoExtra(secao)) continue;

    const conteudo = generateSecaoConteudo(secao, clausulas, context);
    const novoStatus: SecaoDbStatus = isUnidadesSection(secao.titulo)
      ? "em_revisao"
      : secao.status === "aprovada"
        ? "aprovada"
        : "gerada";

    const { error } = await supabase
      .from("memorial_secoes")
      .update({ conteudo, status: novoStatus })
      .eq("id", secao.id);

    if (error) throw error;
    geradas += 1;
  }

  const novaVersao = memorial.versao + 1;

  const { error: memError } = await supabase
    .from("memoriais")
    .update({ versao: novaVersao, status: "gerado" })
    .eq("id", input.memorialId);

  if (memError) throw memError;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "geracao",
    `Memorial completo gerado (versão ${novaVersao}, ${geradas} seções).`,
    { memorial_id: input.memorialId, versao: novaVersao, secoes: geradas },
  );

  return geradas;
}

async function shiftSecoesOrdem(
  secoes: Array<{ id: number; ordem: number }>,
  fromOrdem: number,
  delta: number,
): Promise<void> {
  const toShift = secoes
    .filter((s) => s.ordem >= fromOrdem)
    .sort((a, b) => (delta > 0 ? b.ordem - a.ordem : a.ordem - b.ordem));

  for (const s of toShift) {
    const { error } = await supabase
      .from("memorial_secoes")
      .update({ ordem: s.ordem + delta })
      .eq("id", s.id);
    if (error) throw error;
  }
}

async function renumerarTitulosClausulasMemorial(
  empreendimentoId: number,
  organizationId: number,
): Promise<void> {
  const memorial = await fetchMemorialWithoutSync(empreendimentoId);
  if (!memorial) return;

  const clausulas = await fetchClausulas(organizationId);
  const updates = listarRenumeracoesTitulo(memorial.secoes, clausulas);

  for (const { id, titulo } of updates) {
    const { error } = await supabase.from("memorial_secoes").update({ titulo }).eq("id", id);
    if (error) throw error;
  }
}

export async function addSecaoExtra(input: {
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  titulo: string;
  conteudo?: string;
  /** Número no sumário (1 = 01, após a Qualificação). Demais cláusulas são renumeradas. */
  numeroClausula: number;
}): Promise<number> {
  const memorial = await fetchMemorialWithoutSync(input.empreendimentoId);
  if (!memorial || memorial.id !== input.memorialId) {
    throw new Error("Memorial não encontrado.");
  }

  const tituloUsuario = input.titulo.trim();
  if (!tituloUsuario) throw new Error("Informe o título da cláusula.");

  const numero = Math.floor(input.numeroClausula);
  if (!Number.isFinite(numero) || numero < 1) {
    throw new Error("Informe um número de cláusula válido (1 ou maior).");
  }

  const maxNumero = memorial.secoes.reduce(
    (max, s) => (s.ordem > 0 ? Math.max(max, s.ordem) : max),
    0,
  );
  const novaOrdem = Math.min(numero, maxNumero + 1);

  const conteudo = input.conteudo?.trim() ?? "";

  await shiftSecoesOrdem(memorial.secoes, novaOrdem, 1);

  const titulo = montarTituloClausulaExtra(novaOrdem, tituloUsuario);
  const status: SecaoDbStatus = conteudo ? "gerada" : "nao_gerada";

  const { data, error } = await supabase
    .from("memorial_secoes")
    .insert({
      memorial_id: input.memorialId,
      clausula_id: null,
      titulo,
      conteudo: conteudo || null,
      status,
      ordem: novaOrdem,
    })
    .select("id")
    .single();

  if (error) throw error;

  await renumerarTitulosClausulasMemorial(input.empreendimentoId, input.organizationId);

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Cláusula extra "${titulo}" adicionada ao memorial.`,
    { secao_id: data.id, memorial_id: input.memorialId },
  );

  return data.id;
}

export async function deleteSecaoExtra(input: {
  secaoId: number;
  memorialId: number;
  empreendimentoId: number;
  organizationId: number;
  titulo: string;
}): Promise<void> {
  const memorial = await fetchMemorialWithoutSync(input.empreendimentoId);
  if (!memorial) throw new Error("Memorial não encontrado.");

  const secao = memorial.secoes.find((s) => s.id === input.secaoId);
  if (!secao) throw new Error("Seção não encontrada.");
  if (!isSecaoExtra(secao)) {
    throw new Error("Apenas cláusulas extras podem ser removidas desta forma.");
  }

  const ordemRemovida = secao.ordem;

  const { error } = await supabase.from("memorial_secoes").delete().eq("id", input.secaoId);
  if (error) throw error;

  if (ordemRemovida > 0) {
    const restantes = memorial.secoes.filter(
      (s) => s.id !== input.secaoId && s.ordem > ordemRemovida,
    );
    await shiftSecoesOrdem(restantes, ordemRemovida + 1, -1);
    await renumerarTitulosClausulasMemorial(input.empreendimentoId, input.organizationId);
  }

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Cláusula extra "${input.titulo}" removida do memorial.`,
    { secao_id: input.secaoId, memorial_id: input.memorialId },
  );
}

export type { SecaoRecord };
