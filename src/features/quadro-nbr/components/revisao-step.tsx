import { Card } from "@/components/ui/card";
import { fmtNum } from "@/lib/format";
import type { DocumentoNbrExtraido, QuadroId } from "../types";
import { getQuadroById } from "../parser";
import { getQuadroIvBTitulo, isDocumentoQuadroIvB1 } from "../quadro-iv";
import { AlertasValidacao } from "./alertas-validacao";
import { validarCruzamento } from "../validation";

interface RevisaoStepProps {
  documento: DocumentoNbrExtraido;
  onIrParaQuadro?: (quadroId: QuadroId) => void;
  somenteLeitura?: boolean;
}

export function RevisaoStep({ documento, onIrParaQuadro, somenteLeitura }: RevisaoStepProps) {
  const cruzamento = validarCruzamento(documento);
  const qi = getQuadroById(documento, "qi");
  const qii = getQuadroById(documento, "qii");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");
  const tituloQivb = getQuadroIvBTitulo(documento);
  const modoB1 = isDocumentoQuadroIvB1(documento);

  const nome =
    documento.preliminares.campos.find((c) => c.chave === "projeto_nome")?.valor ??
    documento.preliminares.cabecalho.empreendimento;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Revisão cruzada</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {somenteLeitura
            ? "Consistência verificada na importação. Consulte os alertas abaixo se houver divergências."
            : "Confira a consistência entre os quadros antes de criar o empreendimento."}
        </p>
      </div>

      <AlertasValidacao alertas={cruzamento.alertas} onIrParaQuadro={onIrParaQuadro} />

      {!cruzamento.alertas.length && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          Nenhuma divergência crítica detectada entre os quadros analisados.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-border shadow-none space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Empreendimento
          </p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium text-right">{nome || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Arquivo</dt>
              <dd className="font-medium text-right">{documento.nomeArquivo}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Quadros extraídos</dt>
              <dd className="font-medium text-right">{documento.quadros.length}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4 border-border shadow-none space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Consistência
          </p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pavimentos (QI)</dt>
              <dd className="font-medium text-mono-tabular">{qi?.linhas.length ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Unidades (QII)</dt>
              <dd className="font-medium text-mono-tabular">{qii?.linhas.length ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Unidades ({tituloQivb.replace("Quadro ", "")})</dt>
              <dd className="font-medium text-mono-tabular">{qivb?.linhas.length ?? 0}</dd>
            </div>
            {modoB1 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Modo IV B.1</dt>
                <dd className="font-medium text-right text-xs">Substitui IV A e IV B</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Unidades (Resumo)</dt>
              <dd className="font-medium text-mono-tabular">{resumo?.linhas.length ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Área real global</dt>
              <dd className="font-medium text-mono-tabular">
                {qi?.totais.areaRealGlobal !== null && qi?.totais.areaRealGlobal !== undefined
                  ? fmtNum(qi.totais.areaRealGlobal, 2)
                  : "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
