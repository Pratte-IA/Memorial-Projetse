import type { ReactNode } from "react";

const VARIABLE_PATTERN = /\{\{[^}]+\}\}/;
const TEMPLATE_TOKEN_PATTERN = /(\{\{[^}]+\}\}|\*[^*]+\*)/g;

const variableBadgeClass =
  "px-1.5 py-0.5 mx-0.5 text-[12px] rounded bg-[var(--color-verde)]/10 text-[var(--color-verde-escuro)] border border-[var(--color-verde)]/20 font-mono";

function renderVariableBadge(key: number, value: string, bold = false): ReactNode {
  return (
    <code key={key} className={`${variableBadgeClass}${bold ? " font-bold" : ""}`}>
      {value}
    </code>
  );
}

/** Pré-visualização do template com variáveis destacadas e *negrito* conforme exportação PDF. */
export function renderClausulaTemplatePreview(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(TEMPLATE_TOKEN_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, index)}</span>);
    }

    if (token.startsWith("{{") && token.endsWith("}}")) {
      nodes.push(renderVariableBadge(key++, token));
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const inner = token.slice(1, -1);
      if (VARIABLE_PATTERN.test(inner)) {
        nodes.push(renderVariableBadge(key++, inner, true));
      } else {
        nodes.push(
          <strong key={key++} className="font-semibold">
            {inner}
          </strong>,
        );
      }
    } else {
      nodes.push(<span key={key++}>{token}</span>);
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}
