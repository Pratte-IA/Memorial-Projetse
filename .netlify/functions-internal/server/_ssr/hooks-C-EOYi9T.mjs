import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as supabase, N as QUADROS_TECNICOS_BUCKET, w as fmtArea, v as matriculaPorExtenso, f as fmtNum, L as areaMetrosQuadradosPorExtenso, M as integerToPortuguese, O as buildQivbVagaLookupFromObservacoesCampos, P as mergeVagaLookups, T as buildQivbVagaLookup, r as resolveQuadroContentType, p as parseQuadroNbrFile, W as extractVaga, B as getQuadroById, U as buildUnidadeVagaLookupKeys, V as lookupVagaInfo, Z as createEmpreendimentoFromNbr, _ as updateEmpreendimentoBasico, $ as deleteEmpreendimento, Y as fetchEmpreendimentosList, K as fetchEmpreendimentoDetail, X as DB_EMPREENDIMENTO_STATUS } from "./router-B3TCsBUu.mjs";
import { a as fetchClausulas } from "./api-DHVf6FlI.mjs";
import { i as isUnidadesSection, b as getMemorialStatusLabel, c as getUnidadeStatusLabel, g as getSecaoStatusLabel } from "./status-BduXORC_.mjs";
const BLOCO_TITULOS = {
  empreendimento: "Empreendimento",
  incorporadora: "Incorporadora",
  areas: "Áreas",
  aprovacao: "Aprovação",
  preliminares: "Informações Preliminares",
  qi: "Quadro I",
  qii: "Quadro II",
  qiii: "Quadro III",
  qiva: "Quadro IV A",
  qivb: "Quadro IV B",
  qv: "Quadro V",
  qvi: "Quadro VI",
  qvii: "Quadro VII",
  qviii: "Quadro VIII",
  qcomp: "Quadro Complementar",
  resumo: "Quadro Resumo"
};
const BLOCOS_ORDEM = [
  "preliminares",
  "qi",
  "qii",
  "qiii",
  "qiva",
  "qivb",
  "qv",
  "qvi",
  "qvii",
  "qviii",
  "qcomp",
  "resumo",
  "empreendimento",
  "incorporadora",
  "areas",
  "aprovacao"
];
function getBlocoTitulo(bloco) {
  return BLOCO_TITULOS[bloco] ?? bloco;
}
function isCampoConfirmado(status) {
  return status === "confirmado";
}
function buildSeedFieldsFromEmpreendimento(emp) {
  const areaPrivativa = fmtNum(emp.areaTerreno * 0.65, 2);
  const areaComum = fmtNum(emp.areaTerreno * 0.35, 2);
  return [
    {
      bloco: "empreendimento",
      campo: "nome",
      label: "Nome",
      valor: emp.nome,
      confianca: 96,
      status: "confirmado"
    },
    {
      bloco: "empreendimento",
      campo: "endereco",
      label: "Endereço",
      valor: emp.endereco,
      confianca: 94,
      status: "confirmado"
    },
    {
      bloco: "empreendimento",
      campo: "cidade_uf",
      label: "Cidade/UF",
      valor: `${emp.cidade}/${emp.uf}`,
      confianca: 95,
      status: "confirmado"
    },
    {
      bloco: "empreendimento",
      campo: "matricula",
      label: "Matrícula",
      valor: emp.matricula,
      confianca: 88,
      status: "extraido"
    },
    {
      bloco: "incorporadora",
      campo: "razao_social",
      label: "Razão social",
      valor: emp.incorporadora,
      confianca: 97,
      status: "confirmado"
    },
    {
      bloco: "incorporadora",
      campo: "cnpj",
      label: "CNPJ",
      valor: emp.cnpj,
      confianca: 86,
      status: "extraido"
    },
    {
      bloco: "areas",
      campo: "area_terreno",
      label: "Área do terreno",
      valor: `${fmtNum(emp.areaTerreno, 2)} m²`,
      confianca: 93,
      status: "confirmado"
    },
    {
      bloco: "areas",
      campo: "area_global",
      label: "Área global",
      valor: `${fmtNum(emp.areaGlobal, 2)} m²`,
      confianca: 91,
      status: "confirmado"
    },
    {
      bloco: "areas",
      campo: "area_privativa_total",
      label: "Área privativa total",
      valor: `${areaPrivativa} m²`,
      confianca: 62,
      status: "baixa_confianca"
    },
    {
      bloco: "areas",
      campo: "area_comum_total",
      label: "Área comum total",
      valor: `${areaComum} m²`,
      confianca: 84,
      status: "extraido"
    },
    {
      bloco: "aprovacao",
      campo: "alvara",
      label: "Alvará",
      valor: emp.alvara,
      confianca: 71,
      status: "baixa_confianca"
    },
    {
      bloco: "aprovacao",
      campo: "data_aprovacao",
      label: "Data de aprovação",
      valor: emp.dataAprovacao,
      confianca: 85,
      status: "extraido"
    },
    {
      bloco: "aprovacao",
      campo: "responsavel_tecnico",
      label: "Responsável técnico",
      valor: emp.responsavel,
      confianca: 96,
      status: "confirmado"
    },
    {
      bloco: "aprovacao",
      campo: "crea",
      label: "CREA",
      valor: emp.crea,
      confianca: 94,
      status: "confirmado"
    }
  ];
}
function mapRow$1(row) {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    quadroTecnicoId: row.quadro_tecnico_id,
    bloco: row.bloco,
    campo: row.campo,
    valor: row.valor ?? "",
    confianca: row.confianca,
    status: row.status,
    reviewedAt: row.reviewed_at,
    reviewedByProfileId: row.reviewed_by_profile_id
  };
}
function groupIntoView(records) {
  const blocoMap = /* @__PURE__ */ new Map();
  for (const record of records) {
    const list = blocoMap.get(record.bloco) ?? [];
    list.push(record);
    blocoMap.set(record.bloco, list);
  }
  const blocos = BLOCOS_ORDEM.filter((b) => blocoMap.has(b)).map((bloco) => ({
    bloco,
    titulo: getBlocoTitulo(bloco),
    campos: blocoMap.get(bloco) ?? []
  }));
  const totalCampos = records.length;
  const camposConfirmados = records.filter((r) => r.status === "confirmado").length;
  const progressoValidacao = totalCampos > 0 ? Math.round(camposConfirmados / totalCampos * 100) : 0;
  return { blocos, progressoValidacao, totalCampos, camposConfirmados };
}
async function fetchDadosExtraidos(empreendimentoId) {
  const { data, error } = await supabase.from("dados_extraidos").select("*").eq("empreendimento_id", empreendimentoId).order("bloco").order("campo");
  if (error) throw error;
  return groupIntoView(data.map(mapRow$1));
}
async function seedDadosExtraidos(input) {
  const fields = buildSeedFieldsFromEmpreendimento(input.emp);
  await supabase.from("dados_extraidos").delete().eq("empreendimento_id", input.empreendimentoId).eq("quadro_tecnico_id", input.quadroTecnicoId);
  const { error } = await supabase.from("dados_extraidos").insert(
    fields.map((f) => ({
      empreendimento_id: input.empreendimentoId,
      quadro_tecnico_id: input.quadroTecnicoId,
      bloco: f.bloco,
      campo: f.campo,
      valor: f.valor,
      confianca: f.confianca,
      status: f.status
    }))
  );
  if (error) throw error;
}
async function fetchLatestQuadroProcessadoId(empreendimentoId) {
  const { data, error } = await supabase.from("quadros_tecnicos").select("id, status").eq("empreendimento_id", empreendimentoId).eq("status", "processado").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
async function ensureDadosExtraidosSeeded(empreendimentoId) {
  const { count, error: countError } = await supabase.from("dados_extraidos").select("id", { count: "exact", head: true }).eq("empreendimento_id", empreendimentoId);
  if (countError) throw countError;
  if ((count ?? 0) > 0) return;
  const quadroId = await fetchLatestQuadroProcessadoId(empreendimentoId);
  if (!quadroId) return;
  const emp = await fetchEmpreendimentoDetail(empreendimentoId);
  if (!emp) return;
  await seedDadosExtraidos({
    empreendimentoId,
    quadroTecnicoId: quadroId,
    emp
  });
}
function dash(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}
function formatEndereco(endereco) {
  if (!endereco) return "—";
  const logradouro = String(endereco.logradouro ?? "");
  const numero = String(endereco.numero ?? "");
  if (logradouro && numero) return `${logradouro}, no ${numero}`;
  return logradouro || numero || "—";
}
function formatDateBr(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}
function countExtenso(value) {
  if (value == null || !Number.isFinite(value)) return "—";
  return integerToPortuguese(value);
}
function areaPair(value) {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return { texto: "—", extenso: "—" };
  }
  return {
    texto: fmtArea(value),
    extenso: areaMetrosQuadradosPorExtenso(value)
  };
}
function confrontacao(rows, direcao) {
  const row = rows.find((r) => r.direcao.toLowerCase() === direcao.toLowerCase());
  return {
    confrontante: dash(row?.confrontante),
    medida: dash(row?.medida),
    azimute: dash(row?.azimute)
  };
}
function valorMonetarioExtenso(valor) {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);
  let texto = `${integerToPortuguese(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (centavos > 0) {
    texto += ` e ${integerToPortuguese(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  }
  return texto;
}
async function fetchMemorialContext(empreendimentoId) {
  const { data: emp, error: empError } = await supabase.from("empreendimentos").select(
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
    `
  ).eq("id", empreendimentoId).single();
  if (empError) throw empError;
  const incorporadora = emp.incorporadoras;
  const dados = emp.dados_tecnicos ?? null;
  let representante = {
    nome: "—",
    cpf: "—",
    rg: "—",
    estadoCivil: "—",
    profissao: "—",
    orgaoEmissor: "—"
  };
  const incorporadoraId = emp.incorporadora_id;
  if (incorporadoraId) {
    const { data: rep } = await supabase.from("representantes_legais").select("nome, cpf, rg, estado_civil").eq("incorporadora_id", incorporadoraId).limit(1).maybeSingle();
    if (rep) {
      representante = {
        nome: rep.nome,
        cpf: dash(rep.cpf),
        rg: dash(rep.rg),
        estadoCivil: dash(rep.estado_civil),
        profissao: "—",
        orgaoEmissor: "—"
      };
    }
  }
  const { data: imovel } = await supabase.from("imoveis").select(
    `
      lote_numero, lote_extenso, quadra_numero, quadra_extenso,
      loteamento, cidade, comarca, uf,
      area_numero, area_extenso,
      matricula_numero, matricula_extenso, cartorio,
      imovel_confrontacoes ( direcao, confrontante, medida, azimute, ordem )
    `
  ).eq("empreendimento_id", empreendimentoId).maybeSingle();
  const confrontacoesRows = (imovel?.imovel_confrontacoes ?? []).sort((a, b) => a.ordem - b.ordem);
  const noroeste = confrontacao(confrontacoesRows, "noroeste");
  const nordeste = confrontacao(confrontacoesRows, "nordeste");
  const sudeste = confrontacao(confrontacoesRows, "sudeste");
  const sudoeste = confrontacao(confrontacoesRows, "sudoeste");
  const confrontacoesTexto = confrontacoesRows.map((c) => {
    const az = c.azimute?.trim() ? ` e azimute ${c.azimute}` : "";
    return `ao ${c.direcao}: com ${c.confrontante ?? "—"}, medindo ${c.medida ?? "—"}${az}`;
  }).join("; ");
  const pavimentosRows = (emp.condominio_pavimentos ?? []).sort((a, b) => a.ordem - b.ordem);
  const espacosRows = (emp.condominio_espacos_comuns ?? []).sort((a, b) => a.ordem - b.ordem);
  const areasPavimentos = pavimentosRows.length > 0 ? pavimentosRows.map((p) => {
    const area = p.area_real != null ? fmtArea(Number(p.area_real)) : "—";
    return `${p.nome}, medindo ${area}`;
  }).join("; ") : "—";
  const areasComuns = espacosRows.length > 0 ? espacosRows.map((e) => e.nome).join(", ") : "—";
  const { data: dadosExtraidos } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", empreendimentoId).in("campo", [
    "custo_global_construcao_13",
    "custo_unitario_obra_14",
    "responsavel_obra_nome",
    "responsavel_obra_crea",
    "responsavel_obra_art",
    "responsavel_obra_formacao",
    "orgao_aprovacao",
    "prefeitura_aprovacao"
  ]);
  const extraMap = new Map(
    (dadosExtraidos ?? []).map((row) => [row.campo, row.valor?.trim() ?? ""])
  );
  const custoGlobalRaw = extraMap.get("custo_global_construcao_13") ?? "";
  const custoGlobalNum = custoGlobalRaw ? Number(custoGlobalRaw.replace(/\./g, "").replace(",", ".")) : NaN;
  const enderecoInc = formatEndereco(incorporadora?.endereco ?? null);
  const cidadeInc = String(incorporadora?.endereco?.cidade ?? emp.cidade ?? "—");
  const ufInc = String(incorporadora?.endereco?.uf ?? emp.uf ?? "—");
  const comarca = dash(imovel?.comarca ?? imovel?.cidade ?? emp.cidade);
  const areaGlobal = areaPair(dados?.area_global != null ? Number(dados.area_global) : null);
  const areaPrivativa = areaPair(
    dados?.area_privativa_total != null ? Number(dados.area_privativa_total) : null
  );
  const areaComum = areaPair(
    dados?.area_comum_total != null ? Number(dados.area_comum_total) : null
  );
  const matriculaNumero = dash(imovel?.matricula_numero);
  const matriculaExtenso = dash(imovel?.matricula_extenso) !== "—" ? dash(imovel?.matricula_extenso) : matriculaPorExtenso(matriculaNumero) || "—";
  const torres = dados?.torres ?? null;
  const pavimentos = dados?.pavimentos ?? null;
  const unidades = dados?.unidades ?? null;
  const vagas = dados?.vagas ?? null;
  const orcamentoValor = Number.isFinite(custoGlobalNum) && custoGlobalNum > 0 ? fmtNum(custoGlobalNum, 2) : "—";
  const orcamentoValorExtenso = Number.isFinite(custoGlobalNum) && custoGlobalNum > 0 ? valorMonetarioExtenso(custoGlobalNum) : "—";
  return {
    incorporadora: {
      razaoSocial: dash(incorporadora?.razao_social),
      cnpj: dash(incorporadora?.cnpj),
      endereco: enderecoInc,
      cidade: cidadeInc,
      uf: ufInc,
      certidao: "Certidão Simplificada da Junta Comercial",
      representante
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
      vagas: vagas != null ? String(vagas) : "—"
    },
    imovel: {
      loteNumero: dash(imovel?.lote_numero),
      loteNumeroExtenso: dash(imovel?.lote_extenso),
      quadraNumero: dash(imovel?.quadra_numero),
      quadraNumeroExtenso: dash(imovel?.quadra_extenso),
      loteamento: dash(imovel?.loteamento),
      cidade: dash(imovel?.cidade ?? emp.cidade),
      uf: dash(imovel?.uf ?? emp.uf),
      area: imovel?.area_numero != null ? fmtArea(Number(imovel.area_numero)) : "—",
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
      azimuteSudoeste: sudoeste.azimute
    },
    aprovacao: {
      orgao: dash(extraMap.get("orgao_aprovacao")) !== "—" ? dash(extraMap.get("orgao_aprovacao")) : "IPC - Instituto de Planejamento de Cascavel",
      alvara: dash(dados?.alvara),
      data: formatDateBr(dados?.data_aprovacao ?? null),
      prefeitura: dash(extraMap.get("prefeitura_aprovacao")) !== "—" ? dash(extraMap.get("prefeitura_aprovacao")) : "Prefeitura Municipal de Cascavel"
    },
    responsavelProjeto: {
      nome: dash(dados?.responsavel_tecnico),
      formacao: "Engenheira Civil",
      crea: dash(dados?.crea_cau),
      art: dash(dados?.art_rrt)
    },
    responsavelObra: {
      nome: dash(extraMap.get("responsavel_obra_nome")),
      formacao: dash(extraMap.get("responsavel_obra_formacao")) !== "—" ? dash(extraMap.get("responsavel_obra_formacao")) : "Engenheiro Civil",
      crea: dash(extraMap.get("responsavel_obra_crea")),
      art: dash(extraMap.get("responsavel_obra_art"))
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
      regiaoCub: "Paraná"
    },
    areasPavimentos,
    listaUnidades: ""
  };
}
function gerarUnidades() {
  const lista = [];
  const torres = ["Torre 01", "Torre 02", "Torre 03"];
  let idx = 0;
  torres.forEach((torre, ti) => {
    for (let g = 1; g <= 4; g++) {
      idx++;
      lista.push({
        id: `u-${idx}`,
        nome: `Apartamento Garden 0${g}`,
        torre,
        pavimento: "Térreo",
        tipo: "Garden",
        areaPrivativa: 43.3,
        areaComum: 8.593,
        areaTotal: 51.893,
        garden: 12.5,
        vaga: `V-${String(idx).padStart(3, "0")}`,
        fracao: "1,667%",
        status: g === 1 ? "Validado" : g === 2 ? "Pendente" : "Não revisado",
        confrontacoes: "Norte: hall social. Sul: jardim. Leste: ap. vizinho. Oeste: fachada."
      });
    }
    for (let p = 1; p <= 4; p++) {
      for (let a = 1; a <= 4; a++) {
        idx++;
        const num = `${p}0${a}`;
        lista.push({
          id: `u-${idx}`,
          nome: `Apartamento ${num}`,
          torre,
          pavimento: `${p}º Pavimento`,
          tipo: "Tipo",
          areaPrivativa: 43.3,
          areaComum: 8.593,
          areaTotal: 51.893,
          garden: 0,
          vaga: `V-${String(idx).padStart(3, "0")}`,
          fracao: "1,667%",
          status: ti === 0 && p === 1 ? "Inconsistência" : idx % 5 === 0 ? "Pendente" : "Validado",
          confrontacoes: "Norte: corredor de circulação. Sul: fachada. Leste: ap. vizinho. Oeste: poço de ventilação."
        });
      }
    }
  });
  return lista;
}
gerarUnidades();
const clausulas = [
  {
    id: "c1",
    ordem: 0,
    titulo: "Qualificação da Incorporadora",
    categoria: "Incorporação",
    resumo: "Bloco padrão de qualificação jurídica da SPE incorporadora.",
    status: "Publicada",
    variaveis: [
      "incorporadora.razaoSocial",
      "incorporadora.endereco",
      "incorporadora.cidade",
      "incorporadora.uf",
      "incorporadora.cnpj",
      "incorporadora.representante.nome",
      "incorporadora.representante.estadoCivil",
      "incorporadora.representante.profissao",
      "incorporadora.representante.rg",
      "incorporadora.representante.orgaoEmissor",
      "incorporadora.representante.cpf",
      "incorporadora.certidao",
      "empreendimento.nome"
    ],
    template: "{{incorporadora.razaoSocial}}, sociedade de propósito específico, com sede {{incorporadora.endereco}}, na cidade de {{incorporadora.cidade}}/{{incorporadora.uf}}, inscrita no CNPJ/MF sob o nº {{incorporadora.cnpj}}, representada por seu sócio administrador: {{incorporadora.representante.nome}}, brasileiro, {{incorporadora.representante.estadoCivil}}, {{incorporadora.representante.profissao}}, portador da Cédula de Identidade RG nº {{incorporadora.representante.rg}} {{incorporadora.representante.orgaoEmissor}} e inscrito no CPF/MF sob nº {{incorporadora.representante.cpf}}; conforme {{incorporadora.certidao}} em anexo; na qualidade de Incorporadora, convenciona este Instrumento Particular de Memorial de Incorporação, Convenção Condominial, Memorial Descritivo do Empreendimento e Regimento Interno do {{empreendimento.nome}}, mediante as cláusulas a seguir."
  },
  {
    id: "c2",
    ordem: 1,
    titulo: "Primeira – Da Propriedade e Localização do Imóvel",
    categoria: "Propriedade e Localização",
    resumo: "Qualificação do imóvel confrontas, matrícula, área e cartório de registro.",
    status: "Publicada",
    variaveis: [
      "imovel.loteNumero",
      "imovel.loteNumeroExtenso",
      "imovel.area",
      "imovel.areaExtenso",
      "imovel.quadraNumero",
      "imovel.quadraNumeroExtenso",
      "imovel.loteamento",
      "imovel.cidade",
      "imovel.uf",
      "imovel.confrontaNoroeste",
      "imovel.medidaNoroeste",
      "imovel.azimuteNoroeste",
      "imovel.confrontaNordeste",
      "imovel.medidaNordeste",
      "imovel.azimuteNordeste",
      "imovel.confrontaSudeste",
      "imovel.medidaSudeste",
      "imovel.azimuteSudeste",
      "imovel.confrontaSudoeste",
      "imovel.medidaSudoeste",
      "imovel.azimuteSudoeste",
      "imovel.matricula",
      "imovel.matriculaExtenso",
      "imovel.cartorio"
    ],
    template: "A Incorporadora é proprietária, livre de ônus e de ações reais ou pessoais reipersecutórias, o que declara sob as penas da Lei, do imóvel constituído pelo Lote nº {{imovel.loteNumero}} ({{imovel.loteNumeroExtenso}}), com área de {{imovel.area}} ({{imovel.areaExtenso}}), da Quadra nº {{imovel.quadraNumero}} ({{imovel.quadraNumeroExtenso}}), do Loteamento {{imovel.loteamento}}, situado nesta Cidade e Comarca de {{imovel.cidade}}, Estado do {{imovel.uf}}, sem benfeitorias, que confronta-se, ao noroeste: com {{imovel.confrontaNoroeste}}, medindo {{imovel.medidaNoroeste}} e azimute {{imovel.azimuteNoroeste}}; ao nordeste: com {{imovel.confrontaNordeste}}, medindo {{imovel.medidaNordeste}} e azimute {{imovel.azimuteNordeste}}; ao sudeste: com {{imovel.confrontaSudeste}}, medindo {{imovel.medidaSudeste}} e azimute {{imovel.azimuteSudeste}}; ao sudoeste: com {{imovel.confrontaSudoeste}}, medindo {{imovel.medidaSudoeste}} e azimute {{imovel.azimuteSudoeste}}. Atualmente registrado na matrícula {{imovel.matricula}} ({{imovel.matriculaExtenso}}), do {{imovel.cartorio}}."
  },
  {
    id: "c3",
    ordem: 2,
    titulo: "Segunda – Da Incorporação Imobiliária",
    categoria: "Incorporação",
    resumo: "Declaração de incorporação nos termos da Lei 4.591/64 e do Código Civil.",
    status: "Publicada",
    variaveis: ["empreendimento.nome"],
    template: "Que, pretendendo ela Incorporadora alienar frações do descrito terreno, representativas de unidades autônomas de edificações a serem erigidas sobre o mesmo imóvel, promove à incorporação imobiliária de tais edificações, para a ordenação jurídica da Lei nº 4.591, de 16 de dezembro de 1964, e todas as suas regulamentações e alterações posteriores, e do art. 1.331 e seguintes, da Lei nº 10.406 (Código Civil), de 10 de janeiro de 2002 (com vigência a partir de 11 de janeiro de 2003), e com a instituição de Condomínio Urbano Simples nos termos da Lei nº 13.465/17 e do Decreto Federal nº 9.310/18, na forma de condomínio edilício ou por unidades autônomas, sob a denominação de {{empreendimento.nome}}."
  },
  {
    id: "c4",
    ordem: 3,
    titulo: "Terceira – Da Composição do Condomínio",
    categoria: "Composição do Condomínio",
    resumo: "Define áreas global, privativa, comum, torres, pavimentos e unidades.",
    status: "Publicada",
    variaveis: [
      "empreendimento.areaTotalEdificada",
      "empreendimento.areaTotalEdificadaExtenso",
      "empreendimento.qtdTorres",
      "empreendimento.qtdTorresExtenso",
      "empreendimento.qtdPavimentos",
      "empreendimento.qtdPavimentosExtenso",
      "areasPavimentos",
      "empreendimento.areaPrivativa",
      "empreendimento.areaPrivativaExtenso",
      "empreendimento.qtdUnidades",
      "empreendimento.qtdUnidadesExtenso",
      "empreendimento.qtdVagas",
      "empreendimento.qtdVagasExtenso",
      "empreendimento.areaComum",
      "empreendimento.areaComumExtenso",
      "empreendimento.areasComuns"
    ],
    template: "O Condomínio com área total a ser edificada de {{empreendimento.areaTotalEdificada}} ({{empreendimento.areaTotalEdificadaExtenso}}), será constituído de {{empreendimento.qtdTorres}} ({{empreendimento.qtdTorresExtenso}}) torres, divididas em {{empreendimento.qtdPavimentos}} ({{empreendimento.qtdPavimentosExtenso}}) pavimentos cada, e uma área comum, a saber: {{areasPavimentos}}. A composição do condomínio será a seguinte: a) Partes de propriedade exclusiva (áreas privativas de {{empreendimento.areaPrivativa}} ({{empreendimento.areaPrivativaExtenso}})): às quais serão {{empreendimento.qtdUnidades}} ({{empreendimento.qtdUnidadesExtenso}}) apartamentos e {{empreendimento.qtdVagas}} ({{empreendimento.qtdVagasExtenso}}) vagas de garagem descobertas, acessórias às unidades autônomas; b) Partes de propriedade comum (áreas de uso comum de {{empreendimento.areaComum}} ({{empreendimento.areaComumExtenso}})): que serão: {{empreendimento.areasComuns}}. Tudo conforme alocado no referido projeto arquitetônico."
  },
  {
    id: "c5",
    ordem: 4,
    titulo: "Quarta – Da Aprovação do Projeto Arquitetônico",
    categoria: "Aprovação de Projeto",
    resumo: "Cita alvará municipal, data, responsável técnico, CREA/CAU e ART/RRT.",
    status: "Publicada",
    variaveis: [
      "aprovacao.orgao",
      "aprovacao.data",
      "aprovacao.alvara",
      "aprovacao.prefeitura",
      "responsavelProjeto.nome",
      "responsavelProjeto.formacao",
      "responsavelProjeto.crea",
      "responsavelProjeto.art",
      "responsavelObra.nome",
      "responsavelObra.formacao",
      "responsavelObra.crea",
      "responsavelObra.art"
    ],
    template: "O projeto arquitetônico da edificação foi aprovado pela {{aprovacao.orgao}}, em {{aprovacao.data}}, conforme Alvará de Construção nº {{aprovacao.alvara}}, expedido pela {{aprovacao.prefeitura}}. A responsabilidade técnica pelo projeto arquitetônico e pela elaboração dos quadros da NBR 12.721 é do {{responsavelProjeto.formacao}} {{responsavelProjeto.nome}}, inscrito no CREA/CAU sob nº {{responsavelProjeto.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelProjeto.art}}. A responsabilidade técnica pela execução da obra é do {{responsavelObra.formacao}} {{responsavelObra.nome}}, inscrito no CREA/CAU sob nº {{responsavelObra.crea}} e Anotação de Responsabilidade Técnica (ART/RRT) nº {{responsavelObra.art}}."
  },
  {
    id: "c6",
    ordem: 5,
    titulo: "Quinta – Da Descrição das Unidades Autônomas",
    categoria: "Unidades Autônomas",
    resumo: "Descrição completa das unidades autônomas por torre, pavimento, apartamento, metragem e fração ideal.",
    status: "Publicada",
    variaveis: ["listaUnidades"],
    template: "Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira nº 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei nº 4.591, assim se descrevem as futuras unidades autônomas do condomínio:\n\n{{listaUnidades}}"
  },
  {
    id: "c6b",
    ordem: 6,
    titulo: "Sexta – Do Orçamento da Edificação",
    categoria: "Orçamento",
    resumo: "Declara o custo global estimado da edificação com base no CUB de referência.",
    status: "Publicada",
    variaveis: [
      "orcamento.valor",
      "orcamento.valorExtenso",
      "orcamento.cubMultiplicador",
      "orcamento.cubMultiplicadorExtenso",
      "orcamento.cubValor",
      "orcamento.cubValorExtenso",
      "orcamento.mesReferencia",
      "orcamento.anoReferencia",
      "orcamento.regiaoCub"
    ],
    template: "O custo global estimado da edificação, para fins do presente memorial de incorporação, é de {{orcamento.valor}} ({{orcamento.valorExtenso}}), correspondente a {{orcamento.cubMultiplicador}} ({{orcamento.cubMultiplicadorExtenso}}) vezes o CUB (Custo Unitário Básico) de {{orcamento.cubValor}} ({{orcamento.cubValorExtenso}}), referente ao mês de {{orcamento.mesReferencia}}/{{orcamento.anoReferencia}}, divulgado pelo Sinduscon {{orcamento.regiaoCub}}."
  },
  {
    id: "c7",
    ordem: 7,
    titulo: "Sétima – Da Destinação das Unidades Autônomas",
    categoria: "Unidades Autônomas",
    resumo: "Remete a destinação à Convenção Condominial e Regimento Interno.",
    status: "Publicada",
    variaveis: ["empreendimento.nome"],
    template: "A destinação das unidades autônomas e tudo que às mesmas unidades se referirem, estão tratadas na Convenção Condominial e Regimento Interno do {{empreendimento.nome}}, doravante denominada exclusivamente Convenção, elaborada em cumprimento ao Artigo 9º, da citada Lei nº 4.591, de 16 de dezembro de 1964, conforme Cláusula a seguir."
  },
  {
    id: "c8",
    ordem: 8,
    titulo: "Oitava – Convenção Condominial e Regimento Interno",
    categoria: "Convenção Condominial",
    resumo: "Convenção e Regimento completos: 7 capítulos e 32 artigos.",
    status: "Publicada",
    variaveis: [],
    template: `Capítulo I – Direitos e Deveres

Artigo 1. São direitos dos condôminos: a) usar, gozar e dispor da respectiva unidade autônoma, de acordo com o respectivo destino (residencial e comercial), desde que não prejudiquem à segurança e solidez do condomínio, que não causem dano aos demais condôminos, e não infrinjam as normas legais ou às disposições desta Convenção; b) usar e gozar das partes comuns do condomínio, desde que não impeçam idêntico uso ou gozo por parte do outro condômino, com as mesmas restrições da alínea anterior; c) examinar a qualquer tempo os livros e arquivos da administração e pedir esclarecimentos ao administrador ou síndico; d) não desviar os empregados do condomínio para serviços internos de suas unidades autônomas; e) comparecer às assembléias e nelas discutir e votar; f) denunciar ao síndico qualquer irregularidade que observem.

