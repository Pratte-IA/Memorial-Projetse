import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QueryLoadingProps {
  rows?: number;
  className?: string;
}

export function QueryLoading({ rows = 3, className }: QueryLoadingProps) {
  return (
    <div className={className ?? "space-y-3"} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: QueryErrorProps) {
  return (
    <Card className="p-8 border-border shadow-none text-center space-y-3" role="alert">
      <p className="text-sm text-[var(--color-alerta)]">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={() => void onRetry()}>
          Tentar novamente
        </Button>
      ) : null}
    </Card>
  );
}

interface QueryEmptyProps {
  message?: string;
}

export function QueryEmpty({ message = "Nenhum registro encontrado." }: QueryEmptyProps) {
  return (
    <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
      {message}
    </Card>
  );
}
