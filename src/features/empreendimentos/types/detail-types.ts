export type EmpreendimentoDetailAba =
  | "upload-quadro"
  | "dados-validados"
  | "visao"
  | "memorial"
  | "exportacoes";

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
  /** Nome importado do quadro NBR — não editável manualmente. */
  origemQuadro?: boolean;
};

export type IncorporadoraForm = {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
};

export type Confrontacao = {
  direcao: string;
  confrontante: string;
  medida: string;
  azimute: string;
};

export interface CondominioPavimentoView {
  id: number;
  torre: string | null;
  nome: string;
  areaReal: number;
  areaEquivalente: number | null;
}

export interface CondominioEspacoComumView {
  id: number;
  nome: string;
}

export type PendenciaVisao = {
  tone: "alerta" | "atencao" | "ceu";
  texto: string;
};

export type ResponsabilidadeObraForm = {
  engenheiro: string;
  crea: string;
  art: string;
  formacao: string;
};

export type ImovelView = {
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
