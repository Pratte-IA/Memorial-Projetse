import { Card } from "@/components/ui/card";
import { AlertasValidacao } from "./alertas-validacao";
import type { AlertaValidacao, QuadroId } from "../types";

interface QuadroStepLayoutProps {
  titulo: string;
  descricao: string;
  alertas?: AlertaValidacao[];
  onIrParaQuadro?: (quadroId: QuadroId) => void;
  children: React.ReactNode;
}

export function QuadroStepLayout({
  titulo,
  descricao,
  alertas = [],
  onIrParaQuadro,
  children,
}: QuadroStepLayoutProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
      </div>

      <AlertasValidacao alertas={alertas} onIrParaQuadro={onIrParaQuadro} />

      <Card className="p-4 border-border shadow-none space-y-4">{children}</Card>
    </div>
  );
}