Artigo 2. São deveres dos condôminos: a) guardar decoro e respeito no uso das coisas e partes comuns, não as usando nem permitindo que as usem, bem como as respectivas unidades autônomas para fins diversos daqueles a que se destinem; b) não usar as respectivas unidades autônomas, nem alugá-las ou cedê-las para atividades ruidosas, ou a pessoas de maus costumes, ou para instalação de qualquer atividade ou depósito de objeto capaz de causar danos ao prédio ou incômodo aos demais condôminos; c) remover pós de tapetes, cortinas ou partes das unidades autônomas senão com aspiradores dotados de dispositivos que impeçam a sua dispersão; d) não estender roupas, tapetes ou quaisquer outros objetos nas janelas, ou em quaisquer lugares que sejam visíveis do exterior, ou de onde estejam expostos ao risco de caírem; e) não lançar quaisquer objetos ou líquidos sobre a via pública e área interna; f) colocar lixo, detritos, etc., no lugar designado para tanto; g) não decorar as paredes, portas e esquadrias externas com cores ou tonalidades diversas das empregadas no condomínio; h) não colocar nem deixar que se coloquem nas partes comuns do condomínio quaisquer objetos de instalações, sejam de que natureza forem; i) não utilizar os empregados do condomínio para serviços particulares; j) não manter nas respectivas unidades autônomas, substâncias, instalações ou aparelhos que causem perigo à segurança e à solidez do condomínio ou incômodo aos demais condôminos; k) não sobrecarregar a estrutura e as lajes do condomínio com peso superior a 300 kg por metro quadrado; l) não fracionar a respectiva unidade autônoma para fim de aliená-la a mais de uma pessoa separadamente; m) contribuir para as despesas comuns do condomínio na proporção adiante expressa, efetuando os recolhimentos nas ocasiões oportunas; n) contribuir para o custeio de obras determinadas pela Assembleia, na forma e na proporção adiante definida; o) permitir o ingresso, em sua unidade autônoma, do administrador ou preposto seu quando isto se torne indispensável à inspeção ou realização de trabalhos relativos à estrutura geral do condomínio, sua segurança e solidez, ou indispensável à realização de reparos em instalações e tubulações na unidade autônoma vizinha; p) não permitir a realização de jogos infantis em quaisquer das partes comuns do condomínio que não tenham essa destinação; q) comunicar imediatamente ao síndico a ocorrência de moléstia contagiosa em sua unidade autônoma; r) não promover a dispersão de sons ou ruídos gerados em sua unidade autônoma de modo que possam ser percebidos nas unidades autônomas vizinhas, no período compreendido entre às 22:00 horas de um dia as 08:00 horas do dia seguinte, de segunda a sexta, das 12:00 às 24:00 horas de sábado e em nenhum horário durante domingos e feriados.

