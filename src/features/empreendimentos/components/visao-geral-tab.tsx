import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  HardHat,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { matriculaPorExtenso } from "@/lib/numero-extenso";
import { useAuth } from "@/features/auth/use-auth";

import { REPRESENTANTE_VAZIO } from "../constants/detail-mocks";
import {
  confrontacaoItemEstaCompleta,
  confrontacoesFromView,
  criarConfrontacaoVazia,
  labelDirecaoConfrontacao,
  OPCOES_DIRECAO_CONFRONTACAO,
  type ConfrontacaoItem,
} from "../constants/cadastro-complementar";
import type { EmpreendimentoView } from "../types";
import type { Representante, ResponsabilidadeObraForm } from "../types/detail-types";
import {
  useDeleteRepresentanteLegal,
  useSaveRepresentanteLegal,
  useUpdateCadastroImovel,
  useUpdateResponsabilidadeObra,
} from "../hooks";
import { Field, Pendencia, SectionTitle } from "./detail-ui";
import { ProntidaoExportacaoPanel } from "./prontidao-exportacao-panel";
import { RepresentanteModal } from "./representante-modal";

function dashToEmpty(value: string): string {
  return value === "—" ? "" : value;
}

function sociosFromEmp(emp: EmpreendimentoView): Representante[] {
  return emp.representantes;
}

function imovelFormFromEmp(emp: EmpreendimentoView) {
  const imovel = emp.imovel;
  return {
    matriculaNumero: dashToEmpty(imovel.matriculaNumero !== "—" ? imovel.matriculaNumero : emp.matricula),
    cartorio: dashToEmpty(imovel.cartorio),
    cartorioCidade: dashToEmpty(emp.cartorioCidade),
    loteamento: dashToEmpty(imovel.loteamento),
    confrontacoes: confrontacoesFromView(imovel.confrontacoes),
  };
}

function responsabilidadeFromEmp(emp: EmpreendimentoView): ResponsabilidadeObraForm {
  return {
    engenheiro: emp.responsabilidadeObra.engenheiro,
    crea: emp.responsabilidadeObra.crea,
    art: emp.responsabilidadeObra.art,
    formacao: emp.responsabilidadeObra.formacao || "Engenheiro Civil",
  };
}

