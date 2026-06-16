import {
  mapDocumentoToCondominioPavimentos,
  mapDocumentoToDadosExtraidos,
  mapDocumentoToEspacosComuns,
  mapDocumentoToUnidades,
  mapDocumentoToWizardInput,
} from "@/features/quadro-nbr/mapper";
import type { DocumentoNbrExtraido } from "@/features/quadro-nbr/types";
import { parseBrDate, parseBrNumeric } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";

import { persistCondominioComposicao } from "./persist-condominio";

async function fetchLatestQuadroTecnicoId(empreendimentoId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("quadros_tecnicos")
    .select("id")
    .eq("empreendimento_id", empreendimentoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function persistDocumentoEdits(input: {
  empreendimentoId: number;
  documento: DocumentoNbrExtraido;
  organizationId: number;
  profileId: number;
}): Promise<void> {
  const { empreendimentoId, documento, organizationId, profileId } = input;
  const now = new Date().toISOString();
  const quadroTecnicoId = await fetchLatestQuadroTecnicoId(empreendimentoId);

  const wizard = mapDocumentoToWizardInput(documento, organizationId, profileId);

  await supabase
    .from("dados_tecnicos")
    .update({
      area_terreno: parseBrNumeric(wizard.areas.terreno),
      area_global: parseBrNumeric(wizard.areas.construida),
      area_privativa_total: parseBrNumeric(wizard.areas.privativa),
      area_comum_total: parseBrNumeric(wizard.areas.comum),
      torres: wizard.torres.length || null,
      pavimentos:
        wizard.torres.length > 0 ? Math.max(...wizard.torres.map((t) => t.pavimentos)) : null,
      unidades: wizard.unidades.total,
      vagas: wizard.unidades.vagas,
      alvara: wizard.aprovacao.alvara || null,
      data_aprovacao: parseBrDate(wizard.aprovacao.dataAprovacao) ?? null,
      responsavel_tecnico: wizard.equipe.responsavel || null,
      crea_cau: wizard.equipe.creaCau || null,
      art_rrt: wizard.equipe.observacoes || null,
    })
    .eq("empreendimento_id", empreendimentoId)
    .then(({ error }) => {
      if (error) throw error;
    });

  const dadosExtraidos = mapDocumentoToDadosExtraidos(documento, { validadoNoWizard: true });

  await supabase.from("dados_extraidos").delete().eq("empreendimento_id", empreendimentoId);

  if (dadosExtraidos.length > 0) {
    const { error } = await supabase.from("dados_extraidos").insert(
      dadosExtraidos.map((d) => ({
        empreendimento_id: empreendimentoId,
        quadro_tecnico_id: quadroTecnicoId,
        bloco: d.bloco,
        campo: d.campo,
        valor: d.valor,
        confianca: d.confianca,
        status: "confirmado",
        reviewed_at: now,
        reviewed_by_profile_id: profileId,
      })),
    );
    if (error) throw error;
  }

  const unidadesPayload = mapDocumentoToUnidades(documento);
  const { data: unidadesExistentes, error: unidadesError } = await supabase
    .from("unidades_autonomas")
    .select("id, nome, torre")
    .eq("empreendimento_id", empreendimentoId);

  if (unidadesError) throw unidadesError;

  const byKey = new Map<string, number>(
    (unidadesExistentes ?? []).map((u) => [`${u.nome}::${u.torre ?? ""}`, u.id]),
  );

  for (const unidade of unidadesPayload) {
    const key = `${unidade.nome}::${unidade.torre}`;
    const patch = {
      nome: unidade.nome,
      torre: unidade.torre,
      pavimento: unidade.pavimento,
      tipo: unidade.tipo,
      area_privativa: unidade.areaPrivativa,
      area_comum: unidade.areaComum,
      area_total: unidade.areaTotal,
      area_garden: unidade.areaGarden,
      area_garagem: unidade.areaGaragem,
      vaga: unidade.vaga,
      fracao: unidade.fracao,
      confrontacoes: unidade.confrontacoes,
      observacoes: unidade.observacoes,
      posicao: unidade.posicao,
      status: "validado" as const,
      updated_at: now,
    };

    const existenteId = byKey.get(key);
    if (existenteId) {
      const { error } = await supabase
        .from("unidades_autonomas")
        .update(patch)
        .eq("id", existenteId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("unidades_autonomas").insert({
        empreendimento_id: empreendimentoId,
        ...patch,
      });
      if (error) throw error;
    }
  }

  const pavimentos = mapDocumentoToCondominioPavimentos(documento);
  const espacosComuns = mapDocumentoToEspacosComuns(documento);
  await persistCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);

  await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: "edicao",
    p_description: "Quadros NBR editados na aba Dados validados.",
    p_metadata: { origem: "dados_validados_tab" },
  });
}
