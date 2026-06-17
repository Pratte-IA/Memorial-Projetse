import {
  fmtArea,
  fmtNum,
  formatDateBr,
  normalizeLoteQuadraFields,
  parseBrNumeric,
  parseCidadeUf,
  parseLoteQuadra,
  stripLoteamentoPrefix,
  ufPorExtenso,
} from "@/lib/format";
import {
  areaMetrosQuadradosPorExtenso,
  integerToPortuguese,
  matriculaPorExtenso,
  valorMonetarioPorExtenso,
} from "@/lib/numero-extenso";
import { formatConfrontacoesTexto } from "@/features/empreendimentos/constants/cadastro-complementar";
import {
  mapRepresentante,
  mapSociosFromCampos,
  resolveIncorporadoraEnderecoMemorial,
  resolveSociosAdministradores,
} from "@/features/empreendimentos/mappers";
import { loadLatestQuadroDocumento } from "@/features/empreendimentos/load-quadro-documento";
import { aggregateCondominioPavimentos } from "@/features/quadro-nbr/mapper";
import { supabase } from "@/lib/supabase/client";

import { buildListaOrcamentoUnidades } from "./orcamento-lista";
import type { MemorialContextData } from "./types";

function dash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
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

function formatMoeda(valor: number): { texto: string; extenso: string } {
  return {
    texto: `R$ ${fmtNum(valor, 2)}`,
    extenso: valorMonetarioPorExtenso(valor),
  };
}

function parseExtraNumero(raw: string | undefined): number {
  const parsed = parseBrNumeric(raw ?? "");
  return parsed ?? NaN;
}

function comarcaLabel(...candidates: Array<string | null | undefined>): string {
  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (trimmed) return trimmed.toUpperCase();
  }
  return "—";
}

