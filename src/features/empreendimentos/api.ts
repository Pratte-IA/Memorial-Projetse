import { supabase } from "@/lib/supabase/client";

import {
  mapRowToListItem,
  mapRowToView,
  parseBrNumeric,
  type EmpreendimentoRowWithJoins,
} from "./mappers";
import { DB_EMPREENDIMENTO_STATUS } from "./status";
import type {
  CreateEmpreendimentoInput,
  EmpreendimentoListItem,
  EmpreendimentoView,
  UpdateEmpreendimentoInput,
} from "./types";

const EMPREENDIMENTO_SELECT = `
  id,
  nome,
  cidade,
  uf,
  endereco,
  lote,
  quadra,
  matricula,
  status,
  progresso,
  pendencias_count,
  updated_at,
  incorporadoras ( razao_social, cnpj ),
  profiles:responsavel_profile_id ( full_name ),
  dados_tecnicos (
    unidades,
    torres,
    pavimentos,
    vagas,
    area_terreno,
    area_global,
    alvara,
    data_aprovacao,
    crea_cau,
    art_rrt,
    responsavel_tecnico
  )
`;

async function logAudit(
  organizationId: number,
  empreendimentoId: number,
  eventType: string,
  description: string,
) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: null,
  });

  if (error) throw error;
}

async function findOrCreateIncorporadora(
  organizationId: number,
  razaoSocial: string,
  cnpj: string,
): Promise<number> {
  const normalizedCnpj = cnpj.replace(/\D/g, "");

  if (normalizedCnpj) {
    const { data: byCnpj } = await supabase
      .from("incorporadoras")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("cnpj", cnpj)
      .maybeSingle();

    if (byCnpj) return byCnpj.id;
  }

  const { data: byName } = await supabase
    .from("incorporadoras")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("razao_social", razaoSocial)
    .maybeSingle();

  if (byName) return byName.id;

  const { data: created, error } = await supabase
    .from("incorporadoras")
    .insert({
      organization_id: organizationId,
      razao_social: razaoSocial,
      cnpj: cnpj || null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function fetchEmpreendimentosList(): Promise<EmpreendimentoListItem[]> {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select(EMPREENDIMENTO_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data as EmpreendimentoRowWithJoins[]).map(mapRowToListItem);
}

export async function fetchEmpreendimentoDetail(id: number): Promise<EmpreendimentoView | null> {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select(EMPREENDIMENTO_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRowToView(data as EmpreendimentoRowWithJoins);
}

export async function createEmpreendimentoFromWizard(
  input: CreateEmpreendimentoInput,
): Promise<number> {
  const incorporadoraId = await findOrCreateIncorporadora(
    input.organizationId,
    input.identificacao.incorporadora,
    input.identificacao.cnpj,
  );

  const totalTorres = input.torres.length;
  const maxPavimentos =
    input.torres.length > 0 ? Math.max(...input.torres.map((t) => t.pavimentos)) : null;

  const { data: empreendimento, error: empError } = await supabase
    .from("empreendimentos")
    .insert({
      organization_id: input.organizationId,
      nome: input.identificacao.nome,
      incorporadora_id: incorporadoraId,
      cidade: input.localizacao.cidade,
      uf: input.localizacao.uf,
      endereco: input.localizacao.endereco,
      lote: input.localizacao.lote,
      quadra: input.localizacao.quadra,
      matricula: input.localizacao.matricula,
      responsavel_profile_id: input.profileId,
      status: DB_EMPREENDIMENTO_STATUS.dados_extraidos,
      progresso: 15,
      pendencias_count: 0,
    })
    .select("id")
    .single();

  if (empError) throw empError;

  const { error: dadosError } = await supabase.from("dados_tecnicos").insert({
    empreendimento_id: empreendimento.id,
    area_terreno: parseBrNumeric(input.areas.terreno),
    area_global: parseBrNumeric(input.areas.construida),
    area_privativa_total: parseBrNumeric(input.areas.privativa),
    area_comum_total: parseBrNumeric(input.areas.comum),
    torres: totalTorres || null,
    pavimentos: maxPavimentos,
    unidades: input.unidades.total,
    vagas: input.unidades.vagas,
    responsavel_tecnico: input.equipe.responsavel,
    crea_cau: input.equipe.creaCau || null,
  });

  if (dadosError) throw dadosError;

  await logAudit(
    input.organizationId,
    empreendimento.id,
    "criacao",
    `Empreendimento "${input.identificacao.nome}" criado a partir do quadro técnico.`,
  );

  return empreendimento.id;
}

export async function updateEmpreendimentoBasico(input: UpdateEmpreendimentoInput): Promise<void> {
  const patch = {
    ...(input.nome !== undefined ? { nome: input.nome } : {}),
    ...(input.cidade !== undefined ? { cidade: input.cidade } : {}),
    ...(input.uf !== undefined ? { uf: input.uf } : {}),
    ...(input.endereco !== undefined ? { endereco: input.endereco } : {}),
    ...(input.lote !== undefined ? { lote: input.lote } : {}),
    ...(input.quadra !== undefined ? { quadra: input.quadra } : {}),
    ...(input.matricula !== undefined ? { matricula: input.matricula } : {}),
  };

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase
    .from("empreendimentos")
    .update(patch)
    .eq("id", input.empreendimentoId);

  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Empreendimento #${input.empreendimentoId} atualizado.`,
  );
}