Capítulo II – Das Assembleias Gerais

Artigo 3. As Assembleias Gerais serão convocadas mediante carta registrada ou protocolizada pelo síndico ou por um quarto dos condôminos, e serão realizadas no próprio condomínio, salvo motivo de força maior. § 1º As convocações indicarão o resumo da ordem do dia, a data, a hora e o local da assembleia, e serão assinadas pelo síndico ou pelo condômino que a fizer. § 2º As convocações das assembleias gerais ordinárias serão acompanhadas de cópias do relatório e contas do administrador, bem como da proposta de orçamento relativo ao exercício respectivo. § 3º Entre a data da convocação e a da assembleia deverá mediar um prazo de cinco dias, no mínimo. § 4º As assembleias extraordinárias poderão ser convocadas com prazo mais curto do que o mencionado no parágrafo anterior, quando houver comprovada urgência. § 5º É lícito, no mesmo anúncio, fixar o momento em que se realizará a assembleia em primeira e em segunda convocação, mediando entre ambas, o período de uma hora, no mínimo. § 6º O síndico endereçará as convocações para as unidades dos respectivos condôminos, salvo se tiverem estes, feito em tempo oportuno comunicação de outro endereço para o qual devam ser remetidas.

Artigo 4. As assembleias serão presididas por um condômino ou não, que lavrará a ata dos trabalhos no livro próprio.

