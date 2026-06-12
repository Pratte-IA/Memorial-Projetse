export type QuadroId =
  | "preliminares"
  | "qi"
  | "qii"
  | "qiii"
  | "qiva"
  | "qivb"
  | "qv"
  | "qvi"
  | "qvii"
  | "qviii"
  | "qcomp"
  | "resumo";

export interface CelulaFonte {
  sheet: string;
  row: number;
  col: number;
}

export interface CampoExtraido {
  chave: string;
  rotulo: string;
  valor: string;
  fonte?: CelulaFonte;
  /** Agrupamento visual (ex.: seções do Quadro III). */
  grupo?: string;
}

/** Casas decimais originais do documento, por campo da linha. */
export interface WithFormatDecimals {
  formatDecimals?: Record<string, number>;
}

export interface CabecalhoPadrao {
  empreendimento: string;
  logradouro: string;
  loteQuadra: string;
  municipioUf: string;
  incorporadorNome: string;
  incorporadorSocios: string[];
  responsavelNome: string;
  responsavelCrea: string;
}

export interface LinhaPavimento extends WithFormatDecimals {
  torre?: string;
  pavimento: string;
  areaPrivativaCobertaPadrao: number | null;
  areaPrivativaCobertaDiferenteReal: number | null;
  areaPrivativaCobertaDiferenteEquivalente: number | null;
  areaPrivativaTotalReal: number | null;
  areaPrivativaTotalEquivalente: number | null;
  areaUsoComumNaoPropCobertaPadrao: number | null;
  areaUsoComumNaoPropCobertaDiferenteReal: number | null;
  areaUsoComumNaoPropCobertaDiferenteEquivalente: number | null;
  areaUsoComumNaoPropTotalReal: number | null;
  areaUsoComumNaoPropTotalEquivalente: number | null;
  areaUsoComumPropCobertaPadrao: number | null;
  areaUsoComumPropCobertaDiferenteReal: number | null;
  areaUsoComumPropCobertaDiferenteEquivalente: number | null;
  areaUsoComumPropTotalReal: number | null;
  areaUsoComumPropTotalEquivalente: number | null;
  areaPavimentoReal: number | null;
  areaPavimentoEquivalente: number | null;
  quantidadePavimentosIdenticos: number | null;
}

export interface TotaisQuadroI {
  areaRealGlobal: number | null;
  areaEquivalenteGlobal: number | null;
}

export interface LinhaUnidadeArea extends WithFormatDecimals {
  designacao: string;
  bloco: string;
  areaPrivativaCobertaPadrao: number | null;
  areaPrivativaCobertaDiferenteReal: number | null;
  areaPrivativaCobertaDiferenteEquivalente: number | null;
  areaPrivativaTotalReal: number | null;
  areaPrivativaTotalEquivalente: number | null;
  areaUsoComumNaoPropCobertaPadrao: number | null;
  areaUsoComumNaoPropCobertaDiferenteReal: number | null;
  areaUsoComumNaoPropCobertaDiferenteEquivalente: number | null;
  areaUsoComumNaoPropTotalReal: number | null;
  areaUsoComumNaoPropTotalEquivalente: number | null;
  coeficienteProporcionalidade: number | null;
  areaUnidadeReal: number | null;
  areaUnidadeEquivalente: number | null;
}

export interface LinhaUnidadeReal extends WithFormatDecimals {
  designacao: string;
  bloco: string;
  areaPrivativaPrincipal: number | null;
  areaPrivativaAcessoria: number | null;
  areaPrivativaTotal: number | null;
  areaUsoComum: number | null;
  areaRealTotal: number | null;
  coeficienteProporcionalidade: number | null;
  quantidadeIdenticas: number | null;
  observacoes: string;
}

export interface ConfrontacaoLabels {
  norte: string;
  sul: string;
  leste: string;
  oeste: string;
}

export interface LinhaResumo extends WithFormatDecimals {
  designacao: string;
  bloco: string;
  areaPrivativaPrincipal: number | null;
  areaPrivativaAcessoria: number | null;
  areaComum: number | null;
  areaTotal: number | null;
  fracaoPredial: number | null;
  fracaoTerrenoPercentual: number | null;
  fracaoTerrenoM2: number | null;
  valorUnidade: number | null;
  confrontacaoNorte: string;
  confrontacaoSul: string;
  confrontacaoLeste: string;
  confrontacaoOeste: string;
}