export function VisaoGeralTab({ emp }: { emp: EmpreendimentoView }) {
  const { membership } = useAuth();
  const router = useRouter();
  const empreendimentoId = Number(emp.id);
  const incorporadoraId = emp.incorporadoraId;

  const [imovelForm, setImovelForm] = useState(imovelFormFromEmp(emp));
  const [responsabilidade, setResponsabilidade] = useState(responsabilidadeFromEmp(emp));
  const [representantes, setRepresentantes] = useState<Representante[]>(sociosFromEmp(emp));

  const [editando, setEditando] = useState<Representante | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const updateImovelMutation = useUpdateCadastroImovel();
  const updateResponsabilidadeMutation = useUpdateResponsabilidadeObra();
  const saveRepresentanteMutation = useSaveRepresentanteLegal();
  const deleteRepresentanteMutation = useDeleteRepresentanteLegal();

  useEffect(() => {
    setImovelForm(imovelFormFromEmp(emp));
    setResponsabilidade(responsabilidadeFromEmp(emp));
    setRepresentantes(sociosFromEmp(emp));
  }, [emp]);

  const setImovel = <K extends keyof typeof imovelForm>(key: K, value: (typeof imovelForm)[K]) =>
    setImovelForm((prev) => ({ ...prev, [key]: value }));

  const setConfrontacao = (formId: string, patch: Partial<ConfrontacaoItem>) => {
    setImovelForm((prev) => ({
      ...prev,
      confrontacoes: prev.confrontacoes.map((c) =>
        c.formId === formId ? { ...c, ...patch } : c,
      ),
    }));
  };

  const adicionarConfrontacao = () => {
    setImovelForm((prev) => ({
      ...prev,
      confrontacoes: [...prev.confrontacoes, criarConfrontacaoVazia()],
    }));
  };

  const removerConfrontacao = (formId: string) => {
    setImovelForm((prev) => ({
      ...prev,
      confrontacoes: prev.confrontacoes.filter((c) => c.formId !== formId),
    }));
  };

  const setResp = <K extends keyof ResponsabilidadeObraForm>(
    key: K,
    value: ResponsabilidadeObraForm[K],
  ) => setResponsabilidade((prev) => ({ ...prev, [key]: value }));

  const abrirNovo = () => {
    setEditando({ ...REPRESENTANTE_VAZIO, id: `rep-${Date.now()}`, origemQuadro: false });
    setModalAberto(true);
  };

  const abrirEdicao = (r: Representante) => {
    setEditando({ ...r });
    setModalAberto(true);
  };

  const podeRemover = (r: Representante) => !r.origemQuadro;

  const remover = async (r: Representante) => {
    if (!membership || empreendimentoId <= 0 || !podeRemover(r)) return;

    try {
      if (/^\d+$/.test(r.id)) {
        await deleteRepresentanteMutation.mutateAsync({
          organizationId: membership.organization_id,
          empreendimentoId,
          representanteId: r.id,
          nome: r.nome || "Sócio",
        });
      }
      setRepresentantes((arr) => arr.filter((x) => x.id !== r.id));
      await router.invalidate();
      toast.success("Sócio removido.");
    } catch {
      toast.error("Não foi possível remover o sócio.");
    }
  };

  const salvarRepresentante = async (r: Representante) => {
    if (!membership || empreendimentoId <= 0) {
      toast.error("Empreendimento inválido para salvar.");
      return;
    }

    if (!incorporadoraId) {
      toast.error("Incorporadora não vinculada ao empreendimento.");
      return;
    }

    try {
      const salvo = await saveRepresentanteMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId,
        incorporadoraId,
        representante: r,
      });

      setRepresentantes((arr) => {
        const idx = arr.findIndex((x) => x.id === r.id);
        if (idx >= 0) {
          const novo = [...arr];
          novo[idx] = salvo;
          return novo;
        }
        return [...arr, salvo];
      });

      await router.invalidate();
      setModalAberto(false);
      setEditando(null);
      toast.success("Sócio administrador salvo.");
    } catch {
      toast.error("Não foi possível salvar o sócio administrador.");
    }
  };

  const salvarImovel = async () => {
    if (!membership || empreendimentoId <= 0) {
      toast.error("Empreendimento inválido para salvar.");
      return;
    }

    try {
      await updateImovelMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId,
        matriculaNumero: imovelForm.matriculaNumero,
        cartorio: imovelForm.cartorio,
        cartorioCidade: imovelForm.cartorioCidade,
        loteamento: imovelForm.loteamento,
        confrontacoes: imovelForm.confrontacoes.map(({ formId: _id, ...c }) => c),
      });
      await router.invalidate();
      toast.success("Dados do imóvel salvos.");
    } catch {
      toast.error("Não foi possível salvar os dados do imóvel.");
    }
  };

  const salvarResponsabilidade = async () => {
    if (!membership || empreendimentoId <= 0) {
      toast.error("Empreendimento inválido para salvar.");
      return;
    }

    try {
      await updateResponsabilidadeMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId,
        responsabilidade,
      });
      await router.invalidate();
      toast.success("Responsabilidade técnica salva.");
    } catch {
      toast.error("Não foi possível salvar a responsabilidade técnica.");
    }
  };

  const pendenciasJuridicas: { tone: "alerta" | "atencao" | "ceu"; texto: string }[] = [];

  if (!imovelForm.matriculaNumero.trim()) {
    pendenciasJuridicas.push({ tone: "alerta", texto: "Número da matrícula não informado" });
  }
  if (!imovelForm.cartorio.trim()) {
    pendenciasJuridicas.push({ tone: "atencao", texto: "Cartório de registro não informado" });
  }
  if (!imovelForm.loteamento.trim()) {
    pendenciasJuridicas.push({
      tone: "atencao",
      texto: "Loteamento não informado para a Cláusula Primeira",
    });
  }
  const confrontacoesCompletas = imovelForm.confrontacoes.filter(confrontacaoItemEstaCompleta).length;
  if (confrontacoesCompletas === 0) {
    pendenciasJuridicas.push({
      tone: "atencao",
      texto: "Nenhuma confrontação completa cadastrada",
    });
  }

  representantes.forEach((r) => {
    if (!r.cpf?.trim()) {
      pendenciasJuridicas.push({
        tone: "alerta",
        texto: `${r.nome?.trim() || "Sócio administrador"} sem CPF`,
      });
    }
    if (r.estadoCivil === "Casado(a)" && !r.regimeComunhao) {
      pendenciasJuridicas.push({
        tone: "atencao",
        texto: `${r.nome?.trim() || "Sócio administrador"} sem regime de bens`,
      });
    }
  });

  if (!responsabilidade.engenheiro.trim() || !responsabilidade.crea.trim() || !responsabilidade.art.trim()) {
    pendenciasJuridicas.push({
      tone: "atencao",
      texto: "Responsabilidade técnica da execução da obra incompleta",
    });
  }

  const pendenciasVisao = [...emp.pendenciasAbertas, ...pendenciasJuridicas];
  const matriculaExtensoPreview = matriculaPorExtenso(imovelForm.matriculaNumero);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={MapPin}>Propriedade e localização do imóvel</SectionTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Apenas dados que não vêm do quadro NBR validado — lote, quadra e área são preenchidos
                automaticamente.
              </p>
            </div>
            <Button
              size="sm"
              onClick={salvarImovel}
              disabled={!empreendimentoId || updateImovelMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              {updateImovelMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Loteamento">
              <Input
                value={imovelForm.loteamento}
                onChange={(e) => setImovel("loteamento", e.target.value)}
                placeholder="Ex.: MADRID"
              />
            </Field>
            <Field label="Número da matrícula">
              <Input
                value={imovelForm.matriculaNumero}
                onChange={(e) => setImovel("matriculaNumero", e.target.value)}
                placeholder="Ex.: 76.476"
              />
            </Field>
            <Field label="Matrícula (por extenso)">
              <Input
                value={matriculaExtensoPreview}
                readOnly
                tabIndex={-1}
                className="bg-muted/40 text-muted-foreground"
                placeholder="Preenchido automaticamente"
              />
            </Field>
            <Field label="Cartório">
              <Input
                value={imovelForm.cartorio}
                onChange={(e) => setImovel("cartorio", e.target.value)}
                placeholder="Ex.: Terceiro Registro de Imóveis"
              />
            </Field>
            <Field label="Cidade do cartório">
              <Input
                value={imovelForm.cartorioCidade}
                onChange={(e) => setImovel("cartorioCidade", e.target.value)}
                placeholder="Ex.: Cascavel"
              />
            </Field>
          </div>

          <div className="h-px bg-border" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold">Confrontações</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione cada confrontação e escolha a direção (norte, sul, leste, oeste e
                  variações).
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={adicionarConfrontacao}>
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>

            {imovelForm.confrontacoes.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
                Nenhuma confrontação cadastrada. Clique em Adicionar para incluir.
              </div>
            ) : (
              <div className="space-y-4">
                {imovelForm.confrontacoes.map((conf) => (
                  <div
                    key={conf.formId}
                    className="border border-border rounded-lg p-4 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Field label="Direção" className="flex-1 mb-0">
                        <Select
                          value={conf.direcao}
                          onValueChange={(v) => setConfrontacao(conf.formId, { direcao: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a direção" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPCOES_DIRECAO_CONFRONTACAO.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 mt-5"
                        onClick={() => removerConfrontacao(conf.formId)}
                        aria-label={`Remover confrontação ${labelDirecaoConfrontacao(conf.direcao)}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[var(--color-alerta)]" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Field label="Confrontante">
                        <Input
                          value={conf.confrontante}
                          onChange={(e) =>
                            setConfrontacao(conf.formId, { confrontante: e.target.value })
                          }
                          placeholder="Ex.: Lotes nº 1 a 12"
                        />
                      </Field>
                      <Field label="Medida">
                        <Input
                          value={conf.medida}
                          onChange={(e) => setConfrontacao(conf.formId, { medida: e.target.value })}
                          placeholder="Ex.: 90,00 metros"
                        />
                      </Field>
                      <Field label="Azimute">
                        <Input
                          value={conf.azimute}
                          onChange={(e) => setConfrontacao(conf.formId, { azimute: e.target.value })}
                          placeholder="Ex.: 55°19'53&quot;"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle icon={UserCircle2}>Sócios administradores</SectionTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Nomes importados do quadro NBR; CPF, RG e endereço são preenchidos manualmente.
              </p>
            </div>
            <Button size="sm" onClick={abrirNovo}>
              <Plus className="h-3.5 w-3.5" /> Adicionar sócio
            </Button>
          </div>

          {representantes.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Nenhum sócio cadastrado. Adicione manualmente ou importe pelo quadro NBR.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {representantes.map((r) => (
                <div
                  key={r.id}
                  className="border border-border rounded-lg p-4 bg-muted/20 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold truncate">{r.nome || "Sem nome"}</div>
                        {r.origemQuadro && (
                          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Quadro NBR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        CPF {r.cpf || "—"} · RG {r.rg || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => abrirEdicao(r)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {podeRemover(r) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => void remover(r)}
                          disabled={deleteRepresentanteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[var(--color-alerta)]" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Estado civil
                      </div>
                      <div className="text-foreground/90">{r.estadoCivil}</div>
                    </div>
                    {r.estadoCivil === "Casado(a)" && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Regime
                        </div>
                        <div className="text-foreground/90">{r.regimeComunhao || "—"}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    {[
                      r.rua && `${r.rua}, ${r.numero}`,
                      r.bairro,
                      r.cidade && `${r.cidade}/${r.estado}`,
                      r.cep,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Endereço não informado"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={HardHat}>Responsabilidade técnica — execução da obra</SectionTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Preenche a Cláusula Quarta (responsável pela execução da obra).
              </p>
            </div>
            <Button
              size="sm"
              onClick={salvarResponsabilidade}
              disabled={!empreendimentoId || updateResponsabilidadeMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              {updateResponsabilidadeMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Engenheiro" className="md:col-span-2">
              <Input
                value={responsabilidade.engenheiro}
                onChange={(e) => setResp("engenheiro", e.target.value)}
                placeholder="Ex.: Marcio da Cruz Santos"
              />
            </Field>
            <Field label="CREA">
              <Input
                value={responsabilidade.crea}
                onChange={(e) => setResp("crea", e.target.value)}
                placeholder="Ex.: 29260/D"
              />
            </Field>
            <Field label="ART">
              <Input
                value={responsabilidade.art}
                onChange={(e) => setResp("art", e.target.value)}
                placeholder="Ex.: 1720262080080"
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-5 h-fit">
        {empreendimentoId > 0 && (
          <ProntidaoExportacaoPanel empreendimentoId={empreendimentoId} compact />
        )}

        <Card className="p-6 border-border shadow-none space-y-4">
          <SectionTitle icon={AlertTriangle}>Pendências</SectionTitle>
          {pendenciasVisao.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pendência aberta.</p>
          ) : (
            <ul className="space-y-2.5">
              {pendenciasVisao.map((p, i) => (
                <Pendencia key={`p-${i}`} tone={p.tone} texto={p.texto} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <RepresentanteModal
        open={modalAberto}
        onOpenChange={(o) => {
          setModalAberto(o);
          if (!o) setEditando(null);
        }}
        representante={editando}
        onSalvar={(r) => void salvarRepresentante(r)}
        titulo={editando?.origemQuadro ? "Qualificação do sócio (quadro NBR)" : "Sócio administrador"}
        descricao={
          editando?.origemQuadro
            ? "O nome vem do quadro NBR. Complete CPF, RG, estado civil e endereço manualmente."
            : "Cadastre a qualificação completa do sócio administrador."
        }
        nomeSomenteLeitura={Boolean(editando?.origemQuadro)}
        salvando={saveRepresentanteMutation.isPending}
      />
    </div>
  );
}
