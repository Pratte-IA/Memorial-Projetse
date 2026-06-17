import type { ImovelView, Representante } from "../types/detail-types";

export const REPRESENTANTE_VAZIO: Representante = {
  id: "",
  nome: "",
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

export const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União estável",
];

export const REGIMES = [
  "Comunhão parcial de bens",
  "Comunhão universal de bens",
  "Separação total de bens",
  "Separação obrigatória de bens",
  "Participação final nos aquestos",
];

/** Dados de demonstração — não usar na tela de detalhe de empreendimentos reais. */
export const IMOVEL_MOCK: ImovelView = {
  loteNumero: "13",
  loteExtenso: "treze",
  quadraNumero: "4",
  quadraExtenso: "quatro",
  loteamento: "MADRID",
  cidade: "CASCAVEL",
  comarca: "CASCAVEL",
  estado: "PR",
  estadoExtenso: "PARANÁ",
  areaNumero: "2.763,00",
  areaExtenso: "dois mil, setecentos e sessenta e três metros quadrados",
  benfeitorias: "Sem benfeitorias",
  matriculaNumero: "76.476",
  matriculaExtenso: "setenta e seis mil, quatrocentos e setenta e seis",
  cartorio: "Terceiro Registro de Imóveis de Cascavel-PR",
  confrontacoes: [
    {
      direcao: "Noroeste",
      confrontante: "Lotes nº 1 a 12",
      medida: "90,00 metros",
      azimute: "55°19’53”",
    },
    {
      direcao: "Nordeste",
      confrontante: "Rua Ilhas Canárias",
      medida: "30,70 metros",
      azimute: "145°19’53”",
    },
    {
      direcao: "Sudeste",
      confrontante: "Lote nº 14 - área institucional",
      medida: "90,00 metros",
      azimute: "235°19’53”",
    },
    {
      direcao: "Sudoeste",
      confrontante:
        "parte dos Lotes nº 3 e 6, e com os Lotes nº 4 e 5, todos da Quadra nº 23, do Loteamento Barcelona",
      medida: "30,70 metros",
      azimute: "325°19’53”",
    },
  ],
};

export const PAVIMENTOS_MOCK = [
  { nome: "Pavimento Térreo", area: 844.26 },
  { nome: "1º Pavimento", area: 567.33 },
  { nome: "2º Pavimento", area: 567.33 },
  { nome: "3º Pavimento", area: 567.33 },
  { nome: "4º Pavimento", area: 567.33 },
];

export const AREAS_COMUNS_MOCK = [
  "Central GLP",
  "Lixo",
  "Circulação/Hall",
  "Escada",
  "Circulação de Veículos",
  "Salão de Festas",
  "Castelo d'água",
];

export const EMPREENDIMENTO_DETAIL_ABAS: {
  id: import("../types/detail-types").EmpreendimentoDetailAba;
  label: string;
}[] = [
  { id: "upload-quadro", label: "Upload do Quadro" },
  { id: "dados-validados", label: "Dados validados" },
  { id: "visao", label: "Cadastro complementar" },
  { id: "memorial", label: "Memorial" },
  { id: "exportacoes", label: "Exportações" },
];
