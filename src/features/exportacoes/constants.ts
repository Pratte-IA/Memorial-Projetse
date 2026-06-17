export const DOCUMENTOS_EXPORTADOS_BUCKET = "documentos-exportados";

export function buildMemorialTituloPadrao(empreendimentoNome: string): string {
  const nome = empreendimentoNome.trim().toUpperCase();
  return `INSTRUMENTO PARTICULAR DE MEMORIAL DE INCORPORAÇÃO, CONVENÇÃO CONDOMINIAL, MEMORIAL DESCRITIVO DO EMPREENDIMENTO E REGIMENTO INTERNO DO ${nome}`;
}
