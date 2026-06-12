import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  fmtNum,
  normalizeLoteQuadraFields,
  parseBrNumeric,
  ufPorExtenso,
} from "@/lib/format";
import { areaMetrosQuadradosPorExtenso } from "@/lib/numero-extenso";
import type { EmpreendimentoStatus } from "@/lib/mock-data";

import { getEmpreendimentoStatusLabel } from "./status";
import type { EmpreendimentoListItem, EmpreendimentoView } from "./types";
import type {
  IncorporadoraForm,
  ImovelView,
  PendenciaVisao,
  Representante,
} from "./types/detail-types";

type EnderecoJson = Record<string, unknown> | null;

type IncorporadoraListEmbed = { razao_social: string; cnpj: string | null } | null;
type IncorporadoraDetailEmbed = {
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
};

function emptyOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function formatDateBr(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

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

export function mapSociosFromCampos(
  campos: Array<{ campo: string; valor: string | null }>,
): Representante[] {
  return campos
    .filter((c) => c.campo.startsWith("incorporador_socio_") && c.valor?.trim())
    .sort((a, b) => a.campo.localeCompare(b.campo))
    .map((c) => representanteFromNomeParcial(c.valor!.trim(), `socio-${c.campo}`));
}

function mapRepresentante(row: RepresentanteRowEmbed): Representante {
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
      matriculaNumero: emptyOrDash(row.matricula),
      matriculaExtenso: "—",
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
    matriculaNumero: emptyOrDash(imovel.matricula_numero ?? row.matricula),
    matriculaExtenso: emptyOrDash(imovel.matricula_extenso),
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
    incorporadoraEndereco: mapIncorporadoraEndereco(row),
    representantes,
    imovel: mapImovel(row, areaTerreno),
    areaPrivativaTotal: Number(dt?.area_privativa_total ?? 0),
    areaComumTotal: Number(dt?.area_comum_total ?? 0),
    pendenciasAbertas: mapPendenciasAbertas(row.pendencias),
  };
}

export { parseBrNumeric } from "@/lib/format";
