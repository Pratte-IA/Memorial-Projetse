import { Bold, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClausulaNegritoGuiaProps {
  variant?: "compact" | "full";
}

export function ClausulaNegritoGuia({ variant = "full" }: ClausulaNegritoGuiaProps) {
  if (variant === "compact") {
    return (
      <Alert className="border-[var(--color-verde)]/25 bg-[var(--color-verde)]/5 py-2.5 [&>svg]:top-2.5">
        <Info className="h-4 w-4 text-[var(--color-verde-escuro)]" />
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
          Use <code className="font-mono text-[11px]">*asteriscos*</code> no template para negrito no
          PDF. Variáveis:{" "}
          <code className="font-mono text-[11px]">*{"{{empreendimento.nome}}"}*</code>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-[var(--color-verde)]/25 bg-[var(--color-verde)]/5">
      <Bold className="h-4 w-4 text-[var(--color-verde-escuro)]" />
      <AlertTitle className="text-sm text-foreground">Negrito no PDF exportado</AlertTitle>
      <AlertDescription className="space-y-2 text-xs text-muted-foreground">
        <p>
          Envolva com <strong className="font-semibold text-foreground">asteriscos</strong> o trecho
          que deve sair em negrito. Os asteriscos não aparecem no documento final.
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Texto fixo:{" "}
            <code className="font-mono text-[11px]">...convenciona o *Instrumento Particular*...</code>
          </li>
          <li>
            Variável dinâmica:{" "}
            <code className="font-mono text-[11px]">...do *{"{{empreendimento.nome}}"}*, mediante...</code>
          </li>
        </ul>
        <p>
          Dica: selecione o trecho no campo Template e clique em{" "}
          <strong className="font-semibold text-foreground">Negritar seleção</strong>.
        </p>
      </AlertDescription>
    </Alert>
  );
}
