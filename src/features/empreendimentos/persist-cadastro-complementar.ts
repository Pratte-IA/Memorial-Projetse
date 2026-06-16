import { stripLoteamentoPrefix } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { matriculaPorExtenso } from "@/lib/numero-extenso";

import type { Confrontacao, Representante, ResponsabilidadeObraForm } from "./types/detail-types";

export type CadastroImovelInput = {
  organizationId: number;
  empreendimentoId: number;
  matriculaNumero: string;
  cartorio: string;
  cartorioCidade: string;
  loteamento: string;
  confrontacoes: Confrontacao[];
};

async function upsertDadoExtraido(
  empreendimentoId: number,
  campo: string,
  valor: string,
): Promise<void> {
  const trimmed = valor.trim();
  const { data: existing } = await supabase
    .from("dados_extraidos")
    .select("id")
    .eq("empreendimento_id", empreendimentoId)
    .eq("campo", campo)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("dados_extraidos")
      .update({ valor: trimmed, status: "editado" })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  if (!trimmed) return;

  const { error } = await supabase.from("dados_extraidos").insert({
    empreendimento_id: empreendimentoId,
    bloco: "cadastro_complementar",
    campo,
    valor: trimmed,
    status: "editado",
  });
  if (error) throw error;
}

async function logAudit(
  organizationId: number,
  empreendimentoId: number,
  description: string,
): Promise<void> {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: "edicao",
    p_description: description,
    p_metadata: null,
  });
  if (error) throw error;
}

function representanteEnderecoJson(r: Representante) {
  return {
    rua: r.rua.trim() || null,
    numero: r.numero.trim() || null,
    cep: r.cep.trim() || null,
    bairro: r.bairro.trim() || null,
    cidade: r.cidade.trim() || null,
    uf: r.estado.trim() || null,
  };
}

export async function updateCadastroImovel(input: CadastroImovelInput): Promise<void> {
  const matriculaNumero = input.matriculaNumero.trim();

  const { data: existingImovel } = await supabase
    .from("imoveis")
    .select("id")
    .eq("empreendimento_id", input.empreendimentoId)
    .maybeSingle();

  const imovelPatch = {
    matricula_numero: matriculaNumero || null,
    matricula_extenso: matriculaNumero ? matriculaPorExtenso(matriculaNumero) : null,
    cartorio: input.cartorio.trim() || null,
    loteamento: stripLoteamentoPrefix(input.loteamento) || null,
  };

  let imovelId = existingImovel?.id;

  if (imovelId) {
    const { error } = await supabase.from("imoveis").update(imovelPatch).eq("id", imovelId);
    if (error) throw error;
  } else {
    const { data: created, error } = await supabase
      .from("imoveis")
      .insert({ ...imovelPatch, empreendimento_id: input.empreendimentoId })
      .select("id")
      .single();
    if (error) throw error;
    imovelId = created.id;
  }

  await supabase.from("imovel_confrontacoes").delete().eq("imovel_id", imovelId);

  const confrontacoesValidas = input.confrontacoes.filter(
    (c) => c.direcao.trim() && (c.confrontante.trim() || c.medida.trim() || c.azimute.trim()),
  );

  if (confrontacoesValidas.length > 0) {
    const { error: confError } = await supabase.from("imovel_confrontacoes").insert(
      confrontacoesValidas.map((c, ordem) => ({
        imovel_id: imovelId!,
        direcao: c.direcao.toLowerCase(),
        confrontante: c.confrontante.trim() || null,
        medida: c.medida.trim() || null,
        azimute: c.azimute.trim() || null,
        ordem,
      })),
    );
    if (confError) throw confError;
  }

  await upsertDadoExtraido(input.empreendimentoId, "cartorio_cidade", input.cartorioCidade);

  const { error: empError } = await supabase
    .from("empreendimentos")
    .update({
      matricula: matriculaNumero || null,
    })
    .eq("id", input.empreendimentoId);
  if (empError) throw empError;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "Cadastro complementar do imóvel atualizado.",
  );
}

export async function updateResponsabilidadeObra(input: {
  organizationId: number;
  empreendimentoId: number;
  responsabilidade: ResponsabilidadeObraForm;
}): Promise<void> {
  const { responsabilidade, empreendimentoId } = input;

  await upsertDadoExtraido(empreendimentoId, "responsavel_obra_nome", responsabilidade.engenheiro);
  await upsertDadoExtraido(empreendimentoId, "responsavel_obra_crea", responsabilidade.crea);
  await upsertDadoExtraido(empreendimentoId, "responsavel_obra_art", responsabilidade.art);

  if (!responsabilidade.formacao.trim()) {
    await upsertDadoExtraido(empreendimentoId, "responsavel_obra_formacao", "Engenheiro Civil");
  } else {
    await upsertDadoExtraido(
      empreendimentoId,
      "responsavel_obra_formacao",
      responsabilidade.formacao,
    );
  }

  await logAudit(
    input.organizationId,
    empreendimentoId,
    "Responsabilidade técnica da obra atualizada.",
  );
}

export async function saveRepresentanteLegal(input: {
  organizationId: number;
  empreendimentoId: number;
  incorporadoraId: number;
  representante: Representante;
}): Promise<Representante> {
  const { representante, incorporadoraId } = input;
  const payload = {
    nome: representante.nome.trim(),
    cpf: representante.cpf.trim() || null,
    rg: representante.rg.trim() || null,
    estado_civil: representante.estadoCivil || null,
    regime_comunhao:
      representante.estadoCivil === "Casado(a)" ? representante.regimeComunhao.trim() || null : null,
    endereco: representanteEnderecoJson(representante),
  };

  const isNovo = !/^\d+$/.test(representante.id);

  if (isNovo) {
    const { data, error } = await supabase
      .from("representantes_legais")
      .insert({ ...payload, incorporadora_id: incorporadoraId })
      .select("id")
      .single();
    if (error) throw error;

    await logAudit(
      input.organizationId,
      input.empreendimentoId,
      `Representante legal "${payload.nome}" cadastrado.`,
    );

    return { ...representante, id: String(data.id) };
  }

  const { error } = await supabase
    .from("representantes_legais")
    .update(payload)
    .eq("id", Number(representante.id));
  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    `Representante legal "${payload.nome}" atualizado.`,
  );

  return representante;
}

export async function deleteRepresentanteLegal(input: {
  organizationId: number;
  empreendimentoId: number;
  representanteId: string;
  nome: string;
}): Promise<void> {
  if (!/^\d+$/.test(input.representanteId)) return;

  const { error } = await supabase
    .from("representantes_legais")
    .delete()
    .eq("id", Number(input.representanteId));
  if (error) throw error;

  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    `Representante legal "${input.nome}" removido.`,
  );
}
