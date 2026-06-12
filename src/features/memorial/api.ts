import { fetchClausulas } from "@/features/documentos/api";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { fetchMemorialContext } from "./context";
import { generateSecaoConteudo } from "./engine";
import { mapRowToMemorial } from "./mappers";
import { isUnidadesSection } from "./status";
import type { MemorialRecord, SecaoDbStatus, SecaoRecord } from "./types";

const UNIDADES_TITULO = "Sexta – Da Descrição das Unidades Autônomas";

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

export async function fetchMemorial(empreendimentoId: number): Promise<MemorialRecord | null> {
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

  const secoesInsert = [
    ...clausulas
      .filter((c) => c.status === "publicada")
      .map((c) => ({
        memorial_id: memorial.id,
        clausula_id: c.id,
        titulo: c.titulo,
        conteudo: null,
        status: "nao_gerada" as const,
        ordem: c.ordem,
      })),
    {
      memorial_id: memorial.id,
      clausula_id: null,
      titulo: UNIDADES_TITULO,
      conteudo: null,
      status: "nao_gerada" as const,
      ordem: 6,
    },
  ];

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

export type { SecaoRecord };
