export type EmpreendimentoDetailAba =
  | "visao"
  | "quadro"
  | "dados"
  | "condominio"
  | "unidades"
  | "memorial"
  | "exportacoes"
  | "historico";

export type Representante = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  estadoCivil: string;
  regimeComunhao: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type IncorporadoraForm = {
  razaoSocial: string;
  cnpj: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type Confrontacao = {
  direcao: string;
  confrontante: string;
  medida: string;
  azimute: string;
};

export type ImovelMock = {
  loteNumero: string;
  loteExtenso: string;
  quadraNumero: string;
  quadraExtenso: string;
  loteamento: string;
  cidade: string;
  comarca: string;
  estado: string;
  estadoExtenso: string;
  areaNumero: string;
  areaExtenso: string;
  benfeitorias: string;
  matriculaNumero: string;
  matriculaExtenso: string;
  cartorio: string;
  confrontacoes: Confrontacao[];
};
