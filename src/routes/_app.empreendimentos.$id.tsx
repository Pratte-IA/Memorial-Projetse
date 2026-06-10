import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import {
  empreendimentos,
  unidadesResidencialMadrid,
  secoesMemorial,
  historico as historicoMock,
  type Unidade,
  type UnidadeStatus,
  type SecaoMemorial,
} from "@/lib/mock-data";
import { fmtNum, fmtArea } from "@/lib/format";
import {
  FileText, Download, FilePlus2, UploadCloud, FileCheck2, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Sparkles, Edit3, RefreshCw, Save,
  ArrowRight, FileType, FileDown, History as HistoryIcon, Building2, MapPin,
  Ruler, Hash, Users, Search, Plus, Trash2, Pencil, Briefcase, UserCircle2,
  Check,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/empreendimentos/$id")({
  loader: ({ params }) => {
    const emp = empreendimentos.find((e) => e.id === params.id);
    if (!emp) throw notFound();
    return { emp };
  },
  component: DetalheEmpreendimento,
});

type Aba = "visao" | "quadro" | "dados" | "condominio" | "unidades" | "memorial" | "exportacoes" | "historico";

const abas: { id: Aba; label: string }[] = [
  { id: "visao", label: "Visão Geral" },
  { id: "quadro", label: "Quadro Técnico" },
  { id: "dados", label: "Dados Extraídos" },
  { id: "condominio", label: "Dados do Condomínio" },
  { id: "unidades", label: "Unidades Autônomas" },
  { id: "memorial", label: "Memorial" },
  { id: "exportacoes", label: "Exportações" },
  { id: "historico", label: "Histórico" },
];

