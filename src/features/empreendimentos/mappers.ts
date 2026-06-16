import {
  fmtNum,
  formatDateBr,
  normalizeLoteQuadraFields,
  parseBrNumeric,
  ufPorExtenso,
} from "@/lib/format";
import { areaMetrosQuadradosPorExtenso, matriculaPorExtenso } from "@/lib/numero-extenso";
import type { EmpreendimentoStatus } from "@/lib/mock-data";

import { aggregateCondominioPavimentos } from "@/features/quadro-nbr/mapper";
import { getEmpreendimentoStatusLabel } from "./status";
import type { EmpreendimentoListItem, EmpreendimentoView } from "./types";
import type {
  CondominioEspacoComumView,
  CondominioPavimentoView,
  IncorporadoraForm,
  ImovelView,
  PendenciaVisao,
  Representante,
} from "./types/detail-types";

type EnderecoJson = Record<string, unknown> | null;

type IncorporadoraListEmbed = { razao_social: string; cnpj: string | null } | null;
type IncorporadoraDetailEmbed = {
  id: number;
  razao_social: string;
  cnpj: string | null;
  endereco: EnderecoJson;
  representantes_legais: RepresentanteRowEmbed[] | null;
} | null;

type RepresentanteRowEmbed = {
  id: number;
  nome: string;
  cpf: string | null;
  rg: string | null;
  estado_civil: string | null;
  regime_comunhao: string | null;
  endereco: EnderecoJson;
};

type ProfileEmbed = { full_name: string } | null;
type DadosTecnicosEmbed = {
  unidades: number | null;
  torres: number | null;
  pavimentos: number | null;
  vagas: number | null;
  area_terreno: number | null;
  area_global: number | null;
  area_privativa_total: number | null;
  area_comum_total: number | null;
  alvara: string | null;
  data_aprovacao: string | null;
  crea_cau: string | null;
  art_rrt: string | null;
  responsavel_tecnico: string | null;
} | null;

type ConfrontacaoRowEmbed = {
  direcao: string;
  confrontante: string | null;
  medida: string | null;
  azimute: string | null;
  ordem: number;
};

type ImovelRowEmbed = {
  lote_numero: string | null;
  lote_extenso: string | null;
  quadra_numero: string | null;
  quadra_extenso: string | null;
  loteamento: string | null;
  cidade: string | null;
  comarca: string | null;
  uf: string | null;
  estado_extenso: string | null;
  area_numero: number | null;
  area_extenso: string | null;
  benfeitorias: string | null;
  matricula_numero: string | null;
  matricula_extenso: string | null;
  cartorio: string | null;
  imovel_confrontacoes: ConfrontacaoRowEmbed[] | null;
} | null;

type PendenciaRowEmbed = {
  mensagem: string;
  severidade: string;
  status: string;
};

type CondominioPavimentoRowEmbed = {
  id: number;
  torre: string | null;
  nome: string;
  area_real: number | null;
  area_equivalente: number | null;
  ordem: number;
};

type CondominioEspacoComumRowEmbed = {
  id: number;
  nome: string;
  ordem: number;
};

export type EmpreendimentoRowWithJoins = {
  id: number;
  nome: string;
  cidade: string | null;
  uf: string | null;
  endereco: string | null;
  lote: string | null;
  quadra: string | null;
  matricula: string | null;
  status: string;
  progresso: number;
  pendencias_count: number;
  updated_at: string;
  incorporadoras: IncorporadoraListEmbed;
  profiles: ProfileEmbed;
  dados_tecnicos: DadosTecnicosEmbed;
};

export type EmpreendimentoDetailRowWithJoins = Omit<
  EmpreendimentoRowWithJoins,
  "incorporadoras"
> & {
  incorporadoras: IncorporadoraDetailEmbed;
  imoveis: ImovelRowEmbed | ImovelRowEmbed[] | null;
  pendencias: PendenciaRowEmbed[] | null;
  condominio_pavimentos: CondominioPavimentoRowEmbed[] | null;
  condominio_espacos_comuns: CondominioEspacoComumRowEmbed[] | null;
};

function emptyOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export { formatDateBr };

function parseEnderecoParts(endereco: EnderecoJson): {
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
} {
  if (!endereco) {
    return { rua: "", numero: "", cep: "", bairro: "", cidade: "", estado: "" };
  }

  return {
    rua: String(endereco.logradouro ?? endereco.rua ?? ""),
    numero: String(endereco.numero ?? ""),
    cep: String(endereco.cep ?? ""),
    bairro: String(endereco.bairro ?? ""),
    cidade: String(endereco.cidade ?? ""),
    estado: String(endereco.uf ?? endereco.estado ?? ""),
  };
}

