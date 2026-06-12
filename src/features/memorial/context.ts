import { fmtArea } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";

import type { MemorialContextData } from "./types";

function formatEndereco(endereco: Record<string, unknown> | null): string {
  if (!endereco) return "—";
  const logradouro = String(endereco.logradouro ?? "");
  const numero = String(endereco.numero ?? "");
  if (logradouro && numero) return `${logradouro}, no ${numero}`;
  return logradouro || numero || "—";
}

function formatDateBr(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export async function fetchMemorialContext(empreendimentoId: number): Promise<MemorialContextData> {
  const { data: emp, error: empError } = await supabase
    .from("empreendimentos")
    .select(
      `
      nome, cidade, uf, endereco, incorporadora_id,
      incorporadoras ( razao_social, cnpj, endereco ),
      dados_tecnicos (
        area_global, torres, pavimentos, unidades, vagas,
        alvara, data_aprovacao, responsavel_tecnico, crea_cau, art_rrt
      )
    `,
    )
    .eq("id", empreendimentoId)
    .single();

  if (empError) throw empError;

  const incorporadora = emp.incorporadoras as {
    razao_social: string;
    cnpj: string | null;
    endereco: Record<string, unknown> | null;
  } | null;

  const dados =
    (emp.dados_tecnicos as {
      area_global: number | null;
      torres: number | null;
      pavimentos: number | null;
      unidades: number | null;
      vagas: number | null;
      alvara: string | null;
      data_aprovacao: string | null;
      responsavel_tecnico: string | null;
      crea_cau: string | null;
      art_rrt: string | null;
    } | null) ?? null;

  let representante = {
    nome: "—",
    cpf: "—",
    rg: "—",
    estadoCivil: "—",
  };

  const incorporadoraId = emp.incorporadora_id as number | null;

  if (incorporadoraId) {
    const { data: rep } = await supabase
      .from("representantes_legais")
      .select("nome, cpf, rg, estado_civil")
      .eq("incorporadora_id", incorporadoraId)
      .limit(1)
      .maybeSingle();

    if (rep) {
      representante = {
        nome: rep.nome,
        cpf: rep.cpf ?? "—",
        rg: rep.rg ?? "—",
        estadoCivil: rep.estado_civil ?? "—",
      };
    }
  }

  const { data: imovel } = await supabase
    .from("imoveis")
    .select(
      `
      lote_numero, lote_extenso, quadra_numero, quadra_extenso,
      loteamento, cidade, uf, area_numero, area_extenso,
      matricula_numero, cartorio,
      imovel_confrontacoes ( direcao, confrontante, medida, ordem )
    `,
    )
    .eq("empreendimento_id", empreendimentoId)
    .maybeSingle();

  const confrontacoes = (
    (imovel?.imovel_confrontacoes as Array<{
      direcao: string;
      confrontante: string | null;
      medida: string | null;
      ordem: number;
    }> | null) ?? []
  )
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => `ao ${c.direcao}: com ${c.confrontante ?? "—"}, medindo ${c.medida ?? "—"}`)
    .join("; ");

  const enderecoInc = formatEndereco(incorporadora?.endereco ?? null);
  const cidadeInc = String(incorporadora?.endereco?.cidade ?? emp.cidade ?? "—");
  const ufInc = String(incorporadora?.endereco?.uf ?? emp.uf ?? "—");

  return {
    incorporadora: {
      razaoSocial: incorporadora?.razao_social ?? "—",
      cnpj: incorporadora?.cnpj ?? "—",
      endereco: enderecoInc,
      cidade: cidadeInc,
      uf: ufInc,
      representante,
    },
    empreendimento: {
      nome: emp.nome,
      endereco: emp.endereco ?? "—",
      cidade: emp.cidade ?? "—",
      uf: emp.uf ?? "—",
      areaGlobal: dados?.area_global ? fmtArea(Number(dados.area_global)) : "—",
      torres: dados?.torres != null ? String(dados.torres) : "—",
      pavimentos: dados?.pavimentos != null ? String(dados.pavimentos) : "—",
      unidades: dados?.unidades != null ? String(dados.unidades) : "—",
      vagas: dados?.vagas != null ? String(dados.vagas) : "—",
    },
    imovel: {
      loteNumero: imovel?.lote_numero ?? "—",
      loteNumeroExtenso: imovel?.lote_extenso ?? "—",
      quadraNumero: imovel?.quadra_numero ?? "—",
      quadraNumeroExtenso: imovel?.quadra_extenso ?? "—",
      loteamento: imovel?.loteamento ?? "—",
      cidade: imovel?.cidade ?? emp.cidade ?? "—",
      uf: imovel?.uf ?? emp.uf ?? "—",
      area: imovel?.area_numero ? fmtArea(Number(imovel.area_numero)) : "—",
      areaExtenso: imovel?.area_extenso ?? "—",
      matricula: imovel?.matricula_numero ?? "—",
      cartorio: imovel?.cartorio ?? "—",
      confrontacoes: confrontacoes || "—",
    },
    aprovacao: {
      alvara: dados?.alvara ?? "—",
      data: formatDateBr(dados?.data_aprovacao ?? null),
    },
    responsavelProjeto: {
      nome: dados?.responsavel_tecnico ?? "—",
      crea: dados?.crea_cau ?? "—",
      art: dados?.art_rrt ?? "—",
    },
  };
}
