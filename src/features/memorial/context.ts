import { fmtArea, fmtNum } from "@/lib/format";
import {
  areaMetrosQuadradosPorExtenso,
  integerToPortuguese,
  matriculaPorExtenso,
} from "@/lib/numero-extenso";
import { supabase } from "@/lib/supabase/client";

import type { MemorialContextData } from "./types";

function dash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

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

function countExtenso(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return integerToPortuguese(value);
}

function areaPair(value: number | null | undefined): { texto: string; extenso: string } {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return { texto: "—", extenso: "—" };
  }
  return {
    texto: fmtArea(value),
    extenso: areaMetrosQuadradosPorExtenso(value),
  };
}

function confrontacao(
  rows: Array<{
    direcao: string;
    confrontante: string | null;
    medida: string | null;
    azimute: string | null;
  }>,
  direcao: string,
): { confrontante: string; medida: string; azimute: string } {
  const row = rows.find((r) => r.direcao.toLowerCase() === direcao.toLowerCase());
  return {
    confrontante: dash(row?.confrontante),
    medida: dash(row?.medida),
    azimute: dash(row?.azimute),
  };
}

function valorMonetarioExtenso(valor: number): string {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);
  let texto = `${integerToPortuguese(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (centavos > 0) {
    texto += ` e ${integerToPortuguese(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  }
  return texto;
}

