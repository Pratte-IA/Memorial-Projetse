import type { ClausulaRecord } from "@/features/documentos/types";

import { isUnidadesSection } from "./status";
import type { MemorialContextData, SecaoRecord } from "./types";

export const UNIDADES_INTRO =
  "Conforme os Quadros de Informações para Arquivo no Registro de Imóveis em anexo, assim se descrevem as futuras unidades autônomas do condomínio:";

function resolvePath(context: MemorialContextData, path: string): string {
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