Artigo 5. Cada unidade representará um voto e as decisões só poderão ser unânimes, observando o disposto no Artigo 8 e seus parágrafos.

Artigo 6. É lícito fazer o condômino representar, nas assembléias, por procurador com poderes especiais, condômino ou não.

Artigo 7. A assembleia geral ordinária realizar-se-á anualmente no primeiro dia útil do mês a que corresponder à primeira assembleia geral ordinária, e a ela compete: a) discutir e votar o relatório e as contas da administração relativas ao ano findo; b) discutir e votar o orçamento das despesas para o ano em curso, fixando fundos de reserva; c) eleger o síndico, fixando-lhe a remuneração; d) votar as demais matérias constantes da ordem do dia.

Artigo 8. As assembleias gerais ordinárias só realizar-se-ão com a presença dos condôminos que representarem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º Caso um condômino injustificadamente ou por impedimento não possa comparecer à assembleia, o outro condômino poderá requerer à custa do condômino ausente, junto ao Juízo competente, o suprimento de seu comparecimento e voto. § 2º Em caso de empate a decisão será tomada judicialmente, por Juiz de Direito.

Artigo 9. As assembleias gerais extraordinárias só realizar-se-ão com a presença dos condôminos que representem a maioria absoluta (50 por cento +1) das unidades autônomas que constituem o condomínio. § 1º As assembleias gerais extraordinárias serão convocadas pelo síndico ou por um condômino, pelo mesmo processo e nos mesmos prazos exigidos para convocação das assembleias ordinárias. § 2º Aplica-se às assembleias gerais extraordinárias as disposições sobre as assembleias gerais ordinárias, no que couber.

Artigo 10. Compete nas assembleias extraordinárias: a) deliberar sobre matéria de interesse geral do condomínio ou dos condôminos; b) decidir em grau de recurso os assuntos que tenham sido deliberados pelo síndico e a elas levadas a pedido do interessado ou dos interessados; c) apreciar as demais matérias constantes da ordem do dia; d) examinar os assuntos que lhes sejam propostos por qualquer condômino; e) destituir o síndico a qualquer tempo, independentemente de justificação e sem indenização.

Artigo 11. As deliberações das assembleias gerais serão obrigatórias a todos os condôminos, cumprindo ao síndico executá-las e fazê-las cumprir. § único. Nos oito dias que se seguirem à assembleia, o administrador enviará cópia aos condôminos por carta registrada ou protocolizada, de relato das deliberações na assembleia tomadas.

Artigo 12. Das assembleias gerais serão lavradas atas em livro próprio, aberto, encerrado, rubricado e assinado pelo síndico. § único. As despesas com a Assembleia Geral serão inscritas a débito do condomínio, mas relativas à assembleia convocada para apreciação de recurso do condômino serão pagas por este, se o recurso for desprovido.

Capítulo III – Da Administração

Artigo 13. A administração do condomínio caberá a um síndico, condômino ou não, eleito em assembleia geral ordinária, pelo prazo de dois anos, podendo ser reeleito. § único. Ao síndico compete: a) representar os condôminos em juízo ou fora dele, ativa ou passivamente, em tudo que se referir aos assuntos de interesse da comunhão; b) superintender a administração do condomínio; c) cumprir e fazer cumprir a lei, a presente convenção e as deliberações das assembleias; d) admitir e demitir empregados, bem como fixar a respectiva remuneração; e) ordenar reparos urgentes ou adquirir o que seja necessário à segurança ou conservação do condomínio; f) executar fielmente as disposições orçamentárias aprovadas pela assembleia; g) convocar as assembleias gerais ordinárias nas épocas próprias e as extraordinárias quando julgar conveniente ou lhe for requerido fundamentalmente por no mínimo um condômino; h) prestar, a qualquer tempo, informações sobre os atos da administração; i) prestar à assembleia contas de sua gestão, acompanhadas da documentação respectiva e oferecer proposta de orçamento para o exercício seguinte; j) manter e escriturar livro-caixa, devidamente aberto, encerrado, rubricado e assinado; l) cobrar, inclusive em juízo, as quotas que couberem em rateio aos condôminos, nas despesas normais ou extraordinárias do condomínio, aprovadas pela assembleia, bem como as multas impostas por infração de disposições legais ou desta convenção; m) comunicar à assembleia as citações que receber; n) procurar, por meios suasórios, dirimir divergências entre os condôminos; o) entregar ao seu sucessor todos os livros, documentos e pertences em seu poder; p) manter guardada, durante o prazo de cinco anos, para eventuais necessidades de verificação contábil, toda a documentação relativa ao condomínio, devendo guardar por mais tempo os documentos que tiverem de fazer prova por período superior a cinco anos.

Artigo 14. O síndico poderá delegar suas funções administrativas a terceiros de sua confiança, mas sob sua exclusiva responsabilidade.

Artigo 15. O administrador receberá a remuneração mensal que lhe for fixada pela assembleia geral.

Artigo 16. Em caso de vaga, a assembleia elegerá outro síndico que exercerá o mandato pelo tempo restante. Em caso de destituição, o síndico prestará imediatamente contas de sua gestão.

Artigo 17. O síndico não é responsável pessoalmente pelas obrigações contraídas em nome do condomínio, desde que tenha agido no exercício regular de suas atribuições, responderá, porém, pelo excesso de representação e pelos prejuízos a que der causa, por dolo ou culpa.

Artigo 18. Ao zelador, nomeado pelo síndico do condomínio e considerado empregado do condomínio, compete: a) exercer a vigilância do condomínio; b) manter em perfeitas condições de conservação e asseio das partes comuns do condomínio; c) comunicar ao síndico, imediatamente, quaisquer irregularidades havidas no condomínio, ou na sua utilização pelos condôminos, bem como qualquer circunstância que lhe pareça anormal; d) executar as instruções do síndico.

Capítulo IV – Do Conselho Fiscal ou Consultivo

Artigo 19. Não haverá conselho consultivo ou fiscal, cabendo aos condôminos que representarem a maioria das unidades do condomínio qualquer atividade relacionada à função deste conselho.

Capítulo V – Do Orçamento do Condomínio

Artigo 20. Constituem despesas comuns do condomínio: a) as relativas à conservação, limpeza, reparações e reconstrução das partes e coisas comuns; b) as relativas ao zelador; c) as relativas à manutenção das partes e coisas comuns; d) o prêmio do seguro do condomínio e dos empregados; e) os impostos e taxas que incidam sobre as partes e coisas comuns do condomínio; f) a remuneração do síndico, zelador e a dos demais empregados do condomínio, bem como as relativas aos encargos de Previdência e Assistência Social; g) o Fundo de Reserva de 10% (dez por cento) à maior que cabe ao condomínio no rateio mensal a título de despesas condominiais, se aceito em assembleia geral ordinária.

Artigo 21. Compete à Assembleia fixar o orçamento das despesas comuns e cabe aos condôminos concorrer para o custeio das referidas despesas, até o dia cinco (5) do mês subsequente ao da efetivação das despesas, realizando-se o rateio em proporções iguais à cada unidade autônoma.

Artigo 22. Serão igualmente rateadas entre os condôminos as despesas extraordinárias dentro de quinze dias a contar da data da assembleia que as autorizar, salvo se nesta oportunidade for estabelecido prazo diferente, ou se forem adicionadas à quota normal do condomínio.

Artigo 23. Ficarão a cargo exclusivo de cada condômino as despesas a que der causa. § único. O disposto neste artigo é extensivo aos prejuízos causados às partes comuns do condomínio, pela omissão do condômino na execução dos trabalhos ou reparações na sua unidade autônoma.

Artigo 24. O saldo remanescente do orçamento de um exercício será incorporado ao exercício seguinte, se outro destino não lhe for dado pela assembleia ordinária. O déficit verificado será rateado entre os condôminos e arrecadado no prazo de quinze dias.

Artigo 25. O condomínio será segurado contra incêndio ou qualquer outro risco que possa vir a destruí-lo no todo ou em parte, em companhia idônea com aprovação da assembleia, pelo respectivo valor, discriminando-se na apólice o de cada unidade. § único. É lícito a cada condômino, individualmente e às expensas próprias, aumentar o seguro de sua unidade autônoma, ou segurar as benfeitorias e melhoramentos por ele introduzidas na mesma.

Artigo 26. Ocorrido o sinistro total ou a destruição de mais de dois terços do condomínio, os condôminos que representarem as unidades do condomínio se reunirão em assembleia geral dentro de quinze dias e elegerão quem os representará para: a) receber a indenização e depositá-la em nome do condomínio no estabelecimento bancário designado pela assembleia, respeitado o parágrafo único do artigo 25; b) abrir concorrência para a reconstrução do prédio ou de suas partes destruídas, comunicando o resultado à assembleia geral para a devida deliberação; c) acompanhar os trabalhos de reconstrução até final, representando os condôminos junto aos construtores, fornecedores, empreiteiros e repartições públicas.

Artigo 27. Não sendo acordado entre os condôminos a reconstrução das partes destruídas, será feita a venda do terreno, partilhando-se o seu preço e o valor entre os condôminos, respeitando o parágrafo único do artigo 25.

Artigo 28. Em caso de incêndio parcial, recolhido o seguro, proceder-se-á à reparação ou reconstrução das partes destruídas.

Capítulo VI – Das Penalidades

Artigo 29. Os condôminos em atraso com o pagamento das respectivas contribuições, pagarão o juro de 1% (um por cento) ao mês, e até 20% (vinte por cento) sobre o débito, contados a partir da data do vencimento do respectivo prazo, independentemente de interpelação, até uma mora de trinta dias. Findo este prazo, poderá o síndico cobrar-lhe o débito judicialmente, sujeitando-se, ainda, ao pagamento das custas e honorários de advogado e à correção monetária de seu débito, segundo os índices levantados pelos órgãos governamentais.

