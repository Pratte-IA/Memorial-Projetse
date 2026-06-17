import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/use-auth";
import { useUnidades } from "@/features/unidades/hooks";
import {
  ORDEM_PAVIMENTOS,
  NOME_PAVIMENTO_DOC,
  agruparUnidadesPorTorrePavimento,
  gerarDescricaoUnidade,
} from "@/features/unidades/utils/texto-unidade";
import { CheckCircle2, FileText, Loader2, Pencil, RefreshCw, Save, Sparkles, Trash2, X } from "lucide-react";

import { AdicionarClausulaExtraDialog } from "./adicionar-clausula-extra-dialog";
import { SecaoPainelDados } from "../secao-painel-dados";
import { isSecaoExtra, isUnidadesSection, formatSecaoSumarioNumero, maxNumeroClausulaMemorial } from "../status";
import type { SecaoRecord } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAddSecaoExtra,
  useDeleteSecaoExtra,
  useEnsureMemorial,
  useGenerateMemorialCompleto,
  useMemorial,
  useMemorialContext,
  useRegenerateSecao,
  useSaveSecao,
  useUpdateSecaoStatus,
} from "../hooks";

interface MemorialTabProps {
  empreendimentoId: number | null;
  empreendimentoNome: string;
}

export function MemorialTab({ empreendimentoId, empreendimentoNome }: MemorialTabProps) {
  const { membership, profile } = useAuth();
  const { data: memorial, isLoading, isError, refetch } = useMemorial(empreendimentoId);
  const { data: context } = useMemorialContext(empreendimentoId);
  const { data: unidades } = useUnidades(empreendimentoId);

  const ensureMutation = useEnsureMemorial(empreendimentoId);
  const regenerateMutation = useRegenerateSecao(empreendimentoId);
  const saveMutation = useSaveSecao(empreendimentoId);
  const statusMutation = useUpdateSecaoStatus(empreendimentoId);
  const completoMutation = useGenerateMemorialCompleto(empreendimentoId);
  const addExtraMutation = useAddSecaoExtra(empreendimentoId);
  const deleteExtraMutation = useDeleteSecaoExtra(empreendimentoId);

  const [secaoId, setSecaoId] = useState<number | null>(null);
  const [conteudoLocal, setConteudoLocal] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);

  const secoes = memorial?.secoes ?? [];
  const secao = secoes.find((s) => s.id === secaoId) ?? secoes[0] ?? null;

  useEffect(() => {
    if (secoes.length > 0 && secaoId === null) {
      setSecaoId(secoes[0].id);
    }
  }, [secoes, secaoId]);

  useEffect(() => {
    if (secao) {
      setConteudoLocal(secao.conteudo);
      setModoEdicao(false);
    }
  }, [secao]);

  const inicializarMemorial = async () => {
    if (!empreendimentoId || !membership || !profile) return;
    try {
      await ensureMutation.mutateAsync({
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
      toast.success("Memorial inicializado.");
    } catch {
      toast.error("Não foi possível criar o memorial.");
    }
  };

  const regenerar = async () => {
    if (!secao || !memorial || !empreendimentoId || !membership || !profile) return;
    try {
      const conteudo = await regenerateMutation.mutateAsync({
        secaoId: secao.id,
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
      setConteudoLocal(conteudo);
      setModoEdicao(false);
      toast.success("Seção regenerada.");
    } catch {
      toast.error("Não foi possível regenerar a seção.");
    }
  };

  const salvar = async () => {
    if (!secao || !memorial || !empreendimentoId || !membership) return;
    try {
      await saveMutation.mutateAsync({
        secaoId: secao.id,
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        titulo: secao.titulo,
        conteudo: conteudoLocal,
      });
      setModoEdicao(false);
      toast.success("Seção salva.");
    } catch {
      toast.error("Não foi possível salvar.");
    }
  };

  const aprovar = async () => {
    if (!secao || !memorial || !empreendimentoId || !membership || !profile) return;
    try {
      await statusMutation.mutateAsync({
        secaoId: secao.id,
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        titulo: secao.titulo,
        status: "aprovada",
        descricaoAuditoria: `Seção "${secao.titulo}" aprovada.`,
      });
      toast.success("Seção aprovada.");
    } catch {
      toast.error("Não foi possível aprovar.");
    }
  };

  const marcarPendencia = async () => {
    if (!secao || !memorial || !empreendimentoId || !membership || !profile) return;
    try {
      await statusMutation.mutateAsync({
        secaoId: secao.id,
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
        titulo: secao.titulo,
        status: "com_pendencia",
        descricaoAuditoria: `Pendência registrada na seção "${secao.titulo}".`,
      });
      toast.success("Pendência registrada.");
    } catch {
      toast.error("Não foi possível marcar pendência.");
    }
  };

  const gerarCompleto = async () => {
    if (!memorial || !empreendimentoId || !membership || !profile) return;
    try {
      const count = await completoMutation.mutateAsync({
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id,
      });
      toast.success(`Memorial completo gerado (${count} seções).`);
      void refetch();
    } catch {
      toast.error("Não foi possível gerar o memorial completo.");
    }
  };

  const adicionarClausulaExtra = async (input: {
    titulo: string;
    conteudo: string;
    numeroClausula: number;
  }) => {
    if (!memorial || !empreendimentoId || !membership) return;
    try {
      const novaSecaoId = await addExtraMutation.mutateAsync({
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        titulo: input.titulo,
        conteudo: input.conteudo,
        numeroClausula: input.numeroClausula,
      });
      setSecaoId(novaSecaoId);
      toast.success("Cláusula extra adicionada.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível adicionar a cláusula extra.",
      );
    }
  };

  const removerClausulaExtra = async () => {
    if (!secao || !memorial || !empreendimentoId || !membership) return;
    try {
      await deleteExtraMutation.mutateAsync({
        secaoId: secao.id,
        memorialId: memorial.id,
        empreendimentoId,
        organizationId: membership.organization_id,
        titulo: secao.titulo,
      });
      setSecaoId(null);
      toast.success("Cláusula extra removida.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível remover a cláusula extra.",
      );
    }
  };

  if (empreendimentoId === null) {
    return (
      <Card className="p-8 border-border shadow-none text-center text-sm text-muted-foreground">
        Memorial disponível apenas para empreendimentos salvos no banco.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-5">
        <Skeleton className="col-span-3 h-96" />
        <Skeleton className="col-span-6 h-[640px]" />
        <Skeleton className="col-span-3 h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-3">
        <p className="text-sm text-[var(--color-alerta)]">Não foi possível carregar o memorial.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  if (!memorial || secoes.length === 0) {
    return (
      <Card className="p-8 border-border shadow-none text-center space-y-4">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nenhum memorial cadastrado para este empreendimento.
        </p>
        <Button
          size="sm"
          disabled={ensureMutation.isPending}
          onClick={() => void inicializarMemorial()}
        >
          {ensureMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Inicializar memorial
        </Button>
      </Card>
    );
  }

  if (!secao) return null;

  const cancelarEdicao = () => {
    setConteudoLocal(secao.conteudo);
    setModoEdicao(false);
  };

  const isUnidades = isUnidadesSection(secao.titulo);
  const isExtra = isSecaoExtra(secao);
  const unidadesLista = unidades ?? [];
  const maxNumeroClausula = maxNumeroClausulaMemorial(secoes);
  const defaultNumeroExtra =
    secao.ordem > 0 ? Math.min(secao.ordem + 1, maxNumeroClausula + 1) : 1;

  return (
    <div className="grid grid-cols-12 gap-5 min-w-0">
      <Card className="col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Sumário do memorial
          </div>
          <span className="text-[10px] text-muted-foreground">v{memorial.versao}</span>
        </div>
        <nav className="space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {secoes.map((s: SecaoRecord) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecaoId(s.id)}
              className={`w-full text-left px-2.5 py-2 rounded-md text-sm flex items-start gap-2.5 transition-colors ${
                secao.id === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span className="text-[11px] text-mono-tabular text-muted-foreground/70 pt-0.5 w-5 shrink-0">
                {formatSecaoSumarioNumero(s.ordem)}
              </span>
              <span className="flex-1 leading-tight">
                {s.titulo}
                {isSecaoExtra(s) ? (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[var(--color-atencao)]">
                    Extra
                  </span>
                ) : null}
              </span>
              <SectionDot status={s.status} />
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <AdicionarClausulaExtraDialog
            defaultNumero={defaultNumeroExtra}
            maxNumero={maxNumeroClausula}
            disabled={addExtraMutation.isPending}
            isPending={addExtraMutation.isPending}
            onConfirm={adicionarClausulaExtra}
          />
          <Button
            className="w-full"
            size="sm"
            disabled={completoMutation.isPending}
            onClick={() => void gerarCompleto()}
          >
            {completoMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Gerar memorial completo
          </Button>
        </div>
      </Card>

      <Card className="col-span-12 lg:col-span-6 p-0 border-border shadow-none min-w-0">
        <HorizontalScrollArea className="border-b border-border bg-muted/30">
          <div className="flex items-center justify-between gap-4 px-5 py-3 min-w-[28rem]">
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={secao.status} />
              <span className="text-sm font-medium whitespace-nowrap">{secao.titulo}</span>
              {isExtra ? (
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-atencao)]">
                  Extra
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isExtra ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="whitespace-nowrap"
                  disabled={regenerateMutation.isPending}
                  onClick={() => void regenerar()}
                >
                  {regenerateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Regenerar
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="whitespace-nowrap text-[var(--color-alerta)] hover:text-[var(--color-alerta)]"
                      disabled={deleteExtraMutation.isPending}
                    >
                      {deleteExtraMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover cláusula extra?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A cláusula &quot;{secao.titulo}&quot; será excluída deste memorial. O modelo
                        padrão não será afetado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void removerClausulaExtra()}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {modoEdicao ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="whitespace-nowrap"
                    disabled={saveMutation.isPending}
                    onClick={cancelarEdicao}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="whitespace-nowrap"
                    disabled={saveMutation.isPending}
                    onClick={() => void salvar()}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salvar
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="whitespace-nowrap"
                  onClick={() => setModoEdicao(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="whitespace-nowrap"
                disabled={statusMutation.isPending}
                onClick={() => void marcarPendencia()}
              >
                Pendência
              </Button>
              <Button
                size="sm"
                className="whitespace-nowrap"
                disabled={statusMutation.isPending}
                onClick={() => void aprovar()}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
              </Button>
            </div>
          </div>
        </HorizontalScrollArea>
        <div className="px-10 py-10 bg-card min-h-[640px]">
          <div className="max-w-2xl mx-auto">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Memorial de Incorporação — {empreendimentoNome}
            </div>
            <h2 className="text-xl font-semibold mb-5 pb-3 border-b border-border">
              {secao.titulo}
            </h2>

            {isUnidades ? (
              <div className="space-y-6">
                {modoEdicao ? (
                  <Textarea
                    value={conteudoLocal}
                    onChange={(e) => setConteudoLocal(e.target.value)}
                    rows={3}
                    className="text-sm leading-7"
                  />
                ) : (
                  <p className="text-sm leading-7 text-foreground text-justify whitespace-pre-wrap">
                    {conteudoLocal || "—"}
                  </p>
                )}
                {unidadesLista.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada.</p>
                ) : (
                  Object.entries(agruparUnidadesPorTorrePavimento(unidadesLista)).map(
                    ([torre, pavs]) => (
                      <div key={torre} className="space-y-5">
                        <h3 className="text-base font-semibold uppercase tracking-wider pt-4 border-t border-border">
                          {torre}
                        </h3>
                        {ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length).map((pav) => (
                          <div key={pav} className="space-y-3">
                            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase()}
                            </div>
                            {pavs[pav].map((u) => (
                              <p
                                key={u.id}
                                className="text-sm leading-7 text-foreground text-justify"
                              >
                                {gerarDescricaoUnidade(u, { nome: empreendimentoNome })}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    ),
                  )
                )}
              </div>
            ) : secao.status === "nao_gerada" && !conteudoLocal && !modoEdicao ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <div className="text-sm">
                  {isExtra
                    ? "Esta cláusula extra ainda não possui conteúdo."
                    : "Esta seção ainda não foi gerada."}
                </div>
                {isExtra ? (
                  <Button className="mt-4" size="sm" onClick={() => setModoEdicao(true)}>
                    <Pencil className="h-3.5 w-3.5" /> Escrever cláusula
                  </Button>
                ) : (
                  <Button className="mt-4" size="sm" onClick={() => void regenerar()}>
                    <Sparkles className="h-3.5 w-3.5" /> Gerar seção
                  </Button>
                )}
              </div>
            ) : modoEdicao ? (
              <Textarea
                value={conteudoLocal}
                onChange={(e) => setConteudoLocal(e.target.value)}
                rows={18}
                className="text-sm leading-7 min-h-[480px] resize-y"
              />
            ) : (
              <div className="text-sm leading-7 text-foreground text-justify whitespace-pre-wrap min-h-[480px]">
                {conteudoLocal || "—"}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Dados usados na seção
          </div>
          <ul className="space-y-2.5 text-sm">
            <SecaoPainelDados
              titulo={secao.titulo}
              context={context}
              isExtra={isExtra}
              isUnidades={isUnidades}
              unidadesLista={unidadesLista}
            />
          </ul>
        </div>
        <div className="h-px bg-border" />
        <div className="text-[11px] text-muted-foreground">
          Memorial {memorial.statusLabel} · atualizado em{" "}
          {new Date(secao.updatedAt).toLocaleDateString("pt-BR")}
        </div>
      </Card>
    </div>
  );
}

function SectionDot({ status }: { status: string }) {
  const label =
    status === "aprovada"
      ? "Aprovada"
      : status === "com_pendencia"
        ? "Com pendência"
        : status === "em_revisao"
          ? "Em revisão"
          : status === "gerada"
            ? "Gerada"
            : "Não gerada";
  const c =
    label === "Aprovada"
      ? "bg-[var(--color-verde-claro)]"
      : label === "Com pendência"
        ? "bg-[var(--color-alerta)]"
        : label === "Em revisão"
          ? "bg-[var(--color-atencao)]"
          : label === "Gerada"
            ? "bg-[var(--color-ceu)]"
            : "bg-border";
  return <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${c}`} />;
}
