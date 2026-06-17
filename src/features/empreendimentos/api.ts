import {
  mapDocumentoToCondominioPavimentos,
  mapDocumentoToDadosExtraidos,
  mapDocumentoToEspacosComuns,
  mapDocumentoToUnidades,
  mapDocumentoToWizardInput,
  sumVagasSecao38,
} from "@/features/quadro-nbr/mapper";
import { persistQuadroFile } from "@/features/quadros-tecnicos/persist-quadro";
import { fileFromBuffer } from "@/features/quadros-tecnicos/mime";
import {
  fmtNum,
  normalizeLoteQuadraFields,
  parseBrDate,
  parseBrNumeric,
  parseCidadeUf,
  parseLoteQuadra,
} from "@/lib/format";
import { formatDateBr } from "./mappers";
import { areaMetrosQuadradosPorExtenso, matriculaPorExtenso } from "@/lib/numero-extenso";
import { supabase } from "@/lib/supabase/client";

import {
  mapRowToListItem,
  mapRowToView,
  mapSociosFromCampos,
  resolveSociosAdministradores,
  type EmpreendimentoDetailRowWithJoins,
  type EmpreendimentoRowWithJoins,
} from "./mappers";
import { DB_EMPREENDIMENTO_STATUS } from "./status";
import { persistCondominioComposicao } from "./persist-condominio";
import { backfillCondominioComposicaoFromQuadro } from "./sync-condominio-from-quadro";
import type {
  CreateEmpreendimentoFromNbrInput,
  CreateEmpreendimentoInput,
  DeleteEmpreendimentoInput,
  EmpreendimentoListItem,
  EmpreendimentoView,
  UpdateEmpreendimentoInput,
} from "./types";