Artigo 30. Além das penas cominadas em lei, fica ainda o condômino ou possuidor, que não cumprir reiteradamente com os seus deveres perante o condomínio, que por deliberação de três quartos dos condôminos restantes, ser constrangido a pagar multa correspondente até ao quíntuplo do valor atribuído à contribuição para as despesas condominiais, conforme a gravidade das faltas e a reiteração, independentemente das perdas e danos que se apurarem. Além de que, o condômino ou possuidor que, por seu reiterado comportamento anti-social, gerar incompatibilidade de convivência com os demais condôminos ou possuidores, poderá ser constrangido a pagar multa correspondente ao décuplo do valor atribuído à contribuição para as despesas condominiais, até ulterior deliberação da assembleia. § único. A multa será imposta e cobrada pelo síndico, com recurso do interessado para a Assembleia Geral.

Capítulo VII – Disposições Gerais e Transitórias

Artigo 31. A presente convenção, que sujeita a todo ocupante ainda que eventual do condomínio ou de qualquer de suas partes, obriga a todos os condôminos, seus sub-rogados e sucessores a título universal ou singular, e somente poderá ser modificada mediante a aprovação de 2/3 (dois terços) dos votos dos condôminos a alteração da convenção, bem como a mudança da destinação do edifício ou da unidade imobiliária.