function DetalheEmpreendimento() {
  const { emp } = Route.useLoaderData();
  const [aba, setAba] = useState<Aba>("visao");

  return (
    <>
      <PageHeader
        title={emp.nome}
        breadcrumb={[{ label: "Empreendimentos" }, { label: emp.nome }]}
        subtitle={`${emp.incorporadora} · ${emp.cidade}/${emp.uf}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={emp.status} />
            <Button variant="outline" onClick={() => toast("Exportação simulada", { description: "Versão de revisão gerada." })}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button onClick={() => { setAba("memorial"); toast.success("Memorial pronto para revisão."); }}>
              <Sparkles className="h-4 w-4" /> Gerar memorial
            </Button>
          </div>
        }
      />

      {/* Resumo executivo + progresso */}
      <div className="px-8 pt-6">
        <Card className="border-border shadow-none p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Mini icon={Building2} label="Torres" value={`${emp.torres}`} />
            <Mini icon={Hash} label="Pavimentos" value={`${emp.pavimentos}`} />
            <Mini icon={Users} label="Unidades" value={`${emp.unidades}`} />
            <Mini icon={Ruler} label="Área global" value={`${fmtNum(emp.areaGlobal, 2)} m²`} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Progresso da esteira</div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-verde-claro)]" style={{ width: `${emp.progresso}%` }} />
                </div>
                <span className="text-sm font-semibold text-mono-tabular">{emp.progresso}%</span>
              </div>
              {emp.pendencias > 0 && (
                <div className="text-xs text-[var(--color-alerta)] mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {emp.pendencias} pendência{emp.pendencias > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Abas */}
      <div className="px-8 pt-5">
        <div className="border-b border-border flex gap-1 overflow-x-auto">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                aba === a.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {aba === "visao" && <VisaoGeral emp={emp} />}
        {aba === "quadro" && <QuadroTecnico emp={emp} onConcluir={() => setAba("dados")} />}
        {aba === "dados" && <DadosExtraidos onConcluir={() => setAba("condominio")} emp={emp} />}
        {aba === "condominio" && <CondominioTab emp={emp} onConcluir={() => setAba("unidades")} />}
        {aba === "unidades" && <UnidadesTab />}
        {aba === "memorial" && <MemorialTab emp={emp} />}
        {aba === "exportacoes" && <Exportacoes pendencias={emp.pendencias} />}
        {aba === "historico" && <HistoricoTab />}
      </div>
    </>
  );
}

function Mini({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-mono-tabular">{value}</div>
    </div>
  );
}

/* ---------- Visão Geral ---------- */

type Representante = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  estadoCivil: string;
  regimeComunhao: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
};

type Incorporadora = {
  razaoSocial: string;
  cnpj: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const REPRESENTANTE_VAZIO: Representante = {
  id: "",
  nome: "",
  cpf: "",
  rg: "",
  estadoCivil: "Solteiro(a)",
  regimeComunhao: "",
  rua: "",
  numero: "",
  cep: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União estável",
];

const REGIMES = [
  "Comunhão parcial de bens",
  "Comunhão universal de bens",
  "Separação total de bens",
  "Separação obrigatória de bens",
  "Participação final nos aquestos",
];

type Confrontacao = {
  direcao: string;
  confrontante: string;
  medida: string;
  azimute: string;
};

type Imovel = {
  loteNumero: string;
  loteExtenso: string;
  quadraNumero: string;
  quadraExtenso: string;
  loteamento: string;
  cidade: string;
  comarca: string;
  estado: string;
  estadoExtenso: string;
  areaNumero: string;
  areaExtenso: string;
  benfeitorias: string;
  matriculaNumero: string;
  matriculaExtenso: string;
  cartorio: string;
  confrontacoes: Confrontacao[];
};

const IMOVEL_MOCK: Imovel = {
  loteNumero: "13",
  loteExtenso: "treze",
  quadraNumero: "4",
  quadraExtenso: "quatro",
  loteamento: "MADRID",
  cidade: "CASCAVEL",
  comarca: "CASCAVEL",
  estado: "PR",
  estadoExtenso: "PARANÁ",
  areaNumero: "2.763,00",
  areaExtenso: "dois mil, setecentos e sessenta e três metros quadrados",
  benfeitorias: "Sem benfeitorias",
  matriculaNumero: "76.476",
  matriculaExtenso: "setenta e seis mil, quatrocentos e setenta e seis",
  cartorio: "Terceiro Registro de Imóveis de Cascavel-PR",
  confrontacoes: [
    { direcao: "Noroeste", confrontante: "Lotes nº 1 a 12", medida: "90,00 metros", azimute: "55°19’53”" },
    { direcao: "Nordeste", confrontante: "Rua Ilhas Canárias", medida: "30,70 metros", azimute: "145°19’53”" },
    { direcao: "Sudeste", confrontante: "Lote nº 14 - área institucional", medida: "90,00 metros", azimute: "235°19’53”" },
    { direcao: "Sudoeste", confrontante: "parte dos Lotes nº 3 e 6, e com os Lotes nº 4 e 5, todos da Quadra nº 23, do Loteamento Barcelona", medida: "30,70 metros", azimute: "325°19’53”" },
  ],
};



function VisaoGeral({ emp }: { emp: typeof empreendimentos[number] }) {
  const [incorporadora, setIncorporadora] = useState<Incorporadora>({
    razaoSocial: emp.incorporadora,
    cnpj: emp.cnpj,
    rua: "Rua Rio de Janeiro",
    numero: "1101",
    cep: "85.801-030",
    bairro: "Centro",
    cidade: emp.cidade,
    estado: emp.uf,
  });

  const [representantes, setRepresentantes] = useState<Representante[]>([
    {
      id: "rep-1",
      nome: "Ivan Carlos Riedi",
      cpf: "040.810.579-82",
      rg: "6.473.421-0 SSP/PR",
      estadoCivil: "Casado(a)",
      regimeComunhao: "Separação total de bens",
      rua: "Rua Rio de Janeiro",
      numero: "1101",
      cep: "85.801-030",
      bairro: "Centro",
      cidade: "Cascavel",
      estado: "PR",
    },
  ]);

  const [editando, setEditando] = useState<Representante | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const abrirNovo = () => {
    setEditando({ ...REPRESENTANTE_VAZIO, id: `rep-${Date.now()}` });
    setModalAberto(true);
  };
  const abrirEdicao = (r: Representante) => {
    setEditando({ ...r });
    setModalAberto(true);
  };
  const remover = (id: string) => {
    setRepresentantes((arr) => arr.filter((r) => r.id !== id));
    toast.success("Representante removido.");
  };
  const salvar = (r: Representante) => {
    setRepresentantes((arr) => {
      const idx = arr.findIndex((x) => x.id === r.id);
      if (idx >= 0) {
        const novo = [...arr];
        novo[idx] = r;
        return novo;
      }
      return [...arr, r];
    });
    setModalAberto(false);
    setEditando(null);
    toast.success("Representante salvo.");
  };

  const pendenciasJuridicas: { tone: "alerta" | "atencao" | "ceu"; texto: string }[] = [];
  if (!incorporadora.cnpj) pendenciasJuridicas.push({ tone: "alerta", texto: "CNPJ da incorporadora não informado" });
  representantes.forEach((r) => {
    if (!r.cpf) pendenciasJuridicas.push({ tone: "alerta", texto: `${r.nome || "Representante"} sem CPF` });
    if (r.estadoCivil === "Casado(a)" && !r.regimeComunhao)
      pendenciasJuridicas.push({ tone: "atencao", texto: `${r.nome || "Representante"} sem regime de bens` });
    if (!r.rua || !r.numero || !r.cep || !r.bairro || !r.cidade || !r.estado)
      pendenciasJuridicas.push({ tone: "atencao", texto: `Endereço incompleto de ${r.nome || "representante"}` });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none space-y-5">
          <SectionTitle icon={MapPin}>Dados gerais</SectionTitle>
          <Grid>
            <Info label="Nome" value={emp.nome} />
            <Info label="Endereço" value={emp.endereco} />
            <Info label="Cidade / UF" value={`${emp.cidade}/${emp.uf}`} />
            <Info label="Lote / Quadra" value={`${emp.lote} / ${emp.quadra}`} />
            <Info label="Matrícula" value={emp.matricula} />
            <Info label="Área do terreno" value={`${fmtNum(emp.areaTerreno, 2)} m²`} />
          </Grid>
        </Card>

        {/* Incorporadora */}
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Briefcase}>Incorporadora</SectionTitle>
            <Button size="sm" variant="outline" onClick={() => toast("Edição da incorporadora — simulada.")}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <Grid>
            <Info label="Razão social" value={incorporadora.razaoSocial} />
            <Info label="CNPJ" value={incorporadora.cnpj || "—"} />
            <Info label="Cidade / UF" value={`${incorporadora.cidade || "—"}${incorporadora.estado ? "/" + incorporadora.estado : ""}`} />
            <Info label="Rua" value={incorporadora.rua || "—"} />
            <Info label="Número" value={incorporadora.numero || "—"} />
            <Info label="CEP" value={incorporadora.cep || "—"} />
            <Info label="Bairro" value={incorporadora.bairro || "—"} />
          </Grid>

          <div className="h-px bg-border" />

          {/* Representantes legais */}
          <div className="flex items-center justify-between">
            <SectionTitle icon={UserCircle2}>Representantes legais</SectionTitle>
            <Button size="sm" onClick={abrirNovo}>
              <Plus className="h-3.5 w-3.5" /> Adicionar representante
            </Button>
          </div>

          {representantes.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Nenhum representante cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {representantes.map((r) => (
                <div key={r.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{r.nome || "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">CPF {r.cpf || "—"} · RG {r.rg || "—"}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => abrirEdicao(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {representantes.length > 1 && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remover(r.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-[var(--color-alerta)]" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado civil</div>
                      <div className="text-foreground/90">{r.estadoCivil}</div>
                    </div>
                    {r.estadoCivil === "Casado(a)" && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Regime</div>
                        <div className="text-foreground/90">{r.regimeComunhao || "—"}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    {[r.rua && `${r.rua}, ${r.numero}`, r.bairro, r.cidade && `${r.cidade}/${r.estado}`, r.cep]
                      .filter(Boolean)
                      .join(" · ") || "Endereço não informado"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Propriedade e Localização do Imóvel */}
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={MapPin}>Propriedade e localização do imóvel</SectionTitle>
            <Button size="sm" variant="outline" onClick={() => toast("Edição do imóvel — simulada.")}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <Grid>
            <Info label="Lote (nº)" value={IMOVEL_MOCK.loteNumero} />
            <Info label="Lote (por extenso)" value={IMOVEL_MOCK.loteExtenso} />
            <Info label="Quadra (nº)" value={IMOVEL_MOCK.quadraNumero} />
            <Info label="Quadra (por extenso)" value={IMOVEL_MOCK.quadraExtenso} />
            <Info label="Loteamento" value={IMOVEL_MOCK.loteamento} />
            <Info label="Cidade / Comarca" value={`${IMOVEL_MOCK.cidade} / ${IMOVEL_MOCK.comarca}`} />
            <Info label="Estado" value={`${IMOVEL_MOCK.estado} — ${IMOVEL_MOCK.estadoExtenso}`} />
            <Info label="Área do terreno" value={`${IMOVEL_MOCK.areaNumero} m²`} />
            <Info label="Área (por extenso)" value={IMOVEL_MOCK.areaExtenso} />
            <Info label="Benfeitorias" value={IMOVEL_MOCK.benfeitorias} />
            <Info label="Matrícula (nº)" value={IMOVEL_MOCK.matriculaNumero} />
            <Info label="Matrícula (por extenso)" value={IMOVEL_MOCK.matriculaExtenso} />
            <Info label="Cartório de registro" value={IMOVEL_MOCK.cartorio} />
          </Grid>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <SectionTitle icon={Ruler}>Confrontações</SectionTitle>
            <Button size="sm" variant="outline" onClick={() => toast("Edição das confrontações — simulada.")}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Direção</th>
                  <th className="text-left px-3 py-2 font-medium">Confrontante</th>
                  <th className="text-left px-3 py-2 font-medium text-mono-tabular">Medida</th>
                  <th className="text-left px-3 py-2 font-medium text-mono-tabular">Azimute</th>
                </tr>
              </thead>
              <tbody>
                {IMOVEL_MOCK.confrontacoes.map((c) => (
                  <tr key={c.direcao} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{c.direcao}</td>
                    <td className="px-3 py-2 text-foreground/90">{c.confrontante}</td>
                    <td className="px-3 py-2 text-mono-tabular">{c.medida}</td>
                    <td className="px-3 py-2 text-mono-tabular">{c.azimute}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>



        <Card className="p-6 border-border shadow-none space-y-5">
          <SectionTitle icon={FileText}>Dados técnicos</SectionTitle>
          <Grid>
            <Info label="Alvará" value={emp.alvara} />
            <Info label="Data de aprovação" value={emp.dataAprovacao} />
            <Info label="Responsável técnico" value={emp.responsavel} />
            <Info label="CREA / CAU" value={emp.crea} />
            <Info label="ART / RRT" value={emp.art} />
            <Info label="Status" value={emp.status} />
          </Grid>

          <div className="h-px bg-border" />

          <SectionTitle icon={Building2}>Resumo do condomínio</SectionTitle>
          <Grid>
            <Info label="Torres" value={`${emp.torres}`} />
            <Info label="Pavimentos" value={`${emp.pavimentos}`} />
            <Info label="Unidades" value={`${emp.unidades}`} />
            <Info label="Vagas" value={`${emp.vagas}`} />
            <Info label="Área privativa total" value={fmtArea(emp.areaTerreno * 0.65)} />
            <Info label="Área comum total" value={fmtArea(emp.areaTerreno * 0.35)} />

          </Grid>
        </Card>
      </div>

      <Card className="p-6 border-border shadow-none space-y-4 h-fit">
        <SectionTitle icon={AlertTriangle}>Pendências</SectionTitle>
        <ul className="space-y-2.5">
          <Pendencia tone="alerta" texto="Confrontações faltantes em 4 unidades da Torre 02" />
          <Pendencia tone="atencao" texto="Baixa confiança na extração da área do alvará" />
          <Pendencia tone="atencao" texto="Seção 'Convenção Condominial' ainda não gerada" />
          <Pendencia tone="ceu" texto="Revisar fração ideal — divergência de 0,001%" />
          {pendenciasJuridicas.map((p, i) => (
            <Pendencia key={`j-${i}`} tone={p.tone} texto={p.texto} />
          ))}
        </ul>
        <div className="h-px bg-border" />
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Próxima ação</div>
          <Button className="w-full" variant="outline">
            Revisar unidades pendentes <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <RepresentanteModal
        open={modalAberto}
        onOpenChange={(o) => { setModalAberto(o); if (!o) setEditando(null); }}
        representante={editando}
        onSalvar={salvar}
      />
    </div>
  );
}

function RepresentanteModal({
  open, onOpenChange, representante, onSalvar,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  representante: Representante | null;
  onSalvar: (r: Representante) => void;
}) {
  const [form, setForm] = useState<Representante>(representante ?? REPRESENTANTE_VAZIO);

  // sync when opening a different representante
  const repId = representante?.id ?? "";
  const [lastId, setLastId] = useState(repId);
  if (repId !== lastId) {
    setForm(representante ?? REPRESENTANTE_VAZIO);
    setLastId(repId);
  }

  const set = <K extends keyof Representante>(k: K, v: Representante[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isCasado = form.estadoCivil === "Casado(a)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Representante legal</DialogTitle>
          <DialogDescription>
            Cadastre a qualificação completa para a abertura do Memorial de Incorporação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Identificação</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome completo" className="md:col-span-2">
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
              </Field>
              <Field label="CPF">
                <Input value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" />
              </Field>
              <Field label="RG">
                <Input value={form.rg} onChange={(e) => set("rg", e.target.value)} placeholder="0.000.000-0 SSP/UF" />
              </Field>
              <Field label="Estado civil">
                <Select value={form.estadoCivil} onValueChange={(v) => set("estadoCivil", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_CIVIS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {isCasado && (
                <Field label="Regime de comunhão">
                  <Select value={form.regimeComunhao} onValueChange={(v) => set("regimeComunhao", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {REGIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Endereço</div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Field label="Rua" className="md:col-span-4">
                <Input value={form.rua} onChange={(e) => set("rua", e.target.value)} />
              </Field>
              <Field label="Número" className="md:col-span-2">
                <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} />
              </Field>
              <Field label="CEP" className="md:col-span-2">
                <Input value={form.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00.000-000" />
              </Field>
              <Field label="Bairro" className="md:col-span-2">
                <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
              </Field>
              <Field label="Cidade" className="md:col-span-2">
                <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
              </Field>
              <Field label="Estado" className="md:col-span-2">
                <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} placeholder="UF" maxLength={2} />
              </Field>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSalvar(form)}>
            <Save className="h-4 w-4" /> Salvar representante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold">{children}</h3>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">{children}</div>;
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
function Pendencia({ tone, texto }: { tone: "alerta" | "atencao" | "ceu"; texto: string }) {
  const color = tone === "alerta" ? "bg-[var(--color-alerta)]" : tone === "atencao" ? "bg-[var(--color-atencao)]" : "bg-[var(--color-ceu)]";
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${color}`} />
      <span className="text-foreground/90">{texto}</span>
    </li>
  );
}