function formatMesReferenciaCub(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split("/");
  if (parts[0] && !/^\d+$/.test(parts[0])) {
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  return parts.join("/");
}

export async function fetchMemorialContext(empreendimentoId: number): Promise<MemorialContextData> {
  const { data: emp, error: empError } = await supabase
    .from("empreendimentos")
    .select(
      `
      nome, cidade, uf, endereco, lote, quadra, incorporadora_id,
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

  const incorporadoraId = emp.incorporadora_id as number | null;

  const [{ data: sociosDados }, { data: repRows }] = await Promise.all([
    supabase
      .from("dados_extraidos")
      .select("campo, valor")
      .eq("empreendimento_id", empreendimentoId)
      .like("campo", "incorporador_socio_%")
      .order("campo"),
    incorporadoraId
      ? supabase
          .from("representantes_legais")
          .select("id, nome, cpf, rg, estado_civil, regime_comunhao, endereco")
          .eq("incorporadora_id", incorporadoraId)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const sociosQuadro = mapSociosFromCampos(sociosDados ?? []);
  const repsFromDb = (repRows ?? []).map((row) =>
    mapRepresentante({
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      rg: row.rg,
      estado_civil: row.estado_civil,
      regime_comunhao: row.regime_comunhao,
      endereco: row.endereco as Record<string, unknown> | null,
    }),
  );

  const socios = resolveSociosAdministradores(repsFromDb, sociosQuadro);
  const socioPrincipal = socios[0];
  const representante = {
    nome: dash(socioPrincipal?.nome),
    cpf: dash(socioPrincipal?.cpf),
    rg: dash(socioPrincipal?.rg),
    estadoCivil: dash(socioPrincipal?.estadoCivil),
    profissao: "—",
    orgaoEmissor: "—",
  };

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

  const confrontacoesTexto = formatConfrontacoesTexto(
    confrontacoesRows.map((c) => ({
      direcao: c.direcao,
      confrontante: c.confrontante ?? "",
      medida: c.medida ?? "",
      azimute: c.azimute ?? "",
    })),
  );

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

  const pavimentosConsolidados = aggregateCondominioPavimentos(
    pavimentosRows.map((p) => ({
      nome: p.nome,
      areaReal: p.area_real != null ? Number(p.area_real) : null,
      ordem: p.ordem,
    })),
  );

  const areasPavimentos =
    pavimentosConsolidados.length > 0
      ? pavimentosConsolidados
          .map((p) => {
            const area = p.areaReal != null && p.areaReal > 0 ? fmtArea(p.areaReal) : "—";
            return `${p.nome}, medindo ${area}`;
          })
          .join("; ")
      : "—";

  const areasComuns =
    espacosRows.length > 0 ? espacosRows.map((e) => e.nome).join(", ") : "—";

  const [{ data: dadosExtraidos }, documentoQuadro] = await Promise.all([
    supabase
      .from("dados_extraidos")
      .select("campo, valor")
      .eq("empreendimento_id", empreendimentoId)
      .in("campo", [
        "incorporador_endereco",
        "projeto_lote_quadra",
        "custo_global_construcao_13",
        "custo_unitario_obra_14",
        "designacao_padrao",
        "padrao_acabamento",
        "sindicato_cub",
        "cub_mes",
        "responsavel_obra_nome",
        "responsavel_obra_crea",
        "responsavel_obra_art",
        "responsavel_obra_formacao",
        "orgao_aprovacao",
        "prefeitura_aprovacao",
        "cartorio_cidade",
        "projeto_cidade_uf",
      ]),
    loadLatestQuadroDocumento(empreendimentoId),
  ]);

  const extraMap = new Map(
    (dadosExtraidos ?? []).map((row) => [row.campo, row.valor?.trim() ?? ""]),
  );

  const custoGlobalNum = parseExtraNumero(extraMap.get("custo_global_construcao_13"));
  const custoMetroNum = parseExtraNumero(extraMap.get("custo_unitario_obra_14"));

  const enderecoIncorporadora = resolveIncorporadoraEnderecoMemorial(
    incorporadora?.endereco ?? null,
    extraMap.get("incorporador_endereco"),
    emp.cidade,
    emp.uf,
  );
  const empRow = emp as { lote?: string | null; quadra?: string | null };
  const loteQuadraRaw = extraMap.get("projeto_lote_quadra");
  const loteQuadra = loteQuadraRaw
    ? (() => {
        const parsed = parseLoteQuadra(loteQuadraRaw);
        return normalizeLoteQuadraFields(parsed.lote, parsed.quadra);
      })()
    : normalizeLoteQuadraFields(
        imovel?.lote_numero ?? empRow.lote ?? "",
        imovel?.quadra_numero ?? empRow.quadra ?? "",
      );

  const projetoCidadeUf = parseCidadeUf(extraMap.get("projeto_cidade_uf") ?? "");
  const cartorioCidadeUf = parseCidadeUf(extraMap.get("cartorio_cidade") ?? "");
  const comarcaImovel = comarcaLabel(
    projetoCidadeUf.cidade,
    imovel?.comarca,
    imovel?.cidade,
    emp.cidade,
  );
  const comarcaEmpreendimento = comarcaLabel(
    cartorioCidadeUf.cidade,
    projetoCidadeUf.cidade,
    imovel?.comarca,
    emp.cidade,
  );
  const ufSigla = (
    projetoCidadeUf.uf ||
    imovel?.uf ||
    emp.uf ||
    cartorioCidadeUf.uf ||
    ""
  )
    .trim()
    .toUpperCase();
  const ufExtenso = ufPorExtenso(ufSigla) || "—";
  const cidadeImovel = dash(
    projetoCidadeUf.cidade || imovel?.cidade || emp.cidade,
  );

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

  const cartorioBase = dash(imovel?.cartorio);
  const cartorioCidadeRaw = extraMap.get("cartorio_cidade")?.trim();
  const cartorioCidade = cartorioCidadeRaw ? cartorioCidadeRaw.toUpperCase() : "—";
  const ufCartorio = ufSigla || "—";
  const cartorioTexto =
    cartorioBase !== "—" && cartorioCidade !== "—"
      ? `${cartorioBase} da cidade e comarca de ${cartorioCidade}${ufCartorio !== "—" ? `/${ufCartorio}` : ""}`
      : cartorioBase;

  const torres = dados?.torres ?? null;
  const pavimentos = dados?.pavimentos ?? null;
  const unidades = dados?.unidades ?? null;
  const vagas = dados?.vagas ?? null;

  const orcamentoGlobal =
    Number.isFinite(custoGlobalNum) && custoGlobalNum > 0
      ? formatMoeda(custoGlobalNum)
      : { texto: "R$ —", extenso: "—" };
  const orcamentoMetro =
    Number.isFinite(custoMetroNum) && custoMetroNum > 0
      ? formatMoeda(custoMetroNum)
      : { texto: "R$ —", extenso: "—" };
  const listaOrcamentoUnidades = buildListaOrcamentoUnidades(documentoQuadro);

  return {
    incorporadora: {
      razaoSocial: dash(incorporadora?.razao_social),
      cnpj: dash(incorporadora?.cnpj),
      endereco: enderecoIncorporadora.endereco,
      cidade: enderecoIncorporadora.cidade,
      uf: enderecoIncorporadora.uf,
      certidao: "Certidão Simplificada da Junta Comercial",
      representante,
    },
    empreendimento: {
      nome: emp.nome,
      endereco: dash(emp.endereco),
      cidade: dash(emp.cidade),
      uf: dash(emp.uf),
      comarca: comarcaEmpreendimento,
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
      qtdEtapas: countExtenso(torres),
      areasComuns,
      torres: torres != null ? String(torres) : "—",
      pavimentos: pavimentos != null ? String(pavimentos) : "—",
      unidades: unidades != null ? String(unidades) : "—",
      vagas: vagas != null ? String(vagas) : "—",
    },
    imovel: {
      loteNumero: loteQuadra.lote || "—",
      loteNumeroExtenso: loteQuadra.loteExtenso || "—",
      quadraNumero: loteQuadra.quadra || "—",
      quadraNumeroExtenso: loteQuadra.quadraExtenso || "—",
      loteamento: (() => {
        const nome = imovel?.loteamento?.trim();
        if (!nome) return "—";
        return stripLoteamentoPrefix(nome) || "—";
      })(),
      comarca: comarcaImovel,
      cidade: cidadeImovel,
      uf: ufSigla || "—",
      ufExtenso,
      area:
        imovel?.area_numero != null ? fmtArea(Number(imovel.area_numero)) : "—",
      areaExtenso: dash(imovel?.area_extenso),
      matricula: matriculaNumero,
      matriculaExtenso,
      cartorio: cartorioTexto,
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
      formacao: "Engenheiro(a) Civil",
      crea: dash(dados?.crea_cau),
      art: dash(dados?.art_rrt),
    },
    responsavelObra: {
      nome: dash(extraMap.get("responsavel_obra_nome")),
      formacao: dash(extraMap.get("responsavel_obra_formacao")) !== "—"
        ? dash(extraMap.get("responsavel_obra_formacao"))
        : "Engenheiro(a) Civil",
      crea: dash(extraMap.get("responsavel_obra_crea")),
      art: dash(extraMap.get("responsavel_obra_art")),
    },
    orcamento: {
      valor: orcamentoGlobal.texto,
      valorExtenso: orcamentoGlobal.extenso,
      cubDesignacao: dash(extraMap.get("designacao_padrao")),
      padraoAcabamento: dash(extraMap.get("padrao_acabamento")),
      mesReferenciaCub: formatMesReferenciaCub(extraMap.get("cub_mes")),
      sindicatoCub: dash(extraMap.get("sindicato_cub")),
      custoMetroQuadrado: orcamentoMetro.texto,
      custoMetroQuadradoExtenso: orcamentoMetro.extenso,
    },
    areasPavimentos,
    listaUnidades: "",
    listaOrcamentoUnidades,
  };
}