function formatEnderecoFromJson(endereco: EnderecoJson): string {
  if (!endereco) return "";

  const texto = String(endereco.texto ?? endereco.completo ?? "").trim();
  if (texto) return texto;

  const parts = parseEnderecoParts(endereco);
  const linha = [parts.rua, parts.numero].filter(Boolean).join(", ");
  return [linha, parts.bairro, parts.cep].filter(Boolean).join(" · ");
}

function formatEnderecoMemorial(endereco: EnderecoJson): string {
  if (!endereco) return "";

  const texto = String(endereco.texto ?? endereco.completo ?? "").trim();
  if (texto) return texto;

  const logradouro = String(endereco.logradouro ?? endereco.rua ?? "");
  const numero = String(endereco.numero ?? "");
  if (logradouro && numero) return `${logradouro}, no ${numero}`;
  return logradouro || numero || "";
}

/** Endereço da incorporadora: prioriza campo 1.4 validado no quadro NBR. */
export function resolveIncorporadoraEnderecoMemorial(
  enderecoDb: EnderecoJson,
  enderecoQuadro?: string | null,
  fallbackCidade?: string | null,
  fallbackUf?: string | null,
): { endereco: string; cidade: string; uf: string } {
  const parts = parseEnderecoParts(enderecoDb);
  const quadroTexto = enderecoQuadro?.trim() ?? "";
  const dbTexto = formatEnderecoMemorial(enderecoDb);

  return {
    endereco: quadroTexto || dbTexto || "—",
    cidade: parts.cidade || fallbackCidade?.trim() || "—",
    uf: parts.estado || fallbackUf?.trim() || "—",
  };
}

export function representanteFromNomeParcial(nome: string, id: string): Representante {
  return {
    id,
    nome,
    cpf: "",
    rg: "",
    estadoCivil: "Solteiro(a)",
    regimeComunhao: "",
    rua: "",
    numero: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
  };
}

const REPRESENTANTE_PLACEHOLDER = /representante\s+legal/i;