/* ---------- Dados do Condomínio ---------- */
const PAVIMENTOS_MOCK = [
  { nome: "Pavimento Térreo", area: 844.26 },
  { nome: "1º Pavimento", area: 567.33 },
  { nome: "2º Pavimento", area: 567.33 },
  { nome: "3º Pavimento", area: 567.33 },
  { nome: "4º Pavimento", area: 567.33 },
];

const AREAS_COMUNS_MOCK = [
  "Central GLP",
  "Lixo",
  "Circulação/Hall",
  "Escada",
  "Circulação de Veículos",
  "Salão de Festas",
  "Castelo d'água",
];

function CondominioTab({
  emp, onConcluir,
}: {
  emp: typeof empreendimentos[number];
  onConcluir: () => void;
}) {
  const totalPavimentos = PAVIMENTOS_MOCK.reduce((s, p) => s + p.area, 0);
  const areaPrivativa = 2598.0;
  const areaComum = 515.58;
  const areaTotal = areaPrivativa + areaComum;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none">
          <SectionTitle icon={Building2}>Composição do Condomínio</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
            <ResumoItem icon={Ruler} label="Área total edificada" value={`${fmtNum(areaTotal, 2)} m²`} />
            <ResumoItem icon={Building2} label="Torres" value={`${emp.torres}`} />
            <ResumoItem icon={Hash} label="Pavimentos / torre" value={`${emp.pavimentos}`} />
            <ResumoItem icon={Users} label="Unidades" value={`${emp.unidades}`} />
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={Hash}>Áreas por pavimento</SectionTitle>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {PAVIMENTOS_MOCK.length} pavimentos
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left font-medium py-2 px-2 text-[11px] uppercase tracking-wider">Pavimento</th>
                <th className="text-right font-medium py-2 px-2 text-[11px] uppercase tracking-wider">Área (m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PAVIMENTOS_MOCK.map((p) => (
                <tr key={p.nome}>
                  <td className="py-2 px-2">{p.nome}</td>
                  <td className="py-2 px-2 text-right text-mono-tabular">{fmtNum(p.area, 2)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40">
                <td className="py-2 px-2 font-semibold">Σ Total</td>
                <td className="py-2 px-2 text-right font-semibold text-mono-tabular">
                  {fmtNum(totalPavimentos, 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-6 border-border shadow-none">
            <SectionTitle icon={FileCheck2}>Propriedade exclusiva</SectionTitle>
            <div className="mt-4 space-y-3">
              <InfoLinha label="Área privativa" value={`${fmtNum(areaPrivativa, 2)} m²`} />
              <InfoLinha label="Apartamentos" value={`${emp.unidades}`} />
              <InfoLinha label="Vagas descobertas" value={`${emp.vagas}`} />
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Vagas acessórias às unidades autônomas.
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border shadow-none">
            <SectionTitle icon={Briefcase}>Propriedade comum</SectionTitle>
            <div className="mt-4 space-y-3">
              <InfoLinha label="Área de uso comum" value={`${fmtNum(areaComum, 2)} m²`} />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground pt-1">
                Espaços
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AREAS_COMUNS_MOCK.map((a) => (
                  <span
                    key={a}
                    className="text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onConcluir}>
            Continuar para unidades <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-5 border-border shadow-none h-fit lg:sticky lg:top-6">
        <SectionTitle icon={FileText}>Texto gerado — Seção</SectionTitle>
        <div className="mt-4 text-[13px] leading-relaxed text-foreground/90 space-y-3">
          <p className="font-semibold">Da Composição do Condomínio</p>
          <p>
            O Condomínio com área total a ser edificada de{" "}
            <strong>{fmtNum(areaTotal, 2)} m²</strong>, será constituído de{" "}
            <strong>{emp.torres} ({numeroExtenso(emp.torres)})</strong> torres, divididas em{" "}
            <strong>{emp.pavimentos} ({numeroExtenso(emp.pavimentos)})</strong> pavimentos cada,
            e uma área comum, a saber:{" "}
            {PAVIMENTOS_MOCK.map((p, i) => (
              <span key={p.nome}>
                {p.nome}, medindo {fmtNum(p.area, 2)} m²{i < PAVIMENTOS_MOCK.length - 1 ? "; " : ". "}
              </span>
            ))}
            A composição do condomínio será a seguinte:{" "}
            <strong>a) Partes de propriedade exclusiva</strong> (áreas privativas de {fmtNum(areaPrivativa, 2)} m²):
            às quais serão {emp.unidades} apartamentos e {emp.vagas} vagas de garagem descobertas,
            acessórias às unidades autônomas;{" "}
            <strong>b) Partes de propriedade comum</strong> (áreas de uso comum de {fmtNum(areaComum, 2)} m²):
            que serão: {AREAS_COMUNS_MOCK.join(", ")}. Tudo conforme alocado no referido projeto arquitetônico.
          </p>
        </div>
      </Card>
    </div>
  );
}

function InfoLinha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-mono-tabular">{value}</span>
    </div>
  );
}

function numeroExtenso(n: number): string {
  const map: Record<number, string> = {
    1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco",
    6: "seis", 7: "sete", 8: "oito", 9: "nove", 10: "dez",
  };
  return map[n] ?? String(n);
}

function numeroExtensoLongo(n: number): string {
  if (n === 0) return "zero";
  if (n === 100) return "cem";
  const u = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais: Record<number, string> = {
    10: "dez", 11: "onze", 12: "doze", 13: "treze", 14: "catorze", 15: "quinze",
    16: "dezesseis", 17: "dezessete", 18: "dezoito", 19: "dezenove",
  };
  const dez = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const cen = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (n < 10) return u[n];
  if (especiais[n]) return especiais[n];
  if (n < 100) {
    const d = Math.floor(n / 10), r = n % 10;
    return r === 0 ? dez[d] : `${dez[d]} e ${u[r]}`;
  }
  const c = Math.floor(n / 100), rest = n % 100;
  if (rest === 0) return cen[c];
  return `${cen[c]} e ${numeroExtensoLongo(rest)}`;
}

function gerarDescricaoUnidade(u: Unidade, emp: typeof empreendimentos[number]): string {
  const numMatch = u.nome.match(/(\d+)$/);
  const numero = numMatch ? parseInt(numMatch[1], 10) : 0;
  const numeroExt = numeroExtensoLongo(numero);
  const localPav = u.pavimento === "Térreo" ? "Pavimento térreo" : u.pavimento;
  const enderecoBase = "situar-se-á na Rua Ilhas Canárias, no 359, Bairro Interlagos, nesta Cidade e Comarca de CASCAVEL, Estado do PARANÁ";
  const areas = `terá a área construída total de ${fmtNum(u.areaTotal, 3)} m², sendo ${fmtNum(u.areaPrivativa, 2)} m² de área privativa e ${fmtNum(u.areaComum, 3)} m² de área de uso comum`;
  const terreno = u.tipo === "Garden"
    ? `, com área de terreno exclusiva correspondente a área de garden e de garagem`
    : `, com área de terreno exclusiva correspondente à área de garagem`;
  const fracao = `, correspondendo-lhe a fração territorial de ${u.fracao}`;
  const confront = `Confrontar-se-á conforme: ${u.confrontacoes}`;
  const vaga = `; terá ainda, o direito de uso privativo e exclusivo de 01 vaga descoberta (${u.vaga}), localizada no pavimento térreo do Condomínio`;
  return `${u.nome.toUpperCase()} (${numeroExt}), localizar-se-á no ${localPav} da ${u.torre} do ${emp.nome}, ${enderecoBase}, ${areas}${terreno}${fracao}. ${confront}${vaga}; tudo conforme alocado no referido projeto arquitetônico.`;
}

const ORDEM_PAVIMENTOS = ["Térreo", "1º Pavimento", "2º Pavimento", "3º Pavimento", "4º Pavimento"];
const NOME_PAVIMENTO_DOC: Record<string, string> = {
  "Térreo": "PAVIMENTO TÉRREO",
  "1º Pavimento": "PRIMEIRO PAVIMENTO",
  "2º Pavimento": "SEGUNDO PAVIMENTO",
  "3º Pavimento": "TERCEIRO PAVIMENTO",
  "4º Pavimento": "QUARTO PAVIMENTO",
};

function agruparUnidadesPorTorrePavimento(unidades: Unidade[]) {
  const grupos: Record<string, Record<string, Unidade[]>> = {};
  for (const u of unidades) {
    grupos[u.torre] ??= {};
    grupos[u.torre][u.pavimento] ??= [];
    grupos[u.torre][u.pavimento].push(u);
  }
  return grupos;
}


/* ---------- Quadro Técnico ---------- */
type EstadoQuadro = "vazio" | "enviado" | "extraindo" | "concluido";

function QuadroTecnico({
  emp, onConcluir,
}: {
  emp: typeof empreendimentos[number];
  onConcluir: () => void;
}) {
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [extraindo, setExtraindo] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const etapas = [
    "Lendo arquivo...",
    "Identificando tabelas...",
    "Extraindo dados do empreendimento...",
    "Extraindo unidades...",
    "Conferindo áreas...",
    "Extração concluída",
  ];

  const estado: EstadoQuadro = !arquivo
    ? "vazio"
    : concluido
      ? "concluido"
      : extraindo
        ? "extraindo"
        : "enviado";

  const progresso = concluido
    ? 100
    : extraindo
      ? Math.min(100, Math.round(((etapa + 1) / etapas.length) * 100))
      : 0;

  const iniciarExtracao = () => {
    setExtraindo(true);
    setEtapa(0);
    const id = setInterval(() => {
      setEtapa((e) => {
        if (e >= etapas.length - 1) {
          clearInterval(id);
          setExtraindo(false);
          setConcluido(true);
          toast.success(`Extração concluída — ${emp.unidades} unidades identificadas.`);
          return e;
        }
        return e + 1;
      });
    }, 700);
  };

  const reenviar = () => {
    setArquivo(null);
    setExtraindo(false);
    setEtapa(0);
    setConcluido(false);
  };

  const camposBaixaConfianca = [
    { campo: "Área privativa total", origem: "Quadro IV-A · linha 12", confianca: 62 },
    { campo: "Alvará nº", origem: "Cabeçalho do PDF", confianca: 71 },
    { campo: "Fração ideal — unidade 101", origem: "Quadro II · linha 03", confianca: 58 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2 p-6 border-border shadow-none space-y-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={UploadCloud}>Upload do quadro técnico — NBR 12.721</SectionTitle>
          <EstadoBadge estado={estado} />
        </div>

        {estado === "vazio" && (
          <button
            onClick={() => setArquivo("Quadro_NBR12721_ResidencialMadrid.pdf")}
            className="w-full border-2 border-dashed border-border rounded-lg p-12 hover:border-primary hover:bg-muted/30 transition-colors text-center"
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <div className="text-sm font-medium">Arraste o PDF do quadro técnico ou clique para enviar</div>
            <div className="text-xs text-muted-foreground mt-1">PDF · até 50 MB · padrão NBR 12.721</div>
          </button>
        )}

        {arquivo && (
          <div className="space-y-4">
            {/* Arquivo enviado */}
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="h-12 w-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                <FileType className="h-5 w-5 text-[var(--color-alerta)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{arquivo}</div>
                <div className="text-xs text-muted-foreground mt-0.5">1,8 MB · 24 páginas · enviado agora</div>
              </div>
              <Button size="sm" variant="ghost" onClick={reenviar}>
                <RefreshCw className="h-3.5 w-3.5" /> Substituir
              </Button>
            </div>

            {/* Barra de progresso de leitura */}
            {(extraindo || concluido) && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    {concluido ? "Leitura concluída" : etapas[etapa]}
                  </span>
                  <span className="font-semibold text-mono-tabular">{progresso}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-verde-claro)] transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            )}

            {/* Etapas */}
            {(extraindo || concluido) && (
              <div className="border border-border rounded-lg p-4 space-y-2 bg-card">
                {etapas.map((e, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 text-sm ${
                      i <= etapa ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {i < etapa || (concluido && i === etapas.length - 1) ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-verde-claro)]" />
                    ) : i === etapa && extraindo ? (
                      <Clock className="h-4 w-4 text-[var(--color-ceu)] animate-pulse" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border" />
                    )}
                    {e}
                  </div>
                ))}
              </div>
            )}

            {/* Resumo da extração */}
            {concluido && (
              <div className="border border-border rounded-lg p-5 bg-card space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-verde-claro)]" />
                    <h4 className="text-sm font-semibold">Resumo da extração</h4>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Concluído agora
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResumoItem icon={Users} label="Unidades identificadas" value={`${emp.unidades}`} />
                  <ResumoItem icon={Building2} label="Torres" value={`${emp.torres}`} />
                  <ResumoItem icon={Hash} label="Pavimentos" value={`${emp.pavimentos}`} />
                  <ResumoItem icon={FileCheck2} label="Vagas" value={`${emp.vagas}`} />
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-atencao)]" />
                      <h5 className="text-xs font-semibold uppercase tracking-wider">
                        Campos com baixa confiança
                      </h5>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {camposBaixaConfianca.length} itens
                    </span>
                  </div>
                  <div className="space-y-2">
                    {camposBaixaConfianca.map((c) => (
                      <div
                        key={c.campo}
                        className="flex items-center justify-between gap-3 p-2.5 border border-border rounded-md bg-muted/20"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.campo}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{c.origem}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-mono-tabular px-2 py-0.5 rounded bg-[var(--color-atencao)]/15 text-[var(--color-atencao)] shrink-0">
                          {c.confianca}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {estado === "enviado" && (
                <Button onClick={iniciarExtracao}>
                  <Sparkles className="h-4 w-4" /> Extrair dados
                </Button>
              )}
              {concluido && (
                <Button onClick={onConcluir}>
                  Revisar dados extraídos <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 border-border shadow-none">
        <SectionTitle icon={FileText}>Preview do documento</SectionTitle>
        <div className="mt-4 aspect-[3/4] bg-gradient-to-b from-muted to-card border border-border rounded-md flex flex-col items-center justify-center text-muted-foreground p-4">
          <FileType className="h-10 w-10 mb-3" strokeWidth={1.3} />
          <div className="text-xs text-center">
            {arquivo ? "Pré-visualização simulada do quadro NBR 12.721" : "Envie o arquivo para pré-visualizar"}
          </div>
        </div>
      </Card>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: EstadoQuadro }) {
  const map: Record<EstadoQuadro, { label: string; cls: string; Icon: React.ElementType }> = {
    vazio: {
      label: "Aguardando upload",
      cls: "bg-muted text-muted-foreground",
      Icon: UploadCloud,
    },
    enviado: {
      label: "Arquivo enviado",
      cls: "bg-[var(--color-ceu)]/15 text-[var(--color-ceu)]",
      Icon: FileType,
    },
    extraindo: {
      label: "Extraindo...",
      cls: "bg-[var(--color-ceu)]/15 text-[var(--color-ceu)]",
      Icon: Clock,
    },
    concluido: {
      label: "Extração concluída",
      cls: "bg-[var(--color-verde-claro)]/15 text-[var(--color-verde-escuro)]",
      Icon: CheckCircle2,
    },
  };
  const { label, cls, Icon } = map[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon className={`h-3 w-3 ${estado === "extraindo" ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}

function ResumoItem({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-xl font-semibold tracking-tight text-mono-tabular">{value}</div>
    </div>
  );
}

/* ---------- Dados Extraídos ---------- */
function DadosExtraidos({ onConcluir, emp }: { onConcluir: () => void; emp: typeof empreendimentos[number] }) {
  const blocos = [
    {
      titulo: "Empreendimento",
      campos: [
        { label: "Nome", value: emp.nome, conf: "Confirmado" },
        { label: "Endereço", value: emp.endereco, conf: "Confirmado" },
        { label: "Cidade/UF", value: `${emp.cidade}/${emp.uf}`, conf: "Confirmado" },
        { label: "Matrícula", value: emp.matricula, conf: "Extraído" },
      ],
    },
    {
      titulo: "Incorporadora",
      campos: [
        { label: "Razão social", value: emp.incorporadora, conf: "Confirmado" },
        { label: "CNPJ", value: emp.cnpj, conf: "Extraído" },
      ],
    },
    {
      titulo: "Áreas",
      campos: [
        { label: "Área do terreno", value: `${fmtNum(emp.areaTerreno, 2)} m²`, conf: "Confirmado" },
        { label: "Área global", value: `${fmtNum(emp.areaGlobal, 2)} m²`, conf: "Confirmado" },
        { label: "Área privativa total", value: "1.795,95 m²", conf: "Baixa confiança" },
        { label: "Área comum total", value: "1.317,63 m²", conf: "Extraído" },
      ],
    },
    {
      titulo: "Aprovação",
      campos: [
        { label: "Alvará", value: emp.alvara, conf: "Baixa confiança" },
        { label: "Data de aprovação", value: emp.dataAprovacao, conf: "Extraído" },
        { label: "Responsável técnico", value: emp.responsavel, conf: "Confirmado" },
        { label: "CREA", value: emp.crea, conf: "Confirmado" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <Card className="p-4 border-border shadow-none flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Progresso de validação</div>
            <div className="flex items-center gap-3 w-80">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-verde-claro)]" style={{ width: `68%` }} />
              </div>
              <span className="text-sm font-semibold text-mono-tabular">68%</span>
            </div>
          </div>
          <Button onClick={onConcluir}>Validar e continuar <ArrowRight className="h-4 w-4" /></Button>
        </Card>

        {blocos.map((b) => (
          <Card key={b.titulo} className="p-5 border-border shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">{b.titulo}</h4>
              <Button size="sm" variant="outline">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar bloco
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {b.campos.map((c) => (
                <div key={c.label}>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-2">
                    {c.label}
                    <ConfidenceBadge conf={c.conf} />
                  </Label>
                  <Input defaultValue={c.value} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="lg:col-span-2 p-5 border-border shadow-none h-fit lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={FileText}>Fonte — Quadro NBR 12.721</SectionTitle>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
            pág. 1 de 4
          </span>
        </div>

        <div className="border border-border rounded-md bg-[var(--color-papel,theme(colors.background))] overflow-hidden font-mono text-[11px] leading-relaxed">
          {/* Cabeçalho do documento */}
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground tracking-wide text-[11px]">
                QUADRO I — NBR 12.721
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Cálculo de áreas — incorporação imobiliária
              </div>
            </div>
            <div className="text-right text-[10px] text-muted-foreground">
              <div>Ref. {emp.matricula}</div>
              <div className="text-mono-tabular">{emp.dataAprovacao}</div>
            </div>
          </div>

          {/* Identificação */}
          <FonteSecao titulo="1. Identificação">
            <FonteLinha label="Empreendimento" value={emp.nome} mono={false} />
            <FonteLinha label="Incorporadora" value={emp.incorporadora} mono={false} />
            <FonteLinha label="CNPJ" value={emp.cnpj} />
            <FonteLinha label="Endereço" value={emp.endereco} mono={false} />
            <FonteLinha label="Lote / Quadra" value={`${emp.lote} / ${emp.quadra}`} />
            <FonteLinha label="Matrícula" value={emp.matricula} />
          </FonteSecao>

          {/* Tabela de áreas */}
          <FonteSecao titulo="2. Quadro de áreas">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-medium py-1.5 px-1 text-[10px] uppercase tracking-wider">Descrição</th>
                  <th className="text-right font-medium py-1.5 px-1 text-[10px] uppercase tracking-wider">m²</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <FonteTr label="Área do terreno" value={fmtNum(emp.areaTerreno, 2)} />
                <FonteTr label="Área construída global" value={fmtNum(emp.areaGlobal, 2)} />
                <FonteTr label="Área privativa total" value={fmtNum(emp.areaTerreno * 0.65, 2)} />
                <FonteTr label="Área comum total" value={fmtNum(emp.areaTerreno * 0.35, 2)} />
                <tr className="bg-muted/40">
                  <td className="py-1.5 px-1 font-semibold text-foreground">Σ Área global verificada</td>
                  <td className="py-1.5 px-1 text-right text-mono-tabular font-semibold text-foreground">
                    {fmtNum(emp.areaGlobal, 2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </FonteSecao>

          {/* Composição */}
          <FonteSecao titulo="3. Composição do empreendimento">
            <table className="w-full">
              <tbody className="divide-y divide-border/60">
                <FonteTr label="Torres" value={fmtNum(emp.torres, 0)} />
                <FonteTr label="Pavimentos por torre" value={fmtNum(emp.pavimentos, 0)} />
                <FonteTr label="Unidades autônomas" value={fmtNum(emp.unidades, 0)} />
                <FonteTr label="Vagas de estacionamento" value={fmtNum(emp.vagas, 0)} />
              </tbody>
            </table>
          </FonteSecao>

          {/* Rodapé */}
          <div className="border-t border-border bg-muted/30 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Responsável técnico: {emp.responsavel}</span>
            <span className="text-mono-tabular">{emp.crea}</span>
          </div>
        </div>
      </Card>
    </div>

  );
}

function FonteSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="px-4 py-1.5 bg-muted/20 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {titulo}
      </div>
      <div className="px-4 py-2.5">{children}</div>
    </div>
  );
}

function FonteLinha({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-foreground text-right ${mono ? "text-mono-tabular" : ""}`}>{value}</span>
    </div>
  );
}

function FonteTr({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-1.5 px-1 text-foreground/90">{label}</td>
      <td className="py-1.5 px-1 text-right text-mono-tabular text-foreground">{value}</td>
    </tr>
  );
}


function ConfidenceBadge({ conf }: { conf: string }) {
  const map: Record<string, string> = {
    "Confirmado": "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)]",
    "Extraído": "bg-[var(--color-ceu)]/10 text-[var(--color-ceu)]",
    "Editado": "bg-muted text-muted-foreground",
    "Baixa confiança": "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)]",
    "Pendente": "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)]",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${map[conf] ?? "bg-muted"}`}>
      {conf}
    </span>
  );
}

/* ---------- Unidades ---------- */
function UnidadesTab() {
  const [filtroTorre, setFiltroTorre] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<Unidade | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>(unidadesResidencialMadrid);

  const validarUnidade = (id: string) => {
    setUnidades((arr) =>
      arr.map((u) => (u.id === id ? { ...u, status: "Validado" as UnidadeStatus } : u))
    );
    toast.success("Unidade validada.");
  };

  const lista = unidades.filter((u) => {
    const okTorre = filtroTorre === "Todas" || u.torre === filtroTorre;
    const okStatus = filtroStatus === "Todos" || u.status === filtroStatus;
    const okBusca = !busca || u.nome.toLowerCase().includes(busca.toLowerCase());
    return okTorre && okStatus && okBusca;
  });

  const totais = {
    total: unidades.length,
    validado: unidades.filter((u) => u.status === "Validado").length,
    pendente: unidades.filter((u) => u.status === "Pendente").length,
    inconsistencia: unidades.filter((u) => u.status === "Inconsistência").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total" value={`${totais.total}`} />
        <KpiCard label="Validadas" value={`${totais.validado}`} tone="verde" />
        <KpiCard label="Pendentes" value={`${totais.pendente}`} tone="atencao" />
        <KpiCard label="Inconsistências" value={`${totais.inconsistencia}`} tone="alerta" />
      </div>

      <Card className="p-4 border-border shadow-none">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar unidade..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Todas", "Torre 01", "Torre 02", "Torre 03"].map((t) => (
              <Chip key={t} ativo={filtroTorre === t} onClick={() => setFiltroTorre(t)}>{t}</Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Todos", "Validado", "Pendente", "Inconsistência"].map((s) => (
              <Chip key={s} ativo={filtroStatus === s} onClick={() => setFiltroStatus(s)}>{s}</Chip>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-border shadow-none p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Unidade</th>
              <th className="text-left font-medium px-4 py-3">Torre</th>
              <th className="text-left font-medium px-4 py-3">Pavimento</th>
              <th className="text-left font-medium px-4 py-3">Tipo</th>
              <th className="text-right font-medium px-4 py-3">Privativa (m²)</th>
              <th className="text-right font-medium px-4 py-3">Comum (m²)</th>
              <th className="text-right font-medium px-4 py-3">Total (m²)</th>
              <th className="text-left font-medium px-4 py-3">Fração</th>
              <th className="text-left font-medium px-4 py-3">Vaga</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-center font-medium px-4 py-3 w-16">Validar</th>
              <th className="text-right font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.slice(0, 30).map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{u.nome}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.torre}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.pavimento}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.tipo}</td>
                <td className="px-4 py-2.5 text-right text-mono-tabular">{fmtNum(u.areaPrivativa, 3)}</td>
                <td className="px-4 py-2.5 text-right text-mono-tabular">{fmtNum(u.areaComum, 3)}</td>
                <td className="px-4 py-2.5 text-right text-mono-tabular font-medium">{fmtNum(u.areaTotal, 3)}</td>
                <td className="px-4 py-2.5 text-mono-tabular">{u.fracao}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.vaga}</td>
                <td className="px-4 py-2.5"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-2.5 text-center">
                  {u.status !== "Validado" ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-[var(--color-verde)]/10 hover:text-[var(--color-verde)]"
                      onClick={() => validarUnidade(u.id)}
                      title="Validar unidade"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-verde)] mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setSelecionada(u)}>
                    <Edit3 className="h-3.5 w-3.5" /> Revisar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between">
          <span>Mostrando {Math.min(30, lista.length)} de {lista.length} unidades</span>
          <Button size="sm" variant="outline">Editar em massa</Button>
        </div>
      </Card>

      {selecionada && <UnidadeDrawer unidade={selecionada} onClose={() => setSelecionada(null)} />}
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const color =
    tone === "verde" ? "text-[var(--color-verde-escuro)]" :
    tone === "atencao" ? "text-[oklch(0.45_0.13_85)]" :
    tone === "alerta" ? "text-[var(--color-alerta)]" :
    "text-foreground";
  return (
    <Card className="p-4 border-border shadow-none">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 text-mono-tabular ${color}`}>{value}</div>
    </Card>
  );
}

function Chip({ ativo, children, onClick }: { ativo: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
        ativo ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function UnidadeDrawer({ unidade, onClose }: { unidade: Unidade; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Revisão de unidade</div>
            <h3 className="text-xl font-semibold">{unidade.nome}</h3>
            <div className="text-sm text-muted-foreground mt-1">{unidade.torre} · {unidade.pavimento}</div>
          </div>
          <StatusBadge status={unidade.status} />
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field2 label="Torre"><Input defaultValue={unidade.torre} /></Field2>
            <Field2 label="Pavimento"><Input defaultValue={unidade.pavimento} /></Field2>
            <Field2 label="Tipo"><Input defaultValue={unidade.tipo} /></Field2>
            <Field2 label="Vaga vinculada"><Input defaultValue={unidade.vaga} /></Field2>
            <Field2 label="Área privativa (m²)"><Input defaultValue={fmtNum(unidade.areaPrivativa, 3)} /></Field2>
            <Field2 label="Área comum (m²)"><Input defaultValue={fmtNum(unidade.areaComum, 3)} /></Field2>
            <Field2 label="Área total (m²)"><Input defaultValue={fmtNum(unidade.areaTotal, 3)} /></Field2>
            <Field2 label="Garden (m²)"><Input defaultValue={fmtNum(unidade.garden, 2)} /></Field2>
            <Field2 label="Fração territorial"><Input defaultValue={unidade.fracao} /></Field2>
          </div>

          <Field2 label="Confrontações">
            <Textarea defaultValue={unidade.confrontacoes} rows={3} />
          </Field2>

          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Preview do texto que será gerado
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              <strong>{unidade.nome.toUpperCase()}</strong>, localizar-se-á no {unidade.pavimento} da{" "}
              {unidade.torre} do Residencial Madrid, com área privativa de {fmtNum(unidade.areaPrivativa, 3)} m²,
              área comum de {fmtNum(unidade.areaComum, 3)} m², totalizando {fmtNum(unidade.areaTotal, 3)} m²,
              fração ideal de {unidade.fracao}, vinculada à vaga {unidade.vaga}.
              {" "}{unidade.confrontacoes}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between sticky bottom-0 bg-card">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { toast("Pendência registrada."); onClose(); }}>
              <AlertTriangle className="h-4 w-4" /> Marcar pendência
            </Button>
            <Button onClick={() => { toast.success("Unidade validada."); onClose(); }}>
              <CheckCircle2 className="h-4 w-4" /> Validar unidade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

/* ---------- Memorial ---------- */
function MemorialTab({ emp }: { emp: typeof empreendimentos[number] }) {
  const [secaoId, setSecaoId] = useState(secoesMemorial[0].id);
  const secao = secoesMemorial.find((s) => s.id === secaoId)!;

  // Dados que vêm da Visão Geral (mockados para refletir o estado lá)
  const incorporadoraVisao = {
    razaoSocial: emp.incorporadora,
    cnpj: emp.cnpj,
    rua: "Rua Rio de Janeiro",
    numero: "1101",
    cep: "85.801-030",
    bairro: "Centro",
    cidade: emp.cidade,
    estado: emp.uf,
  };

  const representantesVisao = [
    {
      id: "rep-1",
      nome: "Ivan Carlos Riedi",
      cpf: "040.810.579-82",
      rg: "6.473.421-0 SSP/PR",
      estadoCivil: "Casado(a)",
      regimeComunhao: "Separação total de bens",
      rua: "Rua Rio de Janeiro",
      numero: "1101",
      cep: "85.801-030",
      bairro: "Centro",
      cidade: "Cascavel",
      estado: "PR",
    },
  ];

  function gerarQualificacao(): string {
    const inc = incorporadoraVisao;
    const rep = representantesVisao[0];

    const enderecoSede = [
      inc.rua && `${inc.rua}, no ${inc.numero}`,
      inc.bairro && `bairro ${inc.bairro}`,
      inc.cidade && `na cidade de ${inc.cidade}/${inc.estado}`,
    ].filter(Boolean).join(", ");

    const qualificacaoRep = rep
      ? `${rep.nome.toUpperCase()}, brasileiro, ${rep.estadoCivil === "Casado(a)" ? "casado pelo regime de" : rep.estadoCivil.toLowerCase().replace(/\(a\)/, "")} ${rep.regimeComunhao ? rep.regimeComunhao.toLowerCase() : ""}, empresário, portador da Cédula de Identidade RG no ${rep.rg} e inscrito no CPF/MF sob no ${rep.cpf}`
      : "";

    return `${inc.razaoSocial.toUpperCase()}, sociedade de propósito específico, com sede ${enderecoSede}, inscrita no CNPJ/MF sob o no ${inc.cnpj}, representada por seu sócio administrador: ${qualificacaoRep}; conforme Certidão Simplificada da Junta Comercial do Estado do Paraná em anexo; na qualidade de Incorporadora, convenciona este Instrumento Particular de Memorial de Incorporação, Convenção Condominial, Memorial Descritivo do Empreendimento e Regimento Interno do ${emp.nome.toUpperCase()}, mediante as cláusulas a seguir.`;
  }

  function gerarPropriedade(): string {
    const im = IMOVEL_MOCK;
    const confront = im.confrontacoes
      .map((c) => `ao ${c.direcao.toLowerCase()}: com ${c.confrontante}, medindo ${c.medida} e azimute ${c.azimute}`)
      .join("; ");
    return `A Incorporadora é proprietária, livre de ônus e de ações reais ou pessoais reipersecutórias, o que declara sob as penas da Lei, do imóvel constituído pelo Lote nº ${im.loteNumero} (${im.loteExtenso}), com área de ${im.areaNumero} m² (${im.areaExtenso}), da Quadra nº ${im.quadraNumero} (${im.quadraExtenso}), do Loteamento ${im.loteamento}, situado nesta Cidade e Comarca de ${im.comarca}, Estado do ${im.estadoExtenso}, ${im.benfeitorias.toLowerCase()}, que confronta-se, ${confront}. Atualmente registrado na matrícula ${im.matriculaNumero} (${im.matriculaExtenso}), do ${im.cartorio}.`;
  }

  const conteudoRenderizado =
    secao.id === "qualificacao"
      ? gerarQualificacao()
      : secao.id === "propriedade"
      ? gerarPropriedade()
      : secao.conteudo;


  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Sumário */}
      <Card className="col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-1">Sumário do memorial</div>
        <nav className="space-y-0.5">
          {secoesMemorial.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSecaoId(s.id)}
              className={`w-full text-left px-2.5 py-2 rounded-md text-sm flex items-start gap-2.5 transition-colors ${
                secaoId === s.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span className="text-[11px] text-mono-tabular text-muted-foreground/70 pt-0.5 w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 leading-tight">{s.titulo}</span>
              <SectionDot status={s.status} />
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-border">
          <Button className="w-full" size="sm">
            <Sparkles className="h-3.5 w-3.5" /> Gerar memorial completo
          </Button>
        </div>
      </Card>

      {/* Editor */}
      <Card className="col-span-12 lg:col-span-6 p-0 border-border shadow-none overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <StatusBadge status={secao.status} />
            <span className="text-sm font-medium">{secao.titulo}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost"><RefreshCw className="h-3.5 w-3.5" /> Regenerar</Button>
            <Button size="sm" variant="ghost"><Save className="h-3.5 w-3.5" /> Salvar</Button>
            <Button size="sm"><CheckCircle2 className="h-3.5 w-3.5" /> Aprovar</Button>
          </div>
        </div>
        <div className="px-10 py-10 bg-card min-h-[640px]">
          <div className="max-w-2xl mx-auto">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Memorial de Incorporação — {emp.nome}
            </div>
            <h2 className="text-xl font-semibold mb-5 pb-3 border-b border-border">{secao.titulo}</h2>
            {secao.id === "unidades" ? (
              <div className="space-y-6">
                <p className="text-sm leading-7 text-foreground whitespace-pre-wrap">{secao.conteudo}</p>
                {Object.entries(agruparUnidadesPorTorrePavimento(unidadesResidencialMadrid)).map(([torre, pavs]) => (
                  <div key={torre} className="space-y-5">
                    <h3 className="text-base font-semibold uppercase tracking-wider pt-4 border-t border-border">{torre}</h3>
                    {ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length).map((pav) => (
                      <div key={pav} className="space-y-3">
                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase()}
                        </div>
                        {pavs[pav].map((u) => (
                          <p key={u.id} className="text-sm leading-7 text-foreground text-justify">
                            {gerarDescricaoUnidade(u, emp)}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : conteudoRenderizado ? (
              <p className="text-sm leading-7 text-foreground whitespace-pre-wrap">{conteudoRenderizado}</p>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <div className="text-sm">Esta seção ainda não foi gerada.</div>
                <Button className="mt-4" size="sm"><Sparkles className="h-3.5 w-3.5" /> Gerar seção</Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dados da seção */}
      <Card className="col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dados usados na seção</div>
          <ul className="space-y-2.5 text-sm">
            {secao.id === "propriedade" ? (
              <>
                <DataRow label="Lote" value={`${IMOVEL_MOCK.loteNumero}`} />
                <DataRow label="Quadra" value={`${IMOVEL_MOCK.quadraNumero}`} />
                <DataRow label="Loteamento" value={IMOVEL_MOCK.loteamento} />
                <DataRow label="Área" value={`${IMOVEL_MOCK.areaNumero} m²`} />
                <DataRow label="Matrícula" value={IMOVEL_MOCK.matriculaNumero} />
                <DataRow label="Cartório" value={IMOVEL_MOCK.cartorio} />
                <DataRow label="Confrontações" value={`${IMOVEL_MOCK.confrontacoes.length} lados`} />
              </>
            ) : (
              <>
                <DataRow label="Razão social" value={emp.incorporadora} />
                <DataRow label="CNPJ" value={emp.cnpj} />
                <DataRow label="Endereço" value={`${incorporadoraVisao.rua}, ${incorporadoraVisao.numero}`} />
                <DataRow label="Cidade/UF" value={`${incorporadoraVisao.cidade}/${incorporadoraVisao.estado}`} />
                <DataRow label="Representante" value={representantesVisao[0]?.nome ?? "—"} />
                <DataRow label="CPF representante" value={representantesVisao[0]?.cpf ?? "—"} />
                <DataRow label="Estado civil" value={representantesVisao[0]?.estadoCivil ?? "—"} />
              </>
            )}
          </ul>

        </div>
        <div className="h-px bg-border" />
        <Button size="sm" variant="outline" className="w-full">
          Comparar com dados extraídos
        </Button>
      </Card>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-mono-tabular">{value}</span>
    </li>
  );
}

function SectionDot({ status }: { status: SecaoMemorial["status"] }) {
  const c =
    status === "Aprovada" ? "bg-[var(--color-verde-claro)]" :
    status === "Com pendência" ? "bg-[var(--color-alerta)]" :
    status === "Em revisão" ? "bg-[var(--color-atencao)]" :
    status === "Gerada" ? "bg-[var(--color-ceu)]" :
    "bg-border";
  return <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${c}`} />;
}

/* ---------- Exportações ---------- */
function Exportacoes({ pendencias }: { pendencias: number }) {
  const bloqueado = pendencias > 0;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6 border-border shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-md bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Versão de revisão</h4>
              <p className="text-xs text-muted-foreground">Documento de trabalho para conferência interna.</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Inclui marcações de pendências, comentários e seções em revisão.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => toast.success("DOCX de revisão exportado.")}>
              <FileDown className="h-4 w-4" /> DOCX
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => toast.success("PDF de revisão exportado.")}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>

        <Card className={`p-6 border-border shadow-none ${bloqueado ? "opacity-90" : ""}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-md bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Versão final</h4>
              <p className="text-xs text-muted-foreground">Documento aprovado para registro cartorial.</p>
            </div>
          </div>
          {bloqueado ? (
            <div className="text-xs text-[var(--color-alerta)] mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Exportação bloqueada: {pendencias} pendência{pendencias > 1 ? "s" : ""} sem resolução.
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mb-4">
              Todas as seções aprovadas. Pronto para exportação final.
            </div>
          )}
          <div className="flex gap-2">
            <Button disabled={bloqueado} className="flex-1" onClick={() => toast.success("DOCX final exportado.")}>
              <FileDown className="h-4 w-4" /> DOCX
            </Button>
            <Button disabled={bloqueado} className="flex-1" onClick={() => toast.success("PDF final exportado.")}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>
      </div>

      <Card className="border-border shadow-none overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Histórico de exportações
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {[
              { nome: "Residencial_Madrid_v3_revisao.docx", data: "15/04/2026 10:45", user: "Francieli L.", status: "Exportado" },
              { nome: "Residencial_Madrid_v3_revisao.pdf", data: "15/04/2026 10:46", user: "Francieli L.", status: "Exportado" },
              { nome: "Residencial_Madrid_v2_revisao.docx", data: "12/04/2026 17:02", user: "Ana T.", status: "Exportado" },
            ].map((a) => (
              <tr key={a.nome}>
                <td className="px-5 py-3 flex items-center gap-3">
                  <FileType className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{a.nome}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-mono-tabular">{a.data}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.user}</td>
                <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- Histórico ---------- */
function HistoricoTab() {
  return (
    <Card className="p-8 border-border shadow-none">
      <SectionTitle icon={HistoryIcon}>Linha do tempo</SectionTitle>
      <ol className="mt-6 relative border-l-2 border-border ml-2 space-y-6">
        {historicoMock.map((h, i) => (
          <li key={i} className="pl-6 relative">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-card border-2 border-[var(--color-verde-claro)]" />
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xs text-mono-tabular text-muted-foreground">{h.data} · {h.hora}</span>
              <span className="text-[11px] uppercase tracking-wider text-[var(--color-verde-escuro)] font-medium">{h.usuario}</span>
            </div>
            <p className="text-sm text-foreground">{h.descricao}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
