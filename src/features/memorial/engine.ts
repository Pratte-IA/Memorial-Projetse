import type { ClausulaRecord } from "@/features/documentos/types";

import { isUnidadesSection } from "./status";
import type { MemorialContextData, SecaoRecord } from "./types";

export const UNIDADES_INTRO =
  "Conforme os documentos identificados na Cláusula anterior e os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, que ficam fazendo parte integrante deste Instrumento, estes últimos de acordo com a Norma Brasileira nº 12.721/2006, da Associação Brasileira de Normas Técnicas – ABNT e com a mencionada Lei nº 4.591, assim se descrevem as futuras unidades autônomas do condomínio:";

function resolvePath(context: MemorialContextData, path: string): string {
  const root = context as unknown as Record<string, unknown>;
  if (path in root && (typeof root[path] === "string" || typeof root[path] === "number")) {
    const value = root[path];
    if (value === null || value === "") return `{{${path}}}`;
    return String(value);
  }

  const parts = path.split(".");
  let current: unknown = context;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return `{{${path}}}`;
    current = (current as Record<string, unknown>)[part];
  }

  if (current == null || current === "") return `{{${path}}}`;
  return String(current);
}

export function renderTemplate(template: string, context: MemorialContextData): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawPath: string) => {
    const path = rawPath.trim();
    return resolvePath(context, path);
  });
}

export function findClausulaForSecao(
  secao: SecaoRecord,
  clausulas: ClausulaRecord[],
): ClausulaRecord | null {
  if (secao.clausulaId) {
    return clausulas.find((c) => c.id === secao.clausulaId) ?? null;
  }
  return (
    clausulas.find((c) => c.titulo === secao.titulo) ??
    clausulas.find((c) => c.ordem === secao.ordem) ??
    null
  );
}

export function generateSecaoConteudo(
  secao: SecaoRecord,
  clausulas: ClausulaRecord[],
  context: MemorialContextData,
): string {
  if (isUnidadesSection(secao.titulo)) {
    return UNIDADES_INTRO;
  }

  const clausula = findClausulaForSecao(secao, clausulas);
  if (clausula?.template) {
    return renderTemplate(clausula.template, context);
  }

  return secao.conteudo;
}