Artigo 32. Fica eleito o foro da Comarca de Cascavel-PR para todo tipo de ação ou execução decorrente da aplicação de qualquer dos dispositivos constantes nesta convenção.`
  },
  {
    id: "c9",
    ordem: 9,
    titulo: "Nona – Do Regime de Incorporação",
    categoria: "Incorporação",
    resumo: "Define a incorporação em etapas com base na Lei 4.864/65 e Lei 4.591/64.",
    status: "Publicada",
    variaveis: ["empreendimento.nome", "empreendimento.qtdEtapas"],
    template: "A incorporadora, utilizando-se do disposto no art. 6º, da Lei nº 4.864, de 29.11.1965, combinado com o art. 9º, parágrafo 4º, da citada Lei nº 4.591, de 1964, convenciona que a incorporação imobiliária do {{empreendimento.nome}}, será em {{empreendimento.qtdEtapas}} etapas, que serão aleatórias, dependendo da conclusão de cada uma das torres, conforme emissão do Habite-se."
  },
  {
    id: "c10",
    ordem: 10,
    titulo: "Décima – Do Prazo de Carência",
    categoria: "Incorporação",
    resumo: "Declara inexistência de prazo de carência, pois as obras de edificação já foram iniciadas.",
    status: "Publicada",
    variaveis: [],
    template: "Não haverá prazo de carência, haja visto que as obras de edificação já foram iniciadas."
  },
  {
    id: "c11",
    ordem: 11,
    titulo: "Décima Primeira – Da Regularidade Fiscal",
    categoria: "Incorporação",
    resumo: "Declaração de regularidade fiscal e previdenciária da incorporadora.",
    status: "Publicada",
    variaveis: [],
    template: 'De acordo com o que dispõe o Artigo 257, Inciso III, do Decreto Federal nº 3.408, de 6 de maio de 1999, publicado no Diário Oficial da União em 7 de maio de 1999, retificado conforme publicação no mesmo Diário em 12 de maio de 1999 (com a redação que lhe foi dada pelos Decretos Federais nº 3.265, de 29 de novembro de 1999 (DOU 30/11/1999), 3.298, de 20 de dezembro de 1999 (DOU 21/12/1999), 3.452, de 9 de maio de 2000 (DOU 09/05/2000) e 3.668, de 22 de novembro de 2000 (DOU 23/11/2000), e Item 5-III, da Ordem de Serviço nº 207, de 8 de abril de 1999, da Diretoria de Arrecadação e Fiscalização do Instituto Nacional do Seguro Social – INSS, publicada no Diário Oficial da União em 15 de abril de 1999, retificada conforme publicação no mesmo Diário em 16 e 19 de abril de 1999, combinado com os Artigos 29, Parágrafo Único, 30 e 32, alínea "f", da Lei Federal nº 4.591, de 16 de dezembro de 1964, a incorporadora declara, para fins de registro da Incorporação imobiliária do condomínio do Residencial Madrid, que está em dia com o recolhimento de contribuições à Previdência Social e que apresenta junto com este instrumento a Certidão Negativa de Débitos – CND, da Certidão Positiva de Débitos – CPD ou da Certidão Positiva de Débitos com Efeitos de Negativa – CPD-EM, do citado INSS.'
  },
  {
    id: "c12",
    ordem: 12,
    titulo: "Décima Segunda – Do Registro",
    categoria: "Registro",
    resumo: "Solicita registro da incorporação e da Convenção (em resumo) ao Cartório.",
    status: "Publicada",
    variaveis: ["empreendimento.comarca"],
    template: "Em face de tudo expresso, a incorporadora requer ao Registrador, do Terceiro Serviço de Registro de Imóveis da Comarca de {{empreendimento.comarca}} que promova os seguintes atos: primeiro, o registro da incorporação imobiliária; segundo, o registro da Convenção Condominial e Regimento Interno; não havendo necessidade de registrar a convenção na íntegra, mas resumida, fornecendo-lhe, em seguida, cópia deste instrumento e certidão probatória de todos os atos; terceiro, todos os demais atos necessários para o pleno registro deste instrumento."
  }
];
const LEGACY_CLAUSULA_ORDEM_TO_PDF = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12
};
const TITULO_KEYWORDS = {
  c1: ["qualificação"],
  c2: ["propriedade"],
  c3: ["incorporação imobiliária", "incorporacao imobiliaria"],
  c4: ["composição", "composicao"],
  c5: ["aprovação", "aprovacao"],
  c6: ["descrição das unidades", "descricao das unidades"],
  c6b: ["orçamento", "orcamento"],
  c7: ["destinação", "destinacao"],
  c8: ["convenção", "convencao"],
  c9: ["regime de incorporação", "regime de incorporacao"],
  c10: ["prazo de carência", "prazo de carencia"],
  c11: ["regularidade fiscal"],
  c12: ["registro"]
};
function getMemorialClausulasPadrao() {
  return clausulas.map((c) => ({
    slug: c.id,
    ordem: c.ordem,
    titulo: c.titulo,
    categoria: c.categoria,
    resumo: c.resumo,
    template: c.template,
    variaveis: c.variaveis
  })).sort((a, b) => a.ordem - b.ordem);
}
function normalizeTitulo$1(titulo) {
  return titulo.trim().toLowerCase().normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "");
}
function tituloMatchesKeywords(titulo, slug) {
  const keywords = TITULO_KEYWORDS[slug];
  if (!keywords) return false;
  const normalized = normalizeTitulo$1(titulo);
  return keywords.some((kw) => normalized.includes(normalizeTitulo$1(kw)));
}
async function fetchModeloMemorialId(organizationId) {
  const { data, error } = await supabase.from("modelos_documento").select("id").eq("organization_id", organizationId).ilike("tipo", "%Memorial%").limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
function findClausulaForDef(existing, def, usedIds) {
  const bySlug = existing.find(
    (c) => !usedIds.has(c.id) && tituloMatchesKeywords(c.titulo, def.slug)
  );
  if (bySlug) return bySlug;
  const legacyOrdem = Object.entries(LEGACY_CLAUSULA_ORDEM_TO_PDF).find(
    ([, pdfOrdem]) => pdfOrdem === def.ordem
  )?.[0];
  if (legacyOrdem) {
    const byLegacy = existing.find(
      (c) => !usedIds.has(c.id) && c.ordem === Number(legacyOrdem)
    );
    if (byLegacy) return byLegacy;
  }
  const byOrdem = existing.find((c) => !usedIds.has(c.id) && c.ordem === def.ordem);
  if (byOrdem) return byOrdem;
  return null;
}
async function ensureClausulasMemorialPadrao(organizationId) {
  const [padrao, existing, modeloId] = await Promise.all([
    Promise.resolve(getMemorialClausulasPadrao()),
    fetchClausulas(organizationId),
    fetchModeloMemorialId(organizationId)
  ]);
  const usedIds = /* @__PURE__ */ new Set();
  let changed = false;
  for (const def of padrao) {
    const current = findClausulaForDef(existing, def, usedIds);
    if (!current) {
      const { error: error2 } = await supabase.from("clausulas").insert({
        organization_id: organizationId,
        modelo_id: modeloId,
        titulo: def.titulo,
        categoria: def.categoria,
        resumo: def.resumo,
        template: def.template,
        variaveis: def.variaveis,
        status: "publicada",
        ordem: def.ordem
      });
      if (error2) throw error2;
      changed = true;
      continue;
    }
    usedIds.add(current.id);
    const needsUpdate = current.titulo !== def.titulo || current.template !== def.template || current.ordem !== def.ordem || current.categoria !== def.categoria || current.resumo !== def.resumo || JSON.stringify(current.variaveis) !== JSON.stringify(def.variaveis);
    if (!needsUpdate) continue;
    const { error } = await supabase.from("clausulas").update({
      titulo: def.titulo,
      categoria: def.categoria,
      resumo: def.resumo,
      template: def.template,
      variaveis: def.variaveis,
      ordem: def.ordem,
      status: "publicada",
      modelo_id: current.modeloId ?? modeloId
    }).eq("id", current.id);
    if (error) throw error;
    changed = true;
  }
  return changed;
}
const UNIDADES_INTRO = "Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira nº 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei nº 4.591, assim se descrevem as futuras unidades autônomas do condomínio:";
function resolvePath(context, path) {
  const root = context;
  if (path in root && (typeof root[path] === "string" || typeof root[path] === "number")) {
    const value = root[path];
    if (value === null || value === "") return `{{${path}}}`;
    return String(value);
  }
  const parts = path.split(".");
  let current = context;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return `{{${path}}}`;
    current = current[part];
  }
  if (current == null || current === "") return `{{${path}}}`;
  return String(current);
}
function renderTemplate(template, context) {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawPath) => {
    const path = rawPath.trim();
    return resolvePath(context, path);
  });
}
function findClausulaForSecao$1(secao, clausulas2) {
  if (secao.clausulaId) {
    return clausulas2.find((c) => c.id === secao.clausulaId) ?? null;
  }
  return clausulas2.find((c) => c.titulo === secao.titulo) ?? clausulas2.find((c) => c.ordem === secao.ordem) ?? null;
}
function generateSecaoConteudo(secao, clausulas2, context) {
  if (isUnidadesSection(secao.titulo)) {
    return UNIDADES_INTRO;
  }
  const clausula = findClausulaForSecao$1(secao, clausulas2);
  if (clausula?.template) {
    return renderTemplate(clausula.template, context);
  }
  return secao.conteudo;
}
function mapRowToSecao(row) {
  const status = row.status;
  return {
    id: row.id,
    memorialId: row.memorial_id,
    clausulaId: row.clausula_id,
    titulo: row.titulo,
    conteudo: row.conteudo ?? "",
    status,
    statusLabel: getSecaoStatusLabel(status),
    ordem: row.ordem,
    updatedAt: row.updated_at
  };
}
function mapRowToMemorial(row) {
  const status = row.status;
  const secoes = (row.memorial_secoes ?? []).map(mapRowToSecao).sort((a, b) => a.ordem - b.ordem);
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    versao: row.versao,
    status,
    statusLabel: getMemorialStatusLabel(status),
    secoes
  };
}
function normalizeTitulo(titulo) {
  return titulo.trim().toLowerCase().normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "");
}
function buildMemorialSecoesRows(memorialId, clausulas2) {
  const publicadas = clausulas2.filter((c) => c.status === "publicada").sort((a, b) => a.ordem - b.ordem);
  return publicadas.map((c) => ({
    memorial_id: memorialId,
    clausula_id: c.id,
    titulo: c.titulo,
    conteudo: null,
    status: "nao_gerada",
    ordem: c.ordem
  }));
}
function findClausulaForSecao(secaoTitulo, clausulaId, publicadas) {
  if (clausulaId) {
    return publicadas.find((c) => c.id === clausulaId) ?? null;
  }
  const normalized = normalizeTitulo(secaoTitulo);
  return publicadas.find((c) => normalizeTitulo(c.titulo) === normalized) ?? publicadas.find((c) => {
    const slug = c.titulo.includes("Qualificação") ? "c1" : c.titulo.includes("Propriedade") ? "c2" : c.titulo.includes("Incorporação Imobiliária") ? "c3" : c.titulo.includes("Composição") ? "c4" : c.titulo.includes("Aprovação") ? "c5" : c.titulo.includes("Descrição das Unidades") ? "c6" : c.titulo.includes("Orçamento") ? "c6b" : c.titulo.includes("Destinação") ? "c7" : null;
    return slug ? tituloMatchesKeywords(secaoTitulo, slug) : false;
  }) ?? null;
}
async function syncMemorialSecoesWithClausulas(memorial, organizationId) {
  const clausulas2 = await fetchClausulas(organizationId);
  const publicadas = clausulas2.filter((c) => c.status === "publicada");
  let changed = false;
  const linkedClausulaIds = /* @__PURE__ */ new Set();
  for (const secao of memorial.secoes) {
    const clausula = findClausulaForSecao(secao.titulo, secao.clausulaId, publicadas);
    if (clausula) linkedClausulaIds.add(clausula.id);
    if (!clausula) continue;
    const patch = {};
    if (secao.titulo !== clausula.titulo) patch.titulo = clausula.titulo;
    if (secao.ordem !== clausula.ordem) patch.ordem = clausula.ordem;
    if (secao.clausulaId !== clausula.id) patch.clausula_id = clausula.id;
    if (Object.keys(patch).length === 0) continue;
    const { error } = await supabase.from("memorial_secoes").update(patch).eq("id", secao.id);
    if (error) throw error;
    changed = true;
  }
  const missing = [];
  for (const clausula of publicadas) {
    if (linkedClausulaIds.has(clausula.id)) continue;
    missing.push({
      memorial_id: memorial.id,
      clausula_id: clausula.id,
      titulo: clausula.titulo,
      conteudo: null,
      status: "nao_gerada",
      ordem: clausula.ordem
    });
  }
  if (missing.length > 0) {
    const { error } = await supabase.from("memorial_secoes").insert(missing);
    if (error) throw error;
    changed = true;
  }
  return changed;
}
async function logAudit(organizationId, empreendimentoId, eventType, description, metadata) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null
  });
  if (error) throw error;
}
function resolveOrganizationId(empreendimentos) {
  if (!empreendimentos) return null;
  if (Array.isArray(empreendimentos)) {
    return empreendimentos[0]?.organization_id ?? null;
  }
  return empreendimentos.organization_id;
}
async function fetchMemorial(empreendimentoId) {
  const { data, error } = await supabase.from("memoriais").select(
    `
      id, empreendimento_id, versao, status,
      empreendimentos!inner ( organization_id ),
      memorial_secoes (
        id, memorial_id, clausula_id, titulo, conteudo, status, ordem, updated_at
      )
    `
  ).eq("empreendimento_id", empreendimentoId).order("versao", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data;
  let memorial = mapRowToMemorial(row);
  const organizationId = resolveOrganizationId(row.empreendimentos);
  if (organizationId !== null) {
    const clausulasSynced = await ensureClausulasMemorialPadrao(organizationId);
    const secoesSynced = await syncMemorialSecoesWithClausulas(memorial, organizationId);
    if (clausulasSynced || secoesSynced) {
      const refreshed = await fetchMemorialWithoutSync(empreendimentoId);
      if (refreshed) memorial = refreshed;
    }
  }
  return memorial;
}
async function fetchMemorialWithoutSync(empreendimentoId) {
  const { data, error } = await supabase.from("memoriais").select(
    `
      id, empreendimento_id, versao, status,
      memorial_secoes (
        id, memorial_id, clausula_id, titulo, conteudo, status, ordem, updated_at
      )
    `
  ).eq("empreendimento_id", empreendimentoId).order("versao", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRowToMemorial(data);
}
async function createMemorialFromClausulas(input) {
  const clausulas2 = await fetchClausulas(input.organizationId);
  const { data: memorial, error: memError } = await supabase.from("memoriais").insert({
    empreendimento_id: input.empreendimentoId,
    versao: 1,
    status: "rascunho",
    created_by_profile_id: input.profileId
  }).select("id").single();
  if (memError) throw memError;
  const secoesInsert = buildMemorialSecoesRows(memorial.id, clausulas2);
  const { error: secError } = await supabase.from("memorial_secoes").insert(secoesInsert);
  if (secError) throw secError;
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "criacao",
    "Memorial criado a partir do modelo padrão.",
    { memorial_id: memorial.id }
  );
  const created = await fetchMemorial(input.empreendimentoId);
  if (!created) throw new Error("Memorial não encontrado após criação.");
  return created;
}
async function ensureMemorial(input) {
  const existing = await fetchMemorial(input.empreendimentoId);
  if (existing) return existing;
  return createMemorialFromClausulas(input);
}
async function regenerateSecao(input) {
  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) throw new Error("Memorial não encontrado.");
  const secao = memorial.secoes.find((s) => s.id === input.secaoId);
  if (!secao) throw new Error("Seção não encontrada.");
  const [context, clausulas2] = await Promise.all([
    fetchMemorialContext(input.empreendimentoId),
    fetchClausulas(input.organizationId)
  ]);
  const conteudo = generateSecaoConteudo(secao, clausulas2, context);
  const novoStatus = secao.status === "aprovada" ? "aprovada" : isUnidadesSection(secao.titulo) ? "em_revisao" : "gerada";
  const { error } = await supabase.from("memorial_secoes").update({ conteudo, status: novoStatus }).eq("id", input.secaoId);
  if (error) throw error;
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "geracao",
    `Seção "${secao.titulo}" regenerada.`,
    { secao_id: input.secaoId, memorial_id: input.memorialId }
  );
  return conteudo;
}
async function saveSecaoConteudo(input) {
  const { error } = await supabase.from("memorial_secoes").update({ conteudo: input.conteudo }).eq("id", input.secaoId);
  if (error) throw error;
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Seção "${input.titulo}" editada manualmente.`,
    { secao_id: input.secaoId, memorial_id: input.memorialId }
  );
}
async function updateSecaoStatus(input) {
  const patch = { status: input.status };
  if (input.status === "aprovada") {
    patch.approved_by_profile_id = input.profileId;
    patch.approved_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { error } = await supabase.from("memorial_secoes").update(patch).eq("id", input.secaoId);
  if (error) throw error;
  const eventType = input.status === "aprovada" ? "aprovacao" : "validacao";
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    eventType,
    input.descricaoAuditoria,
    { secao_id: input.secaoId, memorial_id: input.memorialId, status: input.status }
  );
}
async function generateMemorialCompleto(input) {
  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) throw new Error("Memorial não encontrado.");
  const [context, clausulas2] = await Promise.all([
    fetchMemorialContext(input.empreendimentoId),
    fetchClausulas(input.organizationId)
  ]);
  let geradas = 0;
  for (const secao of memorial.secoes) {
    const conteudo = generateSecaoConteudo(secao, clausulas2, context);
    const novoStatus = isUnidadesSection(secao.titulo) ? "em_revisao" : secao.status === "aprovada" ? "aprovada" : "gerada";
    const { error } = await supabase.from("memorial_secoes").update({ conteudo, status: novoStatus }).eq("id", secao.id);
    if (error) throw error;
    geradas += 1;
  }
  const novaVersao = memorial.versao + 1;
  const { error: memError } = await supabase.from("memoriais").update({ versao: novaVersao, status: "gerado" }).eq("id", input.memorialId);
  if (memError) throw memError;
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "geracao",
    `Memorial completo gerado (versão ${novaVersao}, ${geradas} seções).`,
    { memorial_id: input.memorialId, versao: novaVersao, secoes: geradas }
  );
  return geradas;
}
function mapRow(row) {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    uploadedByProfileId: row.uploaded_by_profile_id,
    createdAt: row.created_at,
    processedAt: row.processed_at
  };
}
async function fetchLatestQuadroTecnico(empreendimentoId) {
  const { data, error } = await supabase.from("quadros_tecnicos").select("*").eq("empreendimento_id", empreendimentoId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRow(data);
}
async function createQuadroSignedUrl(storagePath) {
  const { data, error } = await supabase.storage.from(QUADROS_TECNICOS_BUCKET).createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}
async function fetchLatestQuadroRow(empreendimentoId) {
  const { data, error } = await supabase.from("quadros_tecnicos").select("storage_path, file_name, mime_type").eq("empreendimento_id", empreendimentoId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}
async function downloadQuadroBuffer(storagePath) {
  const { data, error } = await supabase.storage.from(QUADROS_TECNICOS_BUCKET).download(storagePath);
  if (error || !data) return null;
  return data.arrayBuffer();
}
async function loadLatestQuadroDocumento(empreendimentoId) {
  const quadro = await fetchLatestQuadroRow(empreendimentoId);
  if (!quadro) return null;
  const buffer = await downloadQuadroBuffer(quadro.storage_path);
  if (!buffer) return null;
  const file = new File([buffer], quadro.file_name, {
    type: resolveQuadroContentType(quadro.file_name, quadro.mime_type ?? void 0)
  });
  return parseQuadroNbrFile(file);
}
async function persistQivbObservacoesDadosExtraidos(empreendimentoId, documento) {
  const qivb = getQuadroById(documento, "qivb");
  if (!qivb?.linhas.length) return;
  const { data: existentes, error: readError } = await supabase.from("dados_extraidos").select("campo").eq("empreendimento_id", empreendimentoId).eq("bloco", "qivb").like("campo", "observacoes__%");
  if (readError) throw readError;
  const camposExistentes = new Set((existentes ?? []).map((row) => row.campo));
  const inserts = [];
  for (const linha of qivb.linhas) {
    const observacoes = linha.observacoes?.trim() ?? "";
    if (!observacoes) continue;
    for (const key of buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || void 0)) {
      const campo = `observacoes__${key}`;
      if (camposExistentes.has(campo)) continue;
      inserts.push({
        empreendimento_id: empreendimentoId,
        bloco: "qivb",
        campo,
        valor: observacoes,
        confianca: 96,
        status: "extraido"
      });
    }
  }
  if (inserts.length === 0) return;
  const { error: insertError } = await supabase.from("dados_extraidos").insert(inserts);
  if (insertError) throw insertError;
}
async function loadVagaLookupForEmpreendimento(empreendimentoId) {
  const { data: qivbDados, error } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", empreendimentoId).eq("bloco", "qivb").like("campo", "observacoes__%");
  if (error) throw error;
  let lookup = buildQivbVagaLookupFromObservacoesCampos(qivbDados ?? []);
  try {
    const documento = await loadLatestQuadroDocumento(empreendimentoId);
    if (documento) {
      lookup = mergeVagaLookups(buildQivbVagaLookup(documento), lookup);
      try {
        await persistQivbObservacoesDadosExtraidos(empreendimentoId, documento);
      } catch (persistError) {
        console.warn("Falha ao persistir observações do Quadro IV B em dados_extraidos:", persistError);
      }
    }
  } catch (loadError) {
    console.warn("Falha ao carregar quadro técnico para lookup de vagas:", loadError);
  }
  return lookup;
}
function resolveVagaFromLookup(lookup, nome, torre, observacoesAtual) {
  const ref = lookupVagaInfo(lookup, nome, torre);
  const observacoes = ref?.observacoes?.trim() || observacoesAtual?.trim() || "";
  if (!observacoes && !ref) return null;
  const vaga = ref?.vaga?.trim() || extractVaga(observacoes);
  if (!vaga) return null;
  return { vaga, observacoes: observacoes || ref?.observacoes || "" };
}
async function backfillUnidadesVagasFromDocumento(empreendimentoId, documento) {
  const { data: qivbDados, error: dadosError } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", empreendimentoId).eq("bloco", "qivb").like("campo", "observacoes__%");
  if (dadosError) throw dadosError;
  const merged = mergeVagaLookups(
    buildQivbVagaLookup(documento),
    buildQivbVagaLookupFromObservacoesCampos(qivbDados ?? [])
  );
  if (merged.size === 0) return 0;
  const { data: unidades, error } = await supabase.from("unidades_autonomas").select("id, nome, torre, vaga, observacoes").eq("empreendimento_id", empreendimentoId);
  if (error) throw error;
  let updated = 0;
  for (const unidade of unidades ?? []) {
    if (unidade.vaga?.trim()) continue;
    const resolved = resolveVagaFromLookup(
      merged,
      unidade.nome,
      unidade.torre,
      unidade.observacoes
    );
    if (!resolved) continue;
    const patch = { vaga: resolved.vaga };
    if (resolved.observacoes && !unidade.observacoes?.trim()) {
      patch.observacoes = resolved.observacoes;
    }
    const { error: updateError } = await supabase.from("unidades_autonomas").update(patch).eq("id", unidade.id);
    if (!updateError) updated += 1;
  }
  return updated;
}
function resolveVaga(vaga, observacoes) {
  const direta = vaga?.trim();
  if (direta) return direta;
  const extraida = extractVaga(observacoes ?? "");
  return extraida || "—";
}
function mapRowToUnidade(row) {
  const status = row.status;
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    nome: row.nome,
    torre: row.torre ?? "—",
    pavimento: row.pavimento ?? "—",
    tipo: row.tipo ?? "—",
    areaPrivativa: Number(row.area_privativa ?? 0),
    areaComum: Number(row.area_comum ?? 0),
    areaTotal: Number(row.area_total ?? 0),
    garden: Number(row.area_garden ?? 0),
    vaga: resolveVaga(row.vaga, row.observacoes),
    fracao: row.fracao ?? "—",
    status,
    statusLabel: getUnidadeStatusLabel(status),
    confrontacoes: row.confrontacoes ?? "",
    observacoes: row.observacoes ?? ""
  };
}
function computeResumo(unidades) {
  return {
    total: unidades.length,
    validado: unidades.filter((u) => u.status === "validado").length,
    pendente: unidades.filter((u) => u.status === "pendente").length,
    inconsistencia: unidades.filter((u) => u.status === "inconsistencia").length,
    naoRevisado: unidades.filter((u) => u.status === "nao_revisado").length
  };
}
function enrichUnidadesFromQuadroLookup(unidades, lookup) {
  return unidades.map((unidade) => {
    if (unidade.vaga !== "—") return unidade;
    const resolved = resolveVagaFromLookup(
      lookup,
      unidade.nome,
      unidade.torre,
      unidade.observacoes
    );
    if (!resolved) return unidade;
    return {
      ...unidade,
      vaga: resolved.vaga,
      observacoes: unidade.observacoes || resolved.observacoes
    };
  });
}
async function fetchUnidades(empreendimentoId) {
  const { data, error } = await supabase.from("unidades_autonomas").select("*").eq("empreendimento_id", empreendimentoId).order("torre").order("pavimento").order("nome");
  if (error) throw error;
  let rows = data ?? [];
  let unidades = rows.map(mapRowToUnidade);
  if (unidades.some((u) => u.vaga === "—")) {
    try {
      const lookup = await loadVagaLookupForEmpreendimento(empreendimentoId);
      if (lookup.size > 0) {
        unidades = enrichUnidadesFromQuadroLookup(unidades, lookup);
      }
      const documento = await loadLatestQuadroDocumento(empreendimentoId);
      if (documento) {
        const atualizadas = await backfillUnidadesVagasFromDocumento(empreendimentoId, documento);
        if (atualizadas > 0) {
          const { data: refreshed, error: refreshError } = await supabase.from("unidades_autonomas").select("*").eq("empreendimento_id", empreendimentoId).order("torre").order("pavimento").order("nome");
          if (refreshError) throw refreshError;
          rows = refreshed ?? [];
          unidades = rows.map(mapRowToUnidade);
          unidades = enrichUnidadesFromQuadroLookup(unidades, lookup);
        }
      }
    } catch (syncError) {
      console.warn("Falha ao sincronizar vagas a partir do quadro técnico:", syncError);
    }
  }
  return unidades;
}
async function fetchUnidadesResumo(empreendimentoId) {
  const unidades = await fetchUnidades(empreendimentoId);
  return computeResumo(unidades);
}
const QUADROS_INTEGRIDADE_BASE = [
  "preliminares",
  "qi",
  "qii",
  "qiii",
  "qiva",
  "qivb",
  "qv",
  "qvi",
  "qvii",
  "qviii"
];
const QUADROS_INTEGRIDADE_OPCIONAIS = ["qcomp", "resumo"];
const BLOCO_CLAUSULA = {
  preliminares: "Qualificação · Cláusula Quarta",
  qi: "Cláusula Terceira — Composição",
  qcomp: "Cláusula Terceira — Composição (multi-torre)",
  qii: "Cláusula Quinta — Unidades",
  qiii: "Anexo NBR — Custo global",
  qiva: "Anexo NBR — Custo por unidade",
  qivb: "Cláusula Quinta — Áreas reais",
  qv: "Cláusula Quinta — Informações gerais",
  resumo: "Cláusula Quinta — Frações e confrontações",
  qvi: "Memorial Descritivo — Equipamentos",
  qvii: "Memorial Descritivo — Acabamentos privativos",
  qviii: "Memorial Descritivo — Acabamentos comuns"
};
function isCampoRevisado(status) {
  return status === "confirmado" || status === "editado";
}
function computeStatusFromCampos(campos) {
  if (campos.length === 0) return "ausente";
  const confirmados = campos.filter((c) => isCampoRevisado(c.status)).length;
  const pendentes = campos.filter(
    (c) => c.status === "pendente" || c.status === "baixa_confianca"
  ).length;
  if (pendentes > 0) return "pendente";
  if (confirmados === campos.length) return "validado";
  if (confirmados > 0) return "parcial";
  return "extraido";
}
function latestReviewedAt(campos) {
  let latest = null;
  for (const c of campos) {
    if (!c.reviewedAt) continue;
    if (!latest || c.reviewedAt > latest) latest = c.reviewedAt;
  }
  return latest;
}
function statusFromUnidades(unidadesTotal, unidadesValidadas, camposStatus) {
  if (unidadesTotal === 0) {
    return { status: camposStatus };
  }
  const detalhe = `${unidadesValidadas}/${unidadesTotal} unidades validadas`;
  if (unidadesValidadas === unidadesTotal && unidadesTotal > 0) {
    return { status: "validado", detalhe };
  }
  if (unidadesValidadas > 0) {
    return { status: "parcial", detalhe };
  }
  if (camposStatus === "validado") {
    return { status: "extraido", detalhe };
  }
  return { status: camposStatus, detalhe };
}
function buildQuadrosIntegridade(input) {
  const blocoMap = new Map(input.blocos.map((b) => [b.bloco, b.campos]));
  const presentesOpcionais = QUADROS_INTEGRIDADE_OPCIONAIS.filter(
    (id) => blocoMap.has(id)
  );
  const ordem = [...QUADROS_INTEGRIDADE_BASE, ...presentesOpcionais];
  return ordem.map((bloco) => {
    const campos = blocoMap.get(bloco) ?? [];
    let status = computeStatusFromCampos(campos);
    let detalhe;
    if (bloco === "qii") {
      const fromUnidades = statusFromUnidades(
        input.unidadesTotal,
        input.unidadesValidadas,
        status
      );
      status = fromUnidades.status;
      detalhe = fromUnidades.detalhe;
    } else if (bloco === "qivb" && input.unidadesTotal > 0 && status !== "ausente") {
      detalhe = `${input.unidadesTotal} unidades no cadastro`;
    }
    return {
      bloco,
      titulo: getBlocoTitulo(bloco),
      clausulaRef: BLOCO_CLAUSULA[bloco] ?? "Anexo NBR",
      status,
      totalCampos: campos.length,
      camposConfirmados: campos.filter((c) => isCampoConfirmado(c.status)).length,
      validatedAt: latestReviewedAt(campos),
      detalhe
    };
  });
}
function countQuadrosValidados(quadros) {
  const relevantes = quadros.filter((q) => q.status !== "ausente" && q.bloco !== "qcomp");
  const total = relevantes.length || quadros.length;
  const validados = relevantes.filter((q) => q.status === "validado").length;
  return { validados, total };
}
async function ensureValidacaoPosImportacao(empreendimentoId) {
  const { data: quadro, error: quadroError } = await supabase.from("quadros_tecnicos").select("id, status").eq("empreendimento_id", empreendimentoId).eq("status", "processado").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (quadroError) throw quadroError;
  if (!quadro) return;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await supabase.from("unidades_autonomas").update({ status: "validado", updated_at: now }).eq("empreendimento_id", empreendimentoId).eq("status", "nao_revisado");
  await supabase.from("dados_extraidos").update({
    status: "confirmado",
    reviewed_at: now
  }).eq("empreendimento_id", empreendimentoId).in("status", ["extraido", "pendente", "baixa_confianca"]);
  await supabase.from("empreendimentos").update({
    status: DB_EMPREENDIMENTO_STATUS.pronto_para_gerar,
    progresso: 55
  }).eq("id", empreendimentoId).in("status", [
    DB_EMPREENDIMENTO_STATUS.dados_extraidos,
    DB_EMPREENDIMENTO_STATUS.em_validacao,
    DB_EMPREENDIMENTO_STATUS.quadro_enviado
  ]);
}
function item(partial) {
  return partial;
}
async function fetchProntidaoExportacao(empreendimentoId) {
  await ensureValidacaoPosImportacao(empreendimentoId);
  await ensureDadosExtraidosSeeded(empreendimentoId);
  const [emp, dadosExtraidos, unidadesResumo, memorial, quadro] = await Promise.all([
    fetchEmpreendimentoDetail(empreendimentoId),
    fetchDadosExtraidos(empreendimentoId),
    fetchUnidadesResumo(empreendimentoId),
    fetchMemorial(empreendimentoId),
    fetchLatestQuadroTecnico(empreendimentoId)
  ]);
  const quadros = buildQuadrosIntegridade({
    blocos: dadosExtraidos.blocos,
    unidadesTotal: unidadesResumo.total,
    unidadesValidadas: unidadesResumo.validado
  });
  const { validados: quadrosValidados, total: quadrosTotal } = countQuadrosValidados(quadros);
  const itens = [];
  const cnpjOk = Boolean(emp?.incorporadoraEndereco.cnpj?.trim());
  const repOk = (emp?.representantes.length ?? 0) > 0 && emp.representantes.every((r) => r.cpf?.trim() && r.nome?.trim());
  itens.push(
    item({
      id: "qualificacao",
      grupo: "cadastro",
      clausula: "Preâmbulo",
      titulo: "Qualificação da incorporadora",
      descricao: "CNPJ, representante legal e dados societários para o preâmbulo do instrumento.",
      status: cnpjOk && repOk ? "ok" : cnpjOk || repOk ? "atencao" : "bloqueante",
      detalhe: !cnpjOk && !repOk ? "CNPJ e representante incompletos" : !cnpjOk ? "CNPJ da incorporadora pendente" : !repOk ? "Representante legal incompleto" : void 0
    })
  );
  const imovel = emp?.imovel;
  const imovelOk = imovel && imovel.matriculaNumero !== "—" && imovel.confrontacoes.length >= 4 && imovel.areaNumero !== "—";
  itens.push(
    item({
      id: "imovel",
      grupo: "cadastro",
      clausula: "Cláusula Primeira",
      titulo: "Propriedade e localização do imóvel",
      descricao: "Matrícula, área do terreno e confrontações do lote matriculado.",
      status: imovelOk ? "ok" : imovel?.matriculaNumero !== "—" ? "atencao" : "bloqueante",
      detalhe: imovelOk ? `${imovel.confrontacoes.length} confrontações cadastradas` : imovel?.confrontacoes.length ? `${imovel.confrontacoes.length}/4 confrontações — complete o cadastro` : "Imóvel ou confrontações não cadastrados"
    })
  );
  const qi = quadros.find((q) => q.bloco === "qi" || q.bloco === "qcomp");
  const qiStatus = qi?.status ?? "ausente";
  itens.push(
    item({
      id: "composicao",
      grupo: "quadros",
      clausula: "Cláusula Terceira",
      titulo: "Composição do condomínio",
      descricao: "Torres, pavimentos, áreas comuns e privativas (Quadro I).",
      status: qiStatus === "validado" ? "ok" : qiStatus === "ausente" ? "bloqueante" : qiStatus === "pendente" ? "bloqueante" : "atencao",
      detalhe: qi ? getQuadroStatusDetalhe(qi) : "Quadro I não encontrado"
    })
  );
  const preliminares = quadros.find((q) => q.bloco === "preliminares");
  const alvaraOk = Boolean(emp?.alvara && emp.alvara !== "—");
  itens.push(
    item({
      id: "aprovacao",
      grupo: "quadros",
      clausula: "Cláusula Quarta",
      titulo: "Aprovação do projeto arquitetônico",
      descricao: "Alvará, data, responsável técnico, CREA e ART (Informações Preliminares).",
      status: preliminares?.status === "validado" && alvaraOk ? "ok" : preliminares?.status === "validado" || alvaraOk ? "atencao" : "bloqueante",
      detalhe: alvaraOk ? `Alvará ${emp?.alvara}` : "Alvará não informado"
    })
  );
  const unidadesOk = unidadesResumo.total > 0 && unidadesResumo.validado === unidadesResumo.total;
  const unidadesParcial = unidadesResumo.validado > 0 && !unidadesOk;
  itens.push(
    item({
      id: "unidades",
      grupo: "unidades",
      clausula: "Cláusula Quinta",
      titulo: "Descrição das unidades autônomas",
      descricao: "Unidades validadas na importação do quadro (Quadro II / IV B). Edite individualmente se necessário.",
      status: unidadesOk ? "ok" : unidadesResumo.total === 0 ? "bloqueante" : unidadesParcial ? "atencao" : "bloqueante",
      detalhe: `${unidadesResumo.validado}/${unidadesResumo.total} unidades validadas`
    })
  );
  const memorialDesc = quadros.filter(
    (q) => ["qvi", "qvii", "qviii"].includes(q.bloco)
  );
  const memorialDescOk = memorialDesc.every(
    (q) => q.status === "validado" || q.status === "extraido"
  );
  const memorialDescValidado = memorialDesc.every((q) => q.status === "validado");
  itens.push(
    item({
      id: "memorial-descritivo",
      grupo: "quadros",
      clausula: "Memorial Descritivo",
      titulo: "Equipamentos e acabamentos",
      descricao: "Quadros VI, VII e VIII para o memorial descritivo do empreendimento.",
      status: memorialDescValidado ? "ok" : memorialDescOk ? "atencao" : memorialDesc.some((q) => q.status === "ausente") ? "bloqueante" : "atencao",
      detalhe: memorialDesc.map((q) => `${q.titulo.replace(/^Quadro \w+ — /, "")}: ${q.status}`).join(" · ")
    })
  );
  const secoes = memorial?.secoes ?? [];
  const secoesGeradas = secoes.filter((s) => s.status !== "nao_gerada").length;
  const secoesAprovadas = secoes.filter((s) => s.status === "aprovada").length;
  const memorialExiste = secoes.length > 0;
  itens.push(
    item({
      id: "memorial-secoes",
      grupo: "memorial",
      titulo: "Seções do memorial geradas",
      descricao: "Texto jurídico montado a partir dos dados validados e modelos de cláusulas.",
      status: !memorialExiste ? "bloqueante" : secoesGeradas === secoes.length ? "ok" : secoesGeradas > 0 ? "atencao" : "bloqueante",
      detalhe: memorialExiste ? `${secoesGeradas}/${secoes.length} seções geradas` : "Gere o memorial antes de exportar"
    })
  );
  itens.push(
    item({
      id: "memorial-aprovacao",
      grupo: "memorial",
      titulo: "Seções aprovadas para versão final",
      descricao: "Todas as seções revisadas e aprovadas pela equipe técnica.",
      status: !memorialExiste ? "nao_aplicavel" : secoesAprovadas === secoes.length ? "ok" : secoesAprovadas > 0 ? "atencao" : "bloqueante",
      detalhe: memorialExiste ? `${secoesAprovadas}/${secoes.length} seções aprovadas` : void 0
    })
  );
  const quadroProcessado = quadro?.status === "processado";
  itens.push(
    item({
      id: "anexo-quadros",
      grupo: "anexo",
      titulo: "Anexo — Quadros NBR 12.721",
      descricao: "Arquivo técnico validado anexado ao instrumento (conforme referência na Cláusula Quinta).",
      status: quadroProcessado ? "ok" : quadro ? "atencao" : "bloqueante",
      detalhe: quadro ? quadroProcessado ? quadro.fileName : `Arquivo enviado — status: ${quadro.status}` : "Nenhum quadro técnico vinculado"
    })
  );
  const anexoIntegridade = quadros.filter(
    (q) => !["preliminares", "qcomp"].includes(q.bloco) && q.status !== "ausente" && q.status !== "validado"
  );
  itens.push(
    item({
      id: "integridade-quadros",
      grupo: "anexo",
      titulo: "Integridade dos quadros validados",
      descricao: "Snapshots confirmados de cada bloco NBR alimentam o memorial e o anexo.",
      status: quadrosValidados === quadrosTotal ? "ok" : anexoIntegridade.length === 0 ? "ok" : "atencao",
      detalhe: `${quadrosValidados}/${quadrosTotal} blocos validados`
    })
  );
  const bloqueantes = itens.filter((i) => i.status === "bloqueante").length;
  const ok = itens.filter((i) => i.status === "ok").length;
  const aplicaveis = itens.filter((i) => i.status !== "nao_aplicavel").length;
  const progressoGeral = aplicaveis > 0 ? Math.round(ok / aplicaveis * 100) : 0;
  return {
    quadros,
    itens,
    progressoGeral,
    quadrosValidados,
    quadrosTotal,
    prontoExportacaoFinal: bloqueantes === 0 && secoesAprovadas === secoes.length && secoes.length > 0
  };
}
function getQuadroStatusDetalhe(q) {
  if (q.detalhe) return q.detalhe;
  if (q.totalCampos === 0) return "Sem campos extraídos";
  return `${q.camposConfirmados}/${q.totalCampos} campos confirmados`;
}
function quadroTecnicoQueryKey(empreendimentoId) {
  return ["quadros-tecnicos", "latest", empreendimentoId];
}
function useLatestQuadroTecnico(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? quadroTecnicoQueryKey(empreendimentoId) : ["quadros-tecnicos", "disabled"],
    queryFn: () => fetchLatestQuadroTecnico(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
const empreendimentosQueryKey = ["empreendimentos", "list"];
function useEmpreendimentosList() {
  return useQuery({
    queryKey: empreendimentosQueryKey,
    queryFn: fetchEmpreendimentosList
  });
}
function useCreateEmpreendimentoFromNbr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createEmpreendimentoFromNbr(input),
    onSuccess: (empreendimentoId) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "indicators"] });
      void queryClient.invalidateQueries({
        queryKey: quadroTecnicoQueryKey(empreendimentoId)
      });
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", empreendimentoId]
      });
    }
  });
}
function useUpdateEmpreendimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => updateEmpreendimentoBasico(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId]
      });
    }
  });
}
function prontidaoExportacaoQueryKey(empreendimentoId) {
  return ["prontidao-exportacao", empreendimentoId];
}
function useProntidaoExportacao(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? prontidaoExportacaoQueryKey(empreendimentoId) : ["prontidao-exportacao", "disabled"],
    queryFn: () => fetchProntidaoExportacao(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function useDeleteEmpreendimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => deleteEmpreendimento(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "indicators"] });
      void queryClient.removeQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId]
      });
    }
  });
}
export {
  useUpdateEmpreendimento as a,
  useDeleteEmpreendimento as b,
  useCreateEmpreendimentoFromNbr as c,
  useLatestQuadroTecnico as d,
  createQuadroSignedUrl as e,
  useProntidaoExportacao as f,
  ensureMemorial as g,
  updateSecaoStatus as h,
  generateMemorialCompleto as i,
  fetchMemorial as j,
  fetchUnidades as k,
  fetchMemorialContext as l,
  ensureValidacaoPosImportacao as m,
  loadLatestQuadroDocumento as n,
  prontidaoExportacaoQueryKey as p,
  regenerateSecao as r,
  saveSecaoConteudo as s,
  useEmpreendimentosList as u
};
