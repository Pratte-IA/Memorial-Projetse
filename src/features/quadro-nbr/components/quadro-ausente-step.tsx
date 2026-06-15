import { FileX2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DocumentoNbrExtraido, QuadroId } from "../types";
import { QUADRO_TITULOS } from "../constants";
import { mensagemQuadroIvAusente } from "../quadro-iv";

interface QuadroAusenteStepProps {
  quadroId: QuadroId;
  tituloStep: string;
  nomeArquivo: string;
  documento?: DocumentoNbrExtraido;
}

export function QuadroAusenteStep({
  quadroId,
  tituloStep,
  nomeArquivo,
  documento,
}: QuadroAusenteStepProps) {
  const mensagemEsperada =
    documento && (quadroId === "qiva" || quadroId === "qivb")
      ? mensagemQuadroIvAusente(quadroId, documento)
      : undefined;

  const Icon = mensagemEsperada ? Info : FileX2;

  return (
    <Card className="p-8 border-border shadow-none">
      <div className="flex flex-col items-center gap-4 text-center max-w-lg mx-auto">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            mensagemEsperada ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${mensagemEsperada ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{tituloStep}</h3>
          {mensagemEsperada ? (
            <>
              <p className="text-sm text-muted-foreground">{mensagemEsperada}</p>
              <p className="text-xs text-muted-foreground">
                Você pode avançar para o próximo quadro.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Sem quadro no documento anexado.</p>
              <p className="text-xs text-muted-foreground">
                O arquivo <span className="font-medium text-foreground">{nomeArquivo}</span> não
                contém a aba{" "}
                <span className="font-medium text-foreground">{QUADRO_TITULOS[quadroId]}</span>.
                Você pode avançar para o próximo quadro.
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