export async function fetchMemorialContext(empreendimentoId: number): Promise<MemorialContextData> {
  const { data: emp, error: empError } = await supabase
    .from("empreendimentos")
    .select(
      `
      nome, cidade, uf, endereco, incorporadora_id,
      incorporadoras ( razao_social, cnpj, endereco ),
      dados_tecnicos (
        area_global, area_privativa_total, area_comum_total,
        torres, pavimentos, unidades, vagas,
        alvara, data_aprovacao, responsavel_tecnico, crea_cau, art_rrt
      ),
      condominio_pavimentos ( nome, area_real, ordem ),
      condominio_espacos_comuns ( nome, ordem )
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
      area_privativa_total: number | null;
      area_comum_total: number | null;
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
    profissao: "—",
    orgaoEmissor: "—",
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
        cpf: dash(rep.cpf),
        rg: dash(rep.rg),
        estadoCivil: dash(rep.estado_civil),
        profissao: "—",
        orgaoEmissor: "—",
      };
    }
  }

  const { data: imovel } = await supabase
    .from("imoveis")
    .select(
      `
      lote_numero, lote_extenso, quadra_numero, quadra_extenso,
      loteamento, cidade, comarca, uf,
      area_numero, area_extenso,
      matricula_numero, matricula_extenso, cartorio,
      imovel_confrontacoes ( direcao, confrontante, medida, azimute, ordem )
    `,
    )
    .eq("empreendimento_id", empreendimentoId)
    .maybeSingle();

  const confrontacoesRows = (
    (imovel?.imovel_confrontacoes as Array<{
      direcao: string;
      confrontante: string | null;
      medida: string | null;
      azimute: string | null;
      ordem: number;
    }> | null) ?? []
  ).sort((a, b) => a.ordem - b.ordem);

  const noroeste = confrontacao(confrontacoesRows, "noroeste");
  const nordeste = confrontacao(confrontacoesRows, "nordeste");
  const sudeste = confrontacao(confrontacoesRows, "sudeste");
  const sudoeste = confrontacao(confrontacoesRows, "sudoeste");

  const confrontacoesTexto = confrontacoesRows
    .map((c) => {
      const az = c.azimute?.trim() ? ` e azimute ${c.azimute}` : "";
      return `ao ${c.direcao}: com ${c.confrontante ?? "—"}, medindo ${c.medida ?? "—"}${az}`;
    })
    .join("; ");

  const pavimentosRows = (
    (emp.condominio_pavimentos as Array<{
      nome: string;
      area_real: number | null;
      ordem: number;
    }> | null) ?? []
  ).sort((a, b) => a.ordem - b.ordem);

  const espacosRows = (
    (emp.condominio_espacos_comuns as Array<{ nome: string; ordem: number }> | null) ?? []
  ).sort((a, b) => a.ordem - b.ordem);

  const areasPavimentos =
    pavimentosRows.length > 0
      ? pavimentosRows
          .map((p) => {
            const area = p.area_real != null ? fmtArea(Number(p.area_real)) : "—";
            return `${p.nome}, medindo ${area}`;
          })
          .join("; ")
      : "—";

  const areasComuns =
    espacosRows.length > 0 ? espacosRows.map((e) => e.nome).join(", ") : "—";

  const { data: dadosExtraidos } = await supabase
    .from("dados_extraidos")
    .select("campo, valor")
    .eq("empreendimento_id", empreendimentoId)
    .in("campo", [
      "custo_global_construcao_13",
      "custo_unitario_obra_14",
      "responsavel_obra_nome",
      "responsavel_obra_crea",
      "responsavel_obra_art",
      "responsavel_obra_formacao",
      "orgao_aprovacao",
      "prefeitura_aprovacao",
    ]);

  const extraMap = new Map(
    (dadosExtraidos ?? []).map((row) => [row.campo, row.valor?.trim() ?? ""]),
  );

  const custoGlobalRaw = extraMap.get("custo_global_construcao_13") ?? "";
  const custoGlobalNum = custoGlobalRaw
    ? Number(custoGlobalRaw.replace(/\./g, "").replace(",", "."))
    : NaN;

  const enderecoInc = formatEndereco(incorporadora?.endereco ?? null);
  const cidadeInc = String(incorporadora?.endereco?.cidade ?? emp.cidade ?? "—");
  const ufInc = String(incorporadora?.endereco?.uf ?? emp.uf ?? "—");
  const comarca = dash(imovel?.comarca ?? imovel?.cidade ?? emp.cidade);

  const areaGlobal = areaPair(dados?.area_global != null ? Number(dados.area_global) : null);
  const areaPrivativa = areaPair(
    dados?.area_privativa_total != null ? Number(dados.area_privativa_total) : null,
  );
  const areaComum = areaPair(
    dados?.area_comum_total != null ? Number(dados.area_comum_total) : null,
  );

  const matriculaNumero = dash(imovel?.matricula_numero);
  const matriculaExtenso =
    dash(imovel?.matricula_extenso) !== "—"
      ? dash(imovel?.matricula_extenso)
      : matriculaPorExtenso(matriculaNumero) || "—";

  const torres = dados?.torres ?? null;
  const pavimentos = dados?.pavimentos ?? null;
  const unidades = dados?.unidades ?? null;
  const vagas = dados?.vagas ?? null;

  const orcamentoValor =
    Number.isFinite(custoGlobalNum) && custoGlobalNum > 0
      ? fmtNum(custoGlobalNum, 2)
      : "—";
  const orcamentoValorExtenso =
    Number.isFinite(custoGlobalNum) && custoGlobalNum > 0
      ? valorMonetarioExtenso(custoGlobalNum)
      : "—";

  return {
    incorporadora: {
      razaoSocial: dash(incorporadora?.razao_social),
      cnpj: dash(incorporadora?.cnpj),
      endereco: enderecoInc,
      cidade: cidadeInc,
      uf: ufInc,
      certidao: "Certidão Simplificada da Junta Comercial",
      representante,
    },
    empreendimento: {
      nome: emp.nome,
      endereco: dash(emp.endereco),
      cidade: dash(emp.cidade),
      uf: dash(emp.uf),
      comarca,
      areaGlobal: areaGlobal.texto,
      areaTotalEdificada: areaGlobal.texto,
      areaTotalEdificadaExtenso: areaGlobal.extenso,
      areaPrivativa: areaPrivativa.texto,
      areaPrivativaExtenso: areaPrivativa.extenso,
      areaComum: areaComum.texto,
      areaComumExtenso: areaComum.extenso,
      qtdTorres: torres != null ? String(torres) : "—",
      qtdTorresExtenso: countExtenso(torres),
      qtdPavimentos: pavimentos != null ? String(pavimentos) : "—",
      qtdPavimentosExtenso: countExtenso(pavimentos),
      qtdUnidades: unidades != null ? String(unidades) : "—",
      qtdUnidadesExtenso: countExtenso(unidades),
      qtdVagas: vagas != null ? String(vagas) : "—",
      qtdVagasExtenso: countExtenso(vagas),
      qtdEtapas: torres != null ? String(torres) : "—",
      areasComuns,
      torres: torres != null ? String(torres) : "—",
      pavimentos: pavimentos != null ? String(pavimentos) : "—",
      unidades: unidades != null ? String(unidades) : "—",
      vagas: vagas != null ? String(vagas) : "—",
    },
    imovel: {
      loteNumero: dash(imovel?.lote_numero),
      loteNumeroExtenso: dash(imovel?.lote_extenso),
      quadraNumero: dash(imovel?.quadra_numero),
      quadraNumeroExtenso: dash(imovel?.quadra_extenso),
      loteamento: dash(imovel?.loteamento),
      cidade: dash(imovel?.cidade ?? emp.cidade),
      uf: dash(imovel?.uf ?? emp.uf),
      area:
        imovel?.area_numero != null ? fmtArea(Number(imovel.area_numero)) : "—",
      areaExtenso: dash(imovel?.area_extenso),
      matricula: matriculaNumero,
      matriculaExtenso,
      cartorio: dash(imovel?.cartorio),
      confrontacoes: confrontacoesTexto || "—",
      confrontaNoroeste: noroeste.confrontante,
      medidaNoroeste: noroeste.medida,
      azimuteNoroeste: noroeste.azimute,
      confrontaNordeste: nordeste.confrontante,
      medidaNordeste: nordeste.medida,
      azimuteNordeste: nordeste.azimute,
      confrontaSudeste: sudeste.confrontante,
      medidaSudeste: sudeste.medida,
      azimuteSudeste: sudeste.azimute,
      confrontaSudoeste: sudoeste.confrontante,
      medidaSudoeste: sudoeste.medida,
      azimuteSudoeste: sudoeste.azimute,
    },
    aprovacao: {
      orgao: dash(extraMap.get("orgao_aprovacao")) !== "—"
        ? dash(extraMap.get("orgao_aprovacao"))
        : "IPC - Instituto de Planejamento de Cascavel",
      alvara: dash(dados?.alvara),
      data: formatDateBr(dados?.data_aprovacao ?? null),
      prefeitura: dash(extraMap.get("prefeitura_aprovacao")) !== "—"
        ? dash(extraMap.get("prefeitura_aprovacao"))
        : "Prefeitura Municipal de Cascavel",
    },
    responsavelProjeto: {
      nome: dash(dados?.responsavel_tecnico),
      formacao: "Engenheira Civil",
      crea: dash(dados?.crea_cau),
      art: dash(dados?.art_rrt),
    },
    responsavelObra: {
      nome: dash(extraMap.get("responsavel_obra_nome")),
      formacao: dash(extraMap.get("responsavel_obra_formacao")) !== "—"
        ? dash(extraMap.get("responsavel_obra_formacao"))
        : "Engenheiro Civil",
      crea: dash(extraMap.get("responsavel_obra_crea")),
      art: dash(extraMap.get("responsavel_obra_art")),
    },
    orcamento: {
      valor: orcamentoValor === "—" ? "R$ —" : `R$ ${orcamentoValor}`,
      valorExtenso: orcamentoValorExtenso,
      cubMultiplicador: "—",
      cubMultiplicadorExtenso: "—",
      cubValor: "—",
      cubValorExtenso: "—",
      mesReferencia: "—",
      anoReferencia: "—",
      regiaoCub: "Paraná",
    },
    areasPavimentos,
    listaUnidades: "",
  };
}
