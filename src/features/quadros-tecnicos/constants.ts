export const QUADROS_TECNICOS_BUCKET = "quadros-tecnicos";

export const MAX_QUADRO_FILE_BYTES = 52_428_800; // 50 MB

export const QUADRO_ACCEPTED_MIME = "application/pdf";

export const EXTRACAO_ETAPAS = [
  "Lendo arquivo...",
  "Identificando tabelas...",
  "Extraindo dados do empreendimento...",
  "Extraindo unidades...",
  "Conferindo áreas...",
  "Extração concluída",
] as const;
