import { FileX2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { QuadroId } from "../types";
import { QUADRO_TITULOS } from "../constants";

interface QuadroAusenteStepProps {
  quadroId: QuadroId;
  tituloStep: string;
  nomeArquivo: string;
}

export function QuadroAusenteStep({ quadroId, tituloStep, nomeArquivo }: QuadroAusenteStepProps) {
  return (
    <Card className="p-8 border-border shadow-none">
      <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <FileX2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{tituloStep}</h3>
          <p className="text-sm text-muted-foreground">
            Sem quadro no documento anexado.
          </p>
          <p className="text-xs text-muted-foreground">
            O arquivo <span className="font-medium text-foreground">{nomeArquivo}</span> não contém a
            aba <span className="font-medium text-foreground">{QUADRO_TITULOS[quadroId]}</span>.
            Você pode avançar para o próximo quadro.
          </p>
        </div>
      </div>
    </Card>
  );
}