export interface LinhaEquipamento {
  equipamento: string;
  tipoMarca: string;
  acabamento: string;
}

export interface LinhaAcabamento {
  dependencia: string;
  /** Subtítulo de grupo no memorial (ex.: Apartamentos, Estacionamento) — sem dados de acabamento. */
  isSecao?: boolean;
  pisoRevestimento: string;
  pisoAcabamento: string;
  pisoSoleira: string;
  paredeRevestimento: string;
  paredeAcabamento: string;
  paredeRodape: string;
  tetoRevestimento: string;
  tetoAcabamento: string;
  peitoril: string;
}

export interface QuadroExtraidoBase {
  id: QuadroId;
  titulo: string;
  folha: number | null;
  totalFolhas: number | null;
  cabecalho: CabecalhoPadrao;
  fontePreview: string[][];
}

export interface QuadroPreliminares extends QuadroExtraidoBase {
  id: "preliminares";
  campos: CampoExtraido[];
}

export interface QuadroI extends QuadroExtraidoBase {
  id: "qi";
  linhas: LinhaPavimento[];
  totais: TotaisQuadroI;
  observacoes: string;
}

export interface QuadroII extends QuadroExtraidoBase {
  id: "qii";
  linhas: LinhaUnidadeArea[];
}

export interface QuadroIII extends QuadroExtraidoBase {
  id: "qiii";
  campos: CampoExtraido[];
}

export interface QuadroIVA extends QuadroExtraidoBase {
  id: "qiva";
  linhas: Array<
    WithFormatDecimals & {
      designacao: string;
      bloco: string;
      areaEquivalente: number | null;
      custo: number | null;
      coeficienteProporcionalidade: number | null;
      quantidadeIdenticas: number | null;
    }
  >;
}

export interface QuadroIVB extends QuadroExtraidoBase {
  id: "qivb";
  linhas: LinhaUnidadeReal[];
}

export interface QuadroV extends QuadroExtraidoBase {
  id: "qv";
  campos: CampoExtraido[];
  textosDescritivos: CampoExtraido[];
}

export interface QuadroVI extends QuadroExtraidoBase {
  id: "qvi";
  linhas: LinhaEquipamento[];
}

export interface QuadroVII extends QuadroExtraidoBase {
  id: "qvii";
  linhas: LinhaAcabamento[];
}

export interface QuadroVIII extends QuadroExtraidoBase {
  id: "qviii";
  linhas: LinhaAcabamento[];
}

export interface QuadroComplementar extends QuadroExtraidoBase {
  id: "qcomp";
  linhas: LinhaPavimento[];
  totais: TotaisQuadroI;
  observacoes: string;
}

export interface QuadroResumo extends QuadroExtraidoBase {
  id: "resumo";
  linhas: LinhaResumo[];
  confrontacaoLabels: ConfrontacaoLabels;
}

export type QuadroExtraido =
  | QuadroPreliminares
  | QuadroI
  | QuadroII
  | QuadroIII
  | QuadroIVA
  | QuadroIVB
  | QuadroV
  | QuadroVI
  | QuadroVII
  | QuadroVIII
  | QuadroComplementar
  | QuadroResumo;

export interface DocumentoNbrExtraido {
  nomeArquivo: string;
  quadros: QuadroExtraido[];
  preliminares: QuadroPreliminares;
  /** IDs dos quadros encontrados no arquivo (exceto preliminares, sempre presente). */
  quadrosPresentes: QuadroId[];
}

export type SeveridadeAlerta = "erro" | "aviso" | "info";

export interface AlertaValidacaoDetalhe {
  titulo: string;
  unidades: string[];
}

export interface AlertaValidacao {
  id: string;
  severidade: SeveridadeAlerta;
  quadroOrigem: QuadroId;
  quadroDestino?: QuadroId;
  mensagem: string;
  /** Listas de unidades para divergências de contagem ou área. */
  detalhes?: AlertaValidacaoDetalhe[];
}

export interface ResultadoValidacao {
  alertas: AlertaValidacao[];
  podeAvancar: boolean;
}
