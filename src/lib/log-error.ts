interface ErrorContext {
  scope?: string;
  metadata?: Record<string, unknown>;
}

/** Log estruturado de erros no client/SSR para facilitar diagnóstico. */
export function logError(error: unknown, context?: ErrorContext): void {
  const payload = {
    scope: context?.scope ?? "app",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    metadata: context?.metadata,
    at: new Date().toISOString(),
  };

  console.error("[Memorial-Projetse]", payload);
}