function normalizeNome(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function isRepresentantePlaceholder(nome: string): boolean {
  return REPRESENTANTE_PLACEHOLDER.test(nome.trim());
}

/** Um único sócio administrador: prioriza nome do quadro NBR e ignora placeholders de seed. */
export function resolveSociosAdministradores(
  representantesDb: Representante[],
  sociosQuadro: Representante[],
): Representante[] {
  const repsReais = representantesDb.filter((r) => !isRepresentantePlaceholder(r.nome));

  if (sociosQuadro.length > 0) {
    const fromQuadro = sociosQuadro
      .filter((s) => s.nome?.trim())
      .map((socio) => mergeSocioComDadosDb(socio, repsReais));

    const quadroNorms = new Set(fromQuadro.map((s) => normalizeNome(s.nome)));
    const extras = repsReais
      .filter((r) => !quadroNorms.has(normalizeNome(r.nome)))
      .map((r) => ({ ...r, origemQuadro: false }));

    return [...fromQuadro, ...extras];
  }

  if (repsReais.length > 0) {
    return repsReais.map((r) => ({ ...r, origemQuadro: false }));
  }

  return [];
}

function mergeSocioComDadosDb(socioQuadro: Representante, repsDb: Representante[]): Representante {
  const nome = socioQuadro.nome.trim();
  const norm = normalizeNome(nome);
  const match = repsDb.find((r) => normalizeNome(r.nome) === norm);
  if (match) {
    return { ...match, nome, origemQuadro: true };
  }
  return { ...socioQuadro, origemQuadro: true };
}

/** @deprecated Use resolveSociosAdministradores */
export function resolveSocioAdministrador(
  representantesDb: Representante[],
  sociosQuadro: Representante[],
): Representante[] {
  return resolveSociosAdministradores(representantesDb, sociosQuadro);
}

export function mapSociosFromCampos(
  campos: Array<{ campo: string; valor: string | null }>,
): Representante[] {
  return campos
    .filter((c) => c.campo.startsWith("incorporador_socio_") && c.valor?.trim())
    .sort((a, b) => a.campo.localeCompare(b.campo))
    .map((c) => ({
      ...representanteFromNomeParcial(c.valor!.trim(), `socio-${c.campo}`),
      origemQuadro: true,
    }));
}

export function mapRepresentante(row: RepresentanteRowEmbed): Representante {
  const endereco = parseEnderecoParts(row.endereco);
  return {
    id: String(row.id),
    nome: row.nome,
    cpf: row.cpf ?? "",
    rg: row.rg ?? "",
    estadoCivil: row.estado_civil ?? "Solteiro(a)",
    regimeComunhao: row.regime_comunhao ?? "",
    rua: endereco.rua,
    numero: endereco.numero,
    cep: endereco.cep,
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    estado: endereco.estado,
  };
}

function normalizeImovelRow(
  imoveis: ImovelRowEmbed | ImovelRowEmbed[] | null,
): ImovelRowEmbed | null {
  if (!imoveis) return null;
  if (Array.isArray(imoveis)) return imoveis[0] ?? null;
  return imoveis;
}

function mapImovel(
  row: EmpreendimentoDetailRowWithJoins,
  areaTerreno: number,
): ImovelView {
  const imovel = normalizeImovelRow(row.imoveis);
  const cidade = emptyOrDash(row.cidade);
  const uf = emptyOrDash(row.uf);

  const loteQuadraBase = normalizeLoteQuadraFields(
    imovel?.lote_numero ?? row.lote ?? "",
    imovel?.quadra_numero ?? row.quadra ?? "",
    imovel?.lote_extenso,
    imovel?.quadra_extenso,
  );

  const areaValor =
    imovel?.area_numero != null ? Number(imovel.area_numero) : areaTerreno > 0 ? areaTerreno : 0;
  const areaExtensoCalculado =
    imovel?.area_extenso?.trim() || (areaValor > 0 ? areaMetrosQuadradosPorExtenso(areaValor) : "");

  const ufBase = imovel?.uf ?? row.uf ?? "";
  const estadoExtensoCalculado =
    imovel?.estado_extenso?.trim() || ufPorExtenso(ufBase) || "";

  const matriculaNumeroBase = imovel?.matricula_numero ?? row.matricula ?? "";
  const matriculaExtensoCalculado =
    imovel?.matricula_extenso?.trim() || matriculaPorExtenso(matriculaNumeroBase);

  if (!imovel) {
    return {
      loteNumero: emptyOrDash(loteQuadraBase.lote),
      loteExtenso: emptyOrDash(loteQuadraBase.loteExtenso),
      quadraNumero: emptyOrDash(loteQuadraBase.quadra),
      quadraExtenso: emptyOrDash(loteQuadraBase.quadraExtenso),
      loteamento: "—",
      cidade,
      comarca: cidade,
      estado: uf,
      estadoExtenso: emptyOrDash(estadoExtensoCalculado),
      areaNumero: areaTerreno > 0 ? fmtNum(areaTerreno, 2) : "—",
      areaExtenso: emptyOrDash(areaExtensoCalculado),
      benfeitorias: "—",
      matriculaNumero: emptyOrDash(matriculaNumeroBase),
      matriculaExtenso: emptyOrDash(matriculaExtensoCalculado),
      cartorio: "—",
      confrontacoes: [],
    };
  }

  const confrontacoes = (imovel.imovel_confrontacoes ?? [])
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => ({
      direcao: c.direcao,
      confrontante: c.confrontante ?? "—",
      medida: c.medida ?? "—",
      azimute: c.azimute ?? "—",
    }));

  const areaNumero =
    imovel.area_numero != null
      ? fmtNum(Number(imovel.area_numero), 2)
      : areaTerreno > 0
        ? fmtNum(areaTerreno, 2)
        : "—";

  return {
    loteNumero: emptyOrDash(loteQuadraBase.lote),
    loteExtenso: emptyOrDash(loteQuadraBase.loteExtenso),
    quadraNumero: emptyOrDash(loteQuadraBase.quadra),
    quadraExtenso: emptyOrDash(loteQuadraBase.quadraExtenso),
    loteamento: emptyOrDash(imovel.loteamento),
    cidade: emptyOrDash(imovel.cidade ?? row.cidade),
    comarca: emptyOrDash(imovel.comarca ?? imovel.cidade ?? row.cidade),
    estado: emptyOrDash(imovel.uf ?? row.uf),
    estadoExtenso: emptyOrDash(estadoExtensoCalculado),
    areaNumero,
    areaExtenso: emptyOrDash(areaExtensoCalculado),
    benfeitorias: emptyOrDash(imovel.benfeitorias),
    matriculaNumero: emptyOrDash(matriculaNumeroBase),
    matriculaExtenso: emptyOrDash(matriculaExtensoCalculado),
    cartorio: emptyOrDash(imovel.cartorio),
    confrontacoes,
  };
}

