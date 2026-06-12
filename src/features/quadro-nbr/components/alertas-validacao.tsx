import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUADRO_TITULOS } from "../constants";
import type { AlertaValidacao, QuadroId } from "../types";

const MAX_UNIDADES_VISIVEIS = 15;

interface AlertasValidacaoProps {
  alertas: AlertaValidacao[];
  onIrParaQuadro?: (quadroId: QuadroId) => void;
}

function ListaUnidades({ unidades }: { unidades: string[] }) {
  const visiveis = unidades.slice(0, MAX_UNIDADES_VISIVEIS);
  const restantes = unidades.length - visiveis.length;

  return (
    <p className="text-[11px] leading-relaxed opacity-90 mt-1">
      {visiveis.join(" · ")}
      {restantes > 0 && (
        <span className="text-muted-foreground"> · + {restantes} outra(s)</span>
      )}
    </p>
  );
}

export function AlertasValidacao({ alertas, onIrParaQuadro }: AlertasValidacaoProps) {
  if (!alertas.length) return null;

  return (
    <div className="space-y-2">
      {alertas.map((alerta) => {
        const quadrosNavegacao = [
          alerta.quadroOrigem,
          alerta.quadroDestino,
        ].filter((q): q is QuadroId => Boolean(q));

        return (
          <div
            key={alerta.id}
            className={`rounded-md border px-3 py-2 text-xs ${
              alerta.severidade === "erro"
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : alerta.severidade === "aviso"
                  ? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                  : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            <div className="flex items-start gap-2">
              {alerta.severidade === "erro" ? (
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : alerta.severidade === "aviso" ? (
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{alerta.mensagem}</p>

                {alerta.detalhes?.map((detalhe) => (
                  <div key={detalhe.titulo} className="pt-0.5">
                    <p className="text-[11px] font-semibold opacity-90">{detalhe.titulo}</p>
                    <ListaUnidades unidades={detalhe.unidades} />
                  </div>
                ))}

                {onIrParaQuadro && quadrosNavegacao.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {[...new Set(quadrosNavegacao)].map((quadroId) => (
                      <Button
                        key={quadroId}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => onIrParaQuadro(quadroId)}
                      >
                        Abrir {QUADRO_TITULOS[quadroId]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
