export const MODELOS_DOCUMENTO_BUCKET = "modelos-documento";

export const ACCEPTED_TIMBRADO_EXTENSIONS = [".docx", ".pdf"] as const;

export const MODELO_TIPOS = ["Timbrado memorial"] as const;

export type ModeloTipo = (typeof MODELO_TIPOS)[number];

export const MODELO_TIPO_PADRAO: ModeloTipo = "Timbrado memorial";