function mapPendenciasAbertas(pendencias: PendenciaRowEmbed[] | null): PendenciaVisao[] {
  return (pendencias ?? [])
    .filter((p) => p.status === "aberta")
    .map((p) => ({
      tone:
        p.severidade === "bloqueante"
          ? "alerta"
          : p.severidade === "atencao"
            ? "atencao"
            : "ceu",
      texto: p.mensagem,
    }));
}

function mapIncorporadoraEndereco(
  row: EmpreendimentoDetailRowWithJoins,
): IncorporadoraForm {
  const enderecoJson = row.incorporadoras?.endereco ?? null;
  const parts = parseEnderecoParts(enderecoJson);
  const enderecoTexto = formatEnderecoFromJson(enderecoJson);

  return {
    razaoSocial: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "",
    endereco: enderecoTexto || "—",
    cidade: parts.cidade || row.cidade || "",
    estado: parts.estado || row.uf || "",
  };
}

export function mapRowToListItem(row: EmpreendimentoRowWithJoins): EmpreendimentoListItem {
  const dt = row.dados_tecnicos;
  return {
    id: row.id,
    idParam: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    responsavel: dt?.responsavel_tecnico ?? row.profiles?.full_name ?? "—",
    status: row.status,
    statusLabel: getEmpreendimentoStatusLabel(row.status),
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    unidades: dt?.unidades ?? 0,
  };
}

export function mapRowToView(row: EmpreendimentoDetailRowWithJoins): EmpreendimentoView {
  const dt = row.dados_tecnicos;
  const areaTerreno = Number(dt?.area_terreno ?? 0);
  const representantes = (row.incorporadoras?.representantes_legais ?? []).map(mapRepresentante);
  const loteQuadraEmp = normalizeLoteQuadraFields(row.lote ?? "", row.quadra ?? "");

  return {
    id: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    endereco: row.endereco ?? "—",
    lote: emptyOrDash(loteQuadraEmp.lote),
    quadra: emptyOrDash(loteQuadraEmp.quadra),
    matricula: row.matricula ?? "—",
    responsavel: dt?.responsavel_tecnico ?? row.profiles?.full_name ?? "—",
    status: getEmpreendimentoStatusLabel(row.status) as EmpreendimentoStatus,
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    areaTerreno,
    areaGlobal: Number(dt?.area_global ?? 0),
    torres: dt?.torres ?? 0,
    pavimentos: dt?.pavimentos ?? 0,
    unidades: dt?.unidades ?? 0,
    vagas: dt?.vagas ?? 0,
    alvara: dt?.alvara ?? "—",
    dataAprovacao: formatDateBr(dt?.data_aprovacao),
    crea: dt?.crea_cau ?? "—",
    art: dt?.art_rrt ?? "—",
    incorporadoraId: row.incorporadoras?.id ?? null,
    incorporadoraEndereco: mapIncorporadoraEndereco(row),
    representantes,
    imovel: mapImovel(row, areaTerreno),
    cartorioCidade: "",
    responsabilidadeObra: {
      engenheiro: "",
      crea: "",
      art: "",
      formacao: "Engenheiro Civil",
    },
    areaPrivativaTotal: Number(dt?.area_privativa_total ?? 0),
    areaComumTotal: Number(dt?.area_comum_total ?? 0),
    pavimentosAreas: mapCondominioPavimentosEmbed(row.condominio_pavimentos),
    espacosComuns: mapCondominioEspacosComunsEmbed(row.condominio_espacos_comuns),
    pendenciasAbertas: mapPendenciasAbertas(row.pendencias),
  };
}

export function mapCondominioPavimentosEmbed(
  rows: CondominioPavimentoRowEmbed[] | null | undefined,
): CondominioPavimentoView[] {
  const mapped = (rows ?? [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((row) => ({
      id: row.id,
      torre: row.torre?.trim() || null,
      nome: row.nome,
      areaReal: Number(row.area_real ?? 0),
      areaEquivalente: row.area_equivalente != null ? Number(row.area_equivalente) : null,
      ordem: row.ordem,
    }));

  return aggregateCondominioPavimentos(mapped).map((p) => ({
    id: p.id,
    torre: null,
    nome: p.nome,
    areaReal: p.areaReal ?? 0,
    areaEquivalente: p.areaEquivalente,
  }));
}

export function mapCondominioEspacosComunsEmbed(
  rows: CondominioEspacoComumRowEmbed[] | null | undefined,
): CondominioEspacoComumView[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((row) => ({
      id: row.id,
      nome: row.nome,
    }));
}

export { parseBrNumeric } from "@/lib/format";