const EMPREENDIMENTO_LIST_SELECT = `
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

const EMPREENDIMENTO_DETAIL_SELECT = `
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
  incorporadoras (
    id,
    razao_social,
    cnpj,
    endereco,
    representantes_legais (
      id,
      nome,
      cpf,
      rg,
      estado_civil,
      regime_comunhao,
      endereco
    )
  ),
  profiles:responsavel_profile_id ( full_name ),
  dados_tecnicos (
    unidades,
    torres,
    pavimentos,
    vagas,
    area_terreno,
    area_global,
    area_privativa_total,
    area_comum_total,
    alvara,
    data_aprovacao,
    crea_cau,
    art_rrt,
    responsavel_tecnico
  ),
  imoveis (
    lote_numero,
    lote_extenso,
    quadra_numero,
    quadra_extenso,
    loteamento,
    cidade,
    comarca,
    uf,
    estado_extenso,
    area_numero,
    area_extenso,
    benfeitorias,
    matricula_numero,
    matricula_extenso,
    cartorio,
    imovel_confrontacoes (
      direcao,
      confrontante,
      medida,
      azimute,
      ordem
    )
  ),
  pendencias (
    mensagem,
    severidade,
    status
  ),
  condominio_pavimentos (
    id,
    torre,
    nome,
    area_real,
    area_equivalente,
    ordem
  ),
  condominio_espacos_comuns (
    id,
    nome,
    ordem
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

function incorporadoraEnderecoJson(endereco: string | undefined): { texto: string } | null {
  const texto = endereco?.trim();
  return texto ? { texto } : null;
}

async function findOrCreateIncorporadora(
  organizationId: number,
  razaoSocial: string,
  cnpj: string,
  endereco?: string,
): Promise<number> {
  const normalizedCnpj = cnpj.replace(/\D/g, "");
  const enderecoJson = incorporadoraEnderecoJson(endereco);

  if (normalizedCnpj) {
    const { data: byCnpj } = await supabase
      .from("incorporadoras")
      .select("id, endereco")
      .eq("organization_id", organizationId)
      .eq("cnpj", cnpj)
      .maybeSingle();

    if (byCnpj) {
      if (enderecoJson && !byCnpj.endereco) {
        await supabase.from("incorporadoras").update({ endereco: enderecoJson }).eq("id", byCnpj.id);
      }
      return byCnpj.id;
    }
  }

  const { data: byName } = await supabase
    .from("incorporadoras")
    .select("id, endereco")
    .eq("organization_id", organizationId)
    .ilike("razao_social", razaoSocial)
    .maybeSingle();

  if (byName) {
    if (enderecoJson && !byName.endereco) {
      await supabase.from("incorporadoras").update({ endereco: enderecoJson }).eq("id", byName.id);
    }
    return byName.id;
  }

  const { data: created, error } = await supabase
    .from("incorporadoras")
    .insert({
      organization_id: organizationId,
      razao_social: razaoSocial,
      cnpj: cnpj || null,
      endereco: enderecoJson,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function fetchEmpreendimentosList(): Promise<EmpreendimentoListItem[]> {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select(EMPREENDIMENTO_LIST_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data as EmpreendimentoRowWithJoins[]).map(mapRowToListItem);
}

export async function fetchEmpreendimentoDetail(id: number): Promise<EmpreendimentoView | null> {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select(EMPREENDIMENTO_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const view = mapRowToView(data as EmpreendimentoDetailRowWithJoins);

  const { data: dadosFallback } = await supabase
    .from("dados_extraidos")
    .select("campo, valor")
    .eq("empreendimento_id", id)
    .in("campo", [
      "projeto_area_terreno",
      "incorporador_endereco",
      "projeto_lote_quadra",
      "projeto_alvara",
      "projeto_data_aprovacao",
      "rt_art",
      "cartorio_cidade",
      "projeto_cidade_uf",
      "responsavel_obra_nome",
      "responsavel_obra_crea",
      "responsavel_obra_art",
      "responsavel_obra_formacao",
    ]);

  for (const dado of dadosFallback ?? []) {
    if (dado.campo === "projeto_area_terreno" && view.areaTerreno <= 0) {
      const parsed = parseBrNumeric(dado.valor ?? "");
      if (parsed !== null && parsed > 0) {
        view.areaTerreno = parsed;
        if (view.imovel.areaNumero === "—") {
          view.imovel.areaNumero = fmtNum(parsed, 2);
        }
        if (view.imovel.areaExtenso === "—") {
          view.imovel.areaExtenso = areaMetrosQuadradosPorExtenso(parsed);
        }
      }
    }

    if (dado.campo === "incorporador_endereco") {
      const texto = dado.valor?.trim();
      if (texto) view.incorporadoraEndereco.endereco = texto;
    }

    if (dado.campo === "projeto_lote_quadra" && dado.valor?.trim()) {
      const parsed = parseLoteQuadra(dado.valor);
      const normalized = normalizeLoteQuadraFields(parsed.lote, parsed.quadra);
      view.imovel.loteNumero = normalized.lote || "—";
      view.imovel.quadraNumero = normalized.quadra || "—";
      view.imovel.loteExtenso = normalized.loteExtenso || "—";
      view.imovel.quadraExtenso = normalized.quadraExtenso || "—";
      view.lote = normalized.lote || "—";
      view.quadra = normalized.quadra || "—";
    }

    if (dado.campo === "projeto_alvara" && view.alvara === "—" && dado.valor?.trim()) {
      view.alvara = dado.valor.trim();
    }

    if (dado.campo === "projeto_data_aprovacao" && view.dataAprovacao === "—" && dado.valor?.trim()) {
      const iso = parseBrDate(dado.valor);
      view.dataAprovacao = iso ? formatDateBr(iso) : dado.valor.trim();
    }

    if (dado.campo === "rt_art" && view.art === "—" && dado.valor?.trim()) {
      view.art = dado.valor.trim();
    }

    if (dado.campo === "cartorio_cidade" && dado.valor?.trim()) {
      view.cartorioCidade = dado.valor.trim();
    }

    if (dado.campo === "projeto_cidade_uf" && dado.valor?.trim()) {
      const { cidade, uf } = parseCidadeUf(dado.valor);
      if (cidade) {
        view.cidade = cidade;
        view.imovel.cidade = cidade;
        view.imovel.comarca = cidade;
      }
      if (uf) {
        view.uf = uf;
        if (view.imovel.estado === "—") view.imovel.estado = uf;
      }
    }

    if (dado.campo === "responsavel_obra_nome" && dado.valor?.trim()) {
      view.responsabilidadeObra.engenheiro = dado.valor.trim();
    }

    if (dado.campo === "responsavel_obra_crea" && dado.valor?.trim()) {
      view.responsabilidadeObra.crea = dado.valor.trim();
    }

    if (dado.campo === "responsavel_obra_art" && dado.valor?.trim()) {
      view.responsabilidadeObra.art = dado.valor.trim();
    }

    if (dado.campo === "responsavel_obra_formacao" && dado.valor?.trim()) {
      view.responsabilidadeObra.formacao = dado.valor.trim();
    }
  }

  if (view.vagas <= 0) {
    const { data: preliminaresDados } = await supabase
      .from("dados_extraidos")
      .select("campo, valor")
      .eq("empreendimento_id", id)
      .eq("bloco", "preliminares");

    const preliminaresCampos = (preliminaresDados ?? []).map((d) => ({
      campo: d.campo,
      valor: d.valor ?? "",
    }));
    let totalVagas = sumVagasSecao38(preliminaresCampos);
    if (totalVagas <= 0) {
      totalVagas = preliminaresCampos.reduce((sum, item) => {
        if (!item.campo?.startsWith("projeto_vagas") || item.campo === "projeto_vagas_total") {
          return sum;
        }
        const v = item.valor.trim();
        return /^\d+$/.test(v) ? sum + Number(v) : sum;
      }, 0);
    }
    if (totalVagas > 0) {
      view.vagas = totalVagas;
      await supabase
        .from("dados_tecnicos")
        .update({ vagas: totalVagas })
        .eq("empreendimento_id", id);
    }
  }

  const { data: sociosDados } = await supabase
    .from("dados_extraidos")
    .select("campo, valor")
    .eq("empreendimento_id", id)
    .like("campo", "incorporador_socio_%")
    .order("campo");

  const sociosQuadro = mapSociosFromCampos(sociosDados ?? []);
  view.representantes = resolveSociosAdministradores(view.representantes, sociosQuadro);

  const rawPavimentos =
    (data as EmpreendimentoDetailRowWithJoins).condominio_pavimentos ?? [];
  const nomesPavimento = rawPavimentos.map((p) => p.nome.trim().toLowerCase());
  const precisaResyncPavimentos =
    rawPavimentos.length === 0 ||
    rawPavimentos.some((p) => p.torre?.trim()) ||
    new Set(nomesPavimento).size < nomesPavimento.length;

  if (precisaResyncPavimentos) {
    try {
      const synced = await backfillCondominioComposicaoFromQuadro(id);
      if (synced) {
        view.pavimentosAreas = synced.pavimentos;
        view.espacosComuns = synced.espacosComuns;
      }
    } catch (error) {
      console.warn("Falha ao sincronizar composição do condomínio a partir do quadro técnico:", error);
    }
  }

  return view;
}

export async function createEmpreendimentoFromWizard(
  input: CreateEmpreendimentoInput,
): Promise<number> {
  const incorporadoraId = await findOrCreateIncorporadora(
    input.organizationId,
    input.identificacao.incorporadora,
    input.identificacao.cnpj,
    input.identificacao.incorporadoraEndereco,
  );

  const totalTorres = input.torres.length;
  const maxPavimentos =
    input.torres.length > 0 ? Math.max(...input.torres.map((t) => t.pavimentos)) : null;
  const loteQuadra = normalizeLoteQuadraFields(
    input.localizacao.lote,
    input.localizacao.quadra,
  );

  const { data: empreendimento, error: empError } = await supabase
    .from("empreendimentos")
    .insert({
      organization_id: input.organizationId,
      nome: input.identificacao.nome,
      incorporadora_id: incorporadoraId,
      cidade: input.localizacao.cidade,
      uf: input.localizacao.uf,
      endereco: input.localizacao.endereco,
      lote: loteQuadra.lote || null,
      quadra: loteQuadra.quadra || null,
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
    art_rrt: input.equipe.observacoes || null,
    alvara: input.aprovacao.alvara || null,
    data_aprovacao: parseBrDate(input.aprovacao.dataAprovacao) ?? null,
  });

  if (dadosError) throw dadosError;

  const socios = [
    ...new Set(
      [
        ...input.identificacao.socios.map((s) => s.trim()),
        input.identificacao.representante.trim(),
      ].filter(Boolean),
    ),
  ];

  for (const nome of socios) {
    const { data: existente } = await supabase
      .from("representantes_legais")
      .select("id")
      .eq("incorporadora_id", incorporadoraId)
      .ilike("nome", nome)
      .maybeSingle();

    if (existente) continue;

    const { error: repError } = await supabase.from("representantes_legais").insert({
      incorporadora_id: incorporadoraId,
      nome,
    });

    if (repError) throw repError;
  }

  const areaTerreno = parseBrNumeric(input.areas.terreno);
  const matriculaNumero = input.localizacao.matricula || null;
  const { error: imovelError } = await supabase.from("imoveis").insert({
    empreendimento_id: empreendimento.id,
    lote_numero: loteQuadra.lote || null,
    lote_extenso: loteQuadra.loteExtenso || null,
    quadra_numero: loteQuadra.quadra || null,
    quadra_extenso: loteQuadra.quadraExtenso || null,
    matricula_numero: matriculaNumero,
    matricula_extenso: matriculaNumero ? matriculaPorExtenso(matriculaNumero) : null,
    cidade: input.localizacao.cidade || null,
    uf: input.localizacao.uf || null,
    area_numero: areaTerreno,
    area_extenso: areaTerreno ? areaMetrosQuadradosPorExtenso(areaTerreno) : null,
  });

  if (imovelError) throw imovelError;

  await logAudit(
    input.organizationId,
    empreendimento.id,
    "criacao",
    `Empreendimento "${input.identificacao.nome}" criado a partir do quadro técnico.`,
  );

  return empreendimento.id;
}

export async function createEmpreendimentoFromNbr(
  input: CreateEmpreendimentoFromNbrInput,
): Promise<number> {
  const wizardInput = mapDocumentoToWizardInput(
    input.documento,
    input.organizationId,
    input.profileId,
  );

  const empreendimentoId = await createEmpreendimentoFromWizard(wizardInput);

  try {
    const arquivo = fileFromBuffer(input.arquivo.buffer, input.arquivo.name, input.arquivo.type);

    const quadroRecord = await persistQuadroFile(
      {
        file: arquivo,
        fileBuffer: input.arquivo.buffer,
        empreendimentoId,
        organizationId: input.organizationId,
        profileId: input.profileId,
      },
      {
        status: "processado",
        processedAt: new Date().toISOString(),
        allowStorageFailure: true,
        auditEventType: "importacao_nbr",
        auditDescription: `Quadro CFMD "${input.arquivo.name}" vinculado na criação do empreendimento.`,
      },
    );

    const dadosExtraidos = mapDocumentoToDadosExtraidos(input.documento, {
      validadoNoWizard: true,
    });
    if (dadosExtraidos.length > 0) {
      const { error: dadosExtraidosError } = await supabase.from("dados_extraidos").insert(
        dadosExtraidos.map((d) => ({
          empreendimento_id: empreendimentoId,
          quadro_tecnico_id: quadroRecord.id,
          bloco: d.bloco,
          campo: d.campo,
          valor: d.valor,
          confianca: d.confianca,
          status: d.status,
        })),
      );

      if (dadosExtraidosError) throw dadosExtraidosError;
    }

    const unidades = mapDocumentoToUnidades(input.documento);
    if (unidades.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < unidades.length; i += BATCH_SIZE) {
        const batch = unidades.slice(i, i + BATCH_SIZE);
        const { error: unidadesError } = await supabase.from("unidades_autonomas").insert(
          batch.map((u) => ({
            empreendimento_id: empreendimentoId,
            nome: u.nome,
            torre: u.torre,
            pavimento: u.pavimento,
            tipo: u.tipo,
            area_privativa: u.areaPrivativa,
            area_comum: u.areaComum,
            area_total: u.areaTotal,
            area_garden: u.areaGarden,
            area_garagem: u.areaGaragem,
            vaga: u.vaga,
            fracao: u.fracao,
            confrontacoes: u.confrontacoes,
            observacoes: u.observacoes,
            posicao: u.posicao,
            status: "validado",
          })),
        );

        if (unidadesError) throw unidadesError;
      }
    }

    const pavimentos = mapDocumentoToCondominioPavimentos(input.documento);
    const espacosComuns = mapDocumentoToEspacosComuns(input.documento);
    await persistCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);

    await supabase
      .from("empreendimentos")
      .update({
        status: DB_EMPREENDIMENTO_STATUS.pronto_para_gerar,
        progresso: 55,
      })
      .eq("id", empreendimentoId);

    await logAudit(
      input.organizationId,
      empreendimentoId,
      "importacao_nbr",
      `Importados ${input.documento.quadros.length} quadros NBR, ${unidades.length} unidades, ${pavimentos.length} pavimentos e ${espacosComuns.length} espaços comuns de "${wizardInput.identificacao.nome}".`,
    );

    return empreendimentoId;
  } catch (error) {
    const { error: deleteError } = await supabase
      .from("empreendimentos")
      .delete()
      .eq("id", empreendimentoId);

    if (deleteError) {
      console.error("Falha ao reverter empreendimento após erro na importação NBR:", deleteError);
    }

    throw error;
  }
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

  if (input.matricula !== undefined) {
    const matriculaNumero = input.matricula.trim();
    const matriculaExtenso = matriculaNumero ? matriculaPorExtenso(matriculaNumero) : null;

    const { error: imovelError } = await supabase
      .from("imoveis")
      .update({
        matricula_numero: matriculaNumero || null,
        matricula_extenso: matriculaExtenso || null,
      })
      .eq("empreendimento_id", input.empreendimentoId);

    if (imovelError) throw imovelError;
  }

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Empreendimento #${input.empreendimentoId} atualizado.`,
  );
}

export async function deleteEmpreendimento(input: DeleteEmpreendimentoInput): Promise<void> {
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "exclusao",
    `Empreendimento "${input.nome}" excluído.`,
  );

  const { error } = await supabase
    .from("empreendimentos")
    .delete()
    .eq("id", input.empreendimentoId);

  if (error) throw error;
}
