import { j as jsxRuntimeExports, r as reactExports } from "./_libs/react.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { S as StatusBadge } from "./_ssr/status-badge-BUUpRPwN.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { B as Button, c as cn } from "./_ssr/button-DjOZMqFS.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { v as validarQuadroAtual, B as Badge, g as getWizardStepTitulo, T as Textarea, b as getWizardStepDescricao, P as PreliminaresStep, R as RevisaoStep, Q as QuadroAusenteStep, c as QuadroCamposStep, d as QuadroTabelaStep } from "./_ssr/quadro-ausente-step-CM3YDkPt.mjs";
import { y as Route, f as fmtNum, u as useAuthContext, o as QUADROS_DETAIL_STEPS, q as formatFileSize, t as formatUploadedAt, v as matriculaPorExtenso, x as formatEstadoUf, m as mapDocumentoToWizardInput, c as supabase, g as parseBrDate, h as parseBrNumeric, i as mapDocumentoToDadosExtraidos, j as mapDocumentoToUnidades, k as mapDocumentoToCondominioPavimentos, l as mapDocumentoToEspacosComuns, n as persistCondominioComposicao, e as updateQuadroInDocumento, w as fmtArea } from "./_ssr/router-B3TCsBUu.mjs";
import { L as Label } from "./_ssr/label-C8WJLhmR.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { d as useLatestQuadroTecnico, p as prontidaoExportacaoQueryKey, e as createQuadroSignedUrl, f as useProntidaoExportacao, a as useUpdateEmpreendimento, g as ensureMemorial, r as regenerateSecao, s as saveSecaoConteudo, h as updateSecaoStatus, i as generateMemorialCompleto, j as fetchMemorial, k as fetchUnidades, l as fetchMemorialContext, m as ensureValidacaoPosImportacao, n as loadLatestQuadroDocumento } from "./_ssr/hooks-C-EOYi9T.mjs";
import { i as isUnidadesSection, f as formatSecaoSumarioNumero, g as getSecaoStatusLabel } from "./_ssr/status-BduXORC_.mjs";
import { u as useAuditEvents, A as AuditTimeline } from "./_ssr/hooks-CTq-Bd8S.mjs";
import { u as useRouter } from "./_libs/tanstack__react-router.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./_ssr/dialog-DNrxlBog.mjs";
import { I as Input } from "./_ssr/input-D_U8fI25.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CUSP6kj8.mjs";
import "./_ssr/index.mjs";
import { D as Download, q as Sparkles, B as Building2, r as Hash, s as Users, R as Ruler, m as TriangleAlert, j as CircleCheck, i as LoaderCircle, t as Save, p as FileSpreadsheet, M as MapPin, l as Pencil, u as Briefcase, v as CircleUserRound, P as Plus, T as Trash2, F as FileText, w as RefreshCw, x as FileDown, f as FileCheckCorner, y as FileType, H as History, z as ClipboardCheck, d as Circle, G as FileStack, I as CircleQuestionMark } from "./_libs/lucide-react.mjs";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/xlsx.mjs";
import "./_libs/date-fns.mjs";
import "./_libs/zod.mjs";
import "./_libs/isbot.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_ssr/api-DHVf6FlI.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
function Mini({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold tracking-tight text-mono-tabular", children: value })
  ] });
}
function Field({
  label,
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: label }),
    children
  ] });
}
function SectionTitle({
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children })
  ] });
}
function Grid({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4", children });
}
function Info({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: value })
  ] });
}
function Pendencia({ tone, texto }) {
  const color = tone === "alerta" ? "bg-[var(--color-alerta)]" : tone === "atencao" ? "bg-[var(--color-atencao)]" : "bg-[var(--color-ceu)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2.5 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${color}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/90", children: texto })
  ] });
}
function InfoLinha({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-mono-tabular", children: value })
  ] });
}
function ResumoItem({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold tracking-tight text-mono-tabular", children: value })
  ] });
}
function DataRow({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-baseline justify-between gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-mono-tabular", children: value })
  ] });
}
function unidadesQueryKey(empreendimentoId) {
  return ["unidades", empreendimentoId];
}
function useUnidades(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? unidadesQueryKey(empreendimentoId) : ["unidades", "disabled"],
    queryFn: () => fetchUnidades(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function numeroExtensoLongo(n) {
  if (n === 0) return "zero";
  if (n === 100) return "cem";
  const u = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais = {
    10: "dez",
    11: "onze",
    12: "doze",
    13: "treze",
    14: "catorze",
    15: "quinze",
    16: "dezesseis",
    17: "dezessete",
    18: "dezoito",
    19: "dezenove"
  };
  const dez = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa"
  ];
  const cen = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos"
  ];
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
function gerarDescricaoUnidade(u, emp) {
  const numMatch = u.nome.match(/(\d+)$/);
  const numero = numMatch ? parseInt(numMatch[1], 10) : 0;
  const numeroExt = numeroExtensoLongo(numero);
  const localPav = u.pavimento === "Térreo" ? "Pavimento térreo" : u.pavimento;
  const enderecoBase = "situar-se-á na Rua Ilhas Canárias, no 359, Bairro Interlagos, nesta Cidade e Comarca de CASCAVEL, Estado do PARANÁ";
  const areas = `terá a área construída total de ${fmtNum(u.areaTotal, 3)} m², sendo ${fmtNum(u.areaPrivativa, 2)} m² de área privativa e ${fmtNum(u.areaComum, 3)} m² de área de uso comum`;
  const terreno = u.tipo === "Garden" ? `, com área de terreno exclusiva correspondente a área de garden e de garagem` : `, com área de terreno exclusiva correspondente à área de garagem`;
  const fracao = `, correspondendo-lhe a fração territorial de ${u.fracao}`;
  const confront = `Confrontar-se-á conforme: ${u.confrontacoes}`;
  const vaga = `; terá ainda, o direito de uso privativo e exclusivo de 01 vaga descoberta (${u.vaga}), localizada no pavimento térreo do Condomínio`;
  return `${u.nome.toUpperCase()} (${numeroExt}), localizar-se-á no ${localPav} da ${u.torre} do ${emp.nome}, ${enderecoBase}, ${areas}${terreno}${fracao}. ${confront}${vaga}; tudo conforme alocado no referido projeto arquitetônico.`;
}
const ORDEM_PAVIMENTOS = [
  "Térreo",
  "1º Pavimento",
  "2º Pavimento",
  "3º Pavimento",
  "4º Pavimento"
];
const NOME_PAVIMENTO_DOC = {
  Térreo: "PAVIMENTO TÉRREO",
  "1º Pavimento": "PRIMEIRO PAVIMENTO",
  "2º Pavimento": "SEGUNDO PAVIMENTO",
  "3º Pavimento": "TERCEIRO PAVIMENTO",
  "4º Pavimento": "QUARTO PAVIMENTO"
};
function agruparUnidadesPorTorrePavimento(unidades) {
  const grupos = {};
  for (const u of unidades) {
    grupos[u.torre] ??= {};
    grupos[u.torre][u.pavimento] ??= [];
    grupos[u.torre][u.pavimento].push(u);
  }
  return grupos;
}
function memorialQueryKey(empreendimentoId) {
  return ["memorial", empreendimentoId];
}
function memorialContextQueryKey(empreendimentoId) {
  return ["memorial-context", empreendimentoId];
}
function useMemorial(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? memorialQueryKey(empreendimentoId) : ["memorial", "disabled"],
    queryFn: () => fetchMemorial(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function useMemorialContext(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? memorialContextQueryKey(empreendimentoId) : ["memorial-context", "disabled"],
    queryFn: () => fetchMemorialContext(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function useEnsureMemorial(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ensureMemorial,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    }
  });
}
function useRegenerateSecao(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regenerateSecao,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    }
  });
}
function useSaveSecao(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSecaoConteudo,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    }
  });
}
function useUpdateSecaoStatus(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSecaoStatus,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    }
  });
}
function useGenerateMemorialCompleto(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateMemorialCompleto,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    }
  });
}
function MemorialTab({ empreendimentoId, empreendimentoNome }) {
  const { membership, profile } = useAuthContext();
  const { data: memorial, isLoading, isError, refetch } = useMemorial(empreendimentoId);
  const { data: context } = useMemorialContext(empreendimentoId);
  const { data: unidades } = useUnidades(empreendimentoId);
  const ensureMutation = useEnsureMemorial(empreendimentoId);
  const regenerateMutation = useRegenerateSecao(empreendimentoId);
  const saveMutation = useSaveSecao(empreendimentoId);
  const statusMutation = useUpdateSecaoStatus(empreendimentoId);
  const completoMutation = useGenerateMemorialCompleto(empreendimentoId);
  const [secaoId, setSecaoId] = reactExports.useState(null);
  const [conteudoLocal, setConteudoLocal] = reactExports.useState("");
  const secoes = memorial?.secoes ?? [];
  const secao = secoes.find((s) => s.id === secaoId) ?? secoes[0] ?? null;
  reactExports.useEffect(() => {
    if (secoes.length > 0 && secaoId === null) {
      setSecaoId(secoes[0].id);
    }
  }, [secoes, secaoId]);
  reactExports.useEffect(() => {
    if (secao) setConteudoLocal(secao.conteudo);
  }, [secao]);
  const inicializarMemorial = async () => {
    if (!empreendimentoId || !membership || !profile) return;
    try {
      await ensureMutation.mutateAsync({
        empreendimentoId,
        organizationId: membership.organization_id,
        profileId: profile.id
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
        profileId: profile.id
      });
      setConteudoLocal(conteudo);
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
        conteudo: conteudoLocal
      });
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
        descricaoAuditoria: `Seção "${secao.titulo}" aprovada.`
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
        descricaoAuditoria: `Pendência registrada na seção "${secao.titulo}".`
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
        profileId: profile.id
      });
      toast.success(`Memorial completo gerado (${count} seções).`);
      void refetch();
    } catch {
      toast.error("Não foi possível gerar o memorial completo.");
    }
  };
  if (empreendimentoId === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-muted-foreground", children: "Memorial disponível apenas para empreendimentos salvos no banco." });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-3 h-96" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-6 h-[640px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-3 h-64" })
    ] });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 border-border shadow-none text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar o memorial." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void refetch(), children: "Tentar novamente" })
    ] });
  }
  if (!memorial || secoes.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 border-border shadow-none text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 mx-auto text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum memorial cadastrado para este empreendimento." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          disabled: ensureMutation.isPending,
          onClick: () => void inicializarMemorial(),
          children: [
            ensureMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            "Inicializar memorial"
          ]
        }
      )
    ] });
  }
  if (!secao) return null;
  const isUnidades = isUnidadesSection(secao.titulo);
  const unidadesLista = unidades ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Sumário do memorial" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
          "v",
          memorial.versao
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1", children: secoes.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSecaoId(s.id),
          className: `w-full text-left px-2.5 py-2 rounded-md text-sm flex items-start gap-2.5 transition-colors ${secao.id === s.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-mono-tabular text-muted-foreground/70 pt-0.5 w-5 shrink-0", children: formatSecaoSumarioNumero(s.ordem) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 leading-tight", children: s.titulo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionDot, { status: s.status })
          ]
        },
        s.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "w-full",
          size: "sm",
          disabled: completoMutation.isPending,
          onClick: () => void gerarCompleto(),
          children: [
            completoMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            "Gerar memorial completo"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 lg:col-span-6 p-0 border-border shadow-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-5 py-3 flex items-center justify-between bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: secao.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: secao.titulo })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              disabled: regenerateMutation.isPending,
              onClick: () => void regenerar(),
              children: [
                regenerateMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                "Regenerar"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              disabled: saveMutation.isPending,
              onClick: () => void salvar(),
              children: [
                saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
                "Salvar"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              disabled: statusMutation.isPending,
              onClick: () => void marcarPendencia(),
              children: "Pendência"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: statusMutation.isPending, onClick: () => void aprovar(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
            " Aprovar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-10 py-10 bg-card min-h-[640px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2", children: [
          "Memorial de Incorporação — ",
          empreendimentoNome
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-5 pb-3 border-b border-border", children: secao.titulo }),
        isUnidades ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: conteudoLocal,
              onChange: (e) => setConteudoLocal(e.target.value),
              rows: 3,
              className: "text-sm leading-7"
            }
          ),
          unidadesLista.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma unidade cadastrada." }) : Object.entries(agruparUnidadesPorTorrePavimento(unidadesLista)).map(
            ([torre, pavs]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold uppercase tracking-wider pt-4 border-t border-border", children: torre }),
              ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length).map((pav) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground", children: NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase() }),
                pavs[pav].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-sm leading-7 text-foreground text-justify",
                    children: gerarDescricaoUnidade(u, { nome: empreendimentoNome })
                  },
                  u.id
                ))
              ] }, pav))
            ] }, torre)
          )
        ] }) : secao.status === "nao_gerada" && !conteudoLocal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Esta seção ainda não foi gerada." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", size: "sm", onClick: () => void regenerar(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            " Gerar seção"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: conteudoLocal,
            onChange: (e) => setConteudoLocal(e.target.value),
            rows: 18,
            className: "text-sm leading-7 min-h-[480px] resize-y"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 lg:col-span-3 p-4 border-border shadow-none h-fit space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-2", children: "Dados usados na seção" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5 text-sm", children: isUnidades ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Unidades", value: `${unidadesLista.length}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataRow,
            {
              label: "Validadas",
              value: `${unidadesLista.filter((u) => u.status === "validado").length}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataRow,
            {
              label: "Pendentes",
              value: `${unidadesLista.filter((u) => u.status === "pendente").length}`
            }
          )
        ] }) : secao.titulo.includes("Propriedade") && context ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Lote", value: context.imovel.loteNumero }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Quadra", value: context.imovel.quadraNumero }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Área", value: context.imovel.area }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Matrícula", value: context.imovel.matricula }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Cartório", value: context.imovel.cartorio })
        ] }) : context ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Razão social", value: context.incorporadora.razaoSocial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "CNPJ", value: context.incorporadora.cnpj }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Endereço", value: context.incorporadora.endereco }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataRow,
            {
              label: "Cidade/UF",
              value: `${context.incorporadora.cidade}/${context.incorporadora.uf}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Representante", value: context.incorporadora.representante.nome })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs text-muted-foreground", children: "Carregando contexto…" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Memorial ",
        memorial.statusLabel,
        " · atualizado em",
        " ",
        new Date(secao.updatedAt).toLocaleDateString("pt-BR")
      ] })
    ] })
  ] });
}
function SectionDot({ status }) {
  const label = status === "aprovada" ? "Aprovada" : status === "com_pendencia" ? "Com pendência" : status === "em_revisao" ? "Em revisão" : status === "gerada" ? "Gerada" : "Não gerada";
  const c = label === "Aprovada" ? "bg-[var(--color-verde-claro)]" : label === "Com pendência" ? "bg-[var(--color-alerta)]" : label === "Em revisão" ? "bg-[var(--color-atencao)]" : label === "Gerada" ? "bg-[var(--color-ceu)]" : "bg-border";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${c}` });
}
const REPRESENTANTE_VAZIO = {
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
  estado: ""
};
const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União estável"
];
const REGIMES = [
  "Comunhão parcial de bens",
  "Comunhão universal de bens",
  "Separação total de bens",
  "Separação obrigatória de bens",
  "Participação final nos aquestos"
];
const EMPREENDIMENTO_DETAIL_ABAS = [
  { id: "dados-validados", label: "Dados validados" },
  { id: "visao", label: "Cadastro complementar" },
  { id: "memorial", label: "Memorial" },
  { id: "exportacoes", label: "Exportações" },
  { id: "historico", label: "Histórico" }
];
const TABULAR_IDS = /* @__PURE__ */ new Set([
  "qi",
  "qii",
  "qiva",
  "qivb",
  "qvi",
  "qvii",
  "qviii",
  "qcomp",
  "resumo"
]);
const CAMPOS_IDS = /* @__PURE__ */ new Set(["qiii", "qv"]);
function getQuadroWizardStepMeta(stepId, documento, fallbackTitulo, fallbackDescricao) {
  return {
    titulo: getWizardStepTitulo(stepId, documento, fallbackTitulo),
    descricao: getWizardStepDescricao(stepId, documento, fallbackDescricao)
  };
}
function QuadroWizardContent({
  stepId,
  documento,
  alertas = [],
  stepTituloFallback = "",
  onQuadroChange,
  onIrParaQuadro,
  modoConsulta = false
}) {
  const handleChange = modoConsulta ? void 0 : onQuadroChange;
  if (stepId === "preliminares") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PreliminaresStep,
      {
        quadro: documento.preliminares,
        alertas: modoConsulta ? [] : alertas,
        onChange: handleChange
      }
    );
  }
  if (stepId === "revisao") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RevisaoStep,
      {
        documento,
        onIrParaQuadro,
        somenteLeitura: modoConsulta
      }
    );
  }
  const quadro = documento.quadros.find((q) => q.id === stepId);
  if (!quadro) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      QuadroAusenteStep,
      {
        quadroId: stepId,
        tituloStep: getWizardStepTitulo(stepId, documento, stepTituloFallback),
        nomeArquivo: documento.nomeArquivo,
        documento
      }
    );
  }
  if (CAMPOS_IDS.has(quadro.id)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      QuadroCamposStep,
      {
        quadro,
        alertas: modoConsulta ? [] : alertas,
        onChange: handleChange
      }
    );
  }
  if (TABULAR_IDS.has(quadro.id)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      QuadroTabelaStep,
      {
        quadro,
        alertas: modoConsulta ? [] : alertas,
        onChange: handleChange,
        onIrParaQuadro
      }
    );
  }
  return null;
}
async function fetchLatestQuadroTecnicoId(empreendimentoId) {
  const { data, error } = await supabase.from("quadros_tecnicos").select("id").eq("empreendimento_id", empreendimentoId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
async function persistDocumentoEdits(input) {
  const { empreendimentoId, documento, organizationId, profileId } = input;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const quadroTecnicoId = await fetchLatestQuadroTecnicoId(empreendimentoId);
  const wizard = mapDocumentoToWizardInput(documento, organizationId, profileId);
  await supabase.from("dados_tecnicos").update({
    area_terreno: parseBrNumeric(wizard.areas.terreno),
    area_global: parseBrNumeric(wizard.areas.construida),
    area_privativa_total: parseBrNumeric(wizard.areas.privativa),
    area_comum_total: parseBrNumeric(wizard.areas.comum),
    torres: wizard.torres.length || null,
    pavimentos: wizard.torres.length > 0 ? Math.max(...wizard.torres.map((t) => t.pavimentos)) : null,
    unidades: wizard.unidades.total,
    vagas: wizard.unidades.vagas,
    alvara: wizard.aprovacao.alvara || null,
    data_aprovacao: parseBrDate(wizard.aprovacao.dataAprovacao) ?? null,
    responsavel_tecnico: wizard.equipe.responsavel || null,
    crea_cau: wizard.equipe.creaCau || null,
    art_rrt: wizard.equipe.observacoes || null
  }).eq("empreendimento_id", empreendimentoId).then(({ error }) => {
    if (error) throw error;
  });
  const dadosExtraidos = mapDocumentoToDadosExtraidos(documento, { validadoNoWizard: true });
  await supabase.from("dados_extraidos").delete().eq("empreendimento_id", empreendimentoId);
  if (dadosExtraidos.length > 0) {
    const { error } = await supabase.from("dados_extraidos").insert(
      dadosExtraidos.map((d) => ({
        empreendimento_id: empreendimentoId,
        quadro_tecnico_id: quadroTecnicoId,
        bloco: d.bloco,
        campo: d.campo,
        valor: d.valor,
        confianca: d.confianca,
        status: "confirmado",
        reviewed_at: now,
        reviewed_by_profile_id: profileId
      }))
    );
    if (error) throw error;
  }
  const unidadesPayload = mapDocumentoToUnidades(documento);
  const { data: unidadesExistentes, error: unidadesError } = await supabase.from("unidades_autonomas").select("id, nome, torre").eq("empreendimento_id", empreendimentoId);
  if (unidadesError) throw unidadesError;
  const byKey = new Map(
    (unidadesExistentes ?? []).map((u) => [`${u.nome}::${u.torre ?? ""}`, u.id])
  );
  for (const unidade of unidadesPayload) {
    const key = `${unidade.nome}::${unidade.torre}`;
    const patch = {
      nome: unidade.nome,
      torre: unidade.torre,
      pavimento: unidade.pavimento,
      tipo: unidade.tipo,
      area_privativa: unidade.areaPrivativa,
      area_comum: unidade.areaComum,
      area_total: unidade.areaTotal,
      area_garden: unidade.areaGarden,
      vaga: unidade.vaga,
      fracao: unidade.fracao,
      confrontacoes: unidade.confrontacoes,
      observacoes: unidade.observacoes,
      status: "validado",
      updated_at: now
    };
    const existenteId = byKey.get(key);
    if (existenteId) {
      const { error } = await supabase.from("unidades_autonomas").update(patch).eq("id", existenteId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("unidades_autonomas").insert({
        empreendimento_id: empreendimentoId,
        ...patch
      });
      if (error) throw error;
    }
  }
  const pavimentos = mapDocumentoToCondominioPavimentos(documento);
  const espacosComuns = mapDocumentoToEspacosComuns(documento);
  await persistCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);
  await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: "edicao",
    p_description: "Quadros NBR editados na aba Dados validados.",
    p_metadata: { origem: "dados_validados_tab" }
  });
}
function dadosValidadosQueryKey(empreendimentoId) {
  return ["dados-validados", empreendimentoId];
}
function DadosValidadosTab({ empreendimentoId }) {
  const { membership, profile } = useAuthContext();
  const [stepIdx, setStepIdx] = reactExports.useState(0);
  const [baixando, setBaixando] = reactExports.useState(false);
  const [documentoLocal, setDocumentoLocal] = reactExports.useState(null);
  const [dirty, setDirty] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const { data: quadroArquivo } = useLatestQuadroTecnico(empreendimentoId);
  const {
    data: documentoRemoto,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: empreendimentoId ? dadosValidadosQueryKey(empreendimentoId) : ["dados-validados", "off"],
    queryFn: async () => {
      await ensureValidacaoPosImportacao(empreendimentoId);
      return loadLatestQuadroDocumento(empreendimentoId);
    },
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
  reactExports.useEffect(() => {
    if (documentoRemoto) {
      setDocumentoLocal(documentoRemoto);
      setDirty(false);
    }
  }, [documentoRemoto]);
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!documentoLocal || !empreendimentoId || !membership || !profile) {
        throw new Error("Dados insuficientes para salvar.");
      }
      await persistDocumentoEdits({
        empreendimentoId,
        documento: documentoLocal,
        organizationId: membership.organization_id,
        profileId: profile.id
      });
    },
    onSuccess: () => {
      setDirty(false);
      toast.success("Alterações salvas.");
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: dadosValidadosQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({
          queryKey: ["empreendimentos", "detail", empreendimentoId]
        });
        void queryClient.invalidateQueries({ queryKey: prontidaoExportacaoQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({ queryKey: ["unidades", empreendimentoId] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  });
  const documento = documentoLocal;
  const step = QUADROS_DETAIL_STEPS[stepIdx];
  const meta = documento ? getQuadroWizardStepMeta(step.id, documento, step.titulo, step.descricao) : { titulo: step.titulo, descricao: step.descricao };
  const alertasAtuais = reactExports.useMemo(() => {
    if (!documento || step.id === "revisao") return [];
    return validarQuadroAtual(documento, step.id).alertas;
  }, [documento, step.id]);
  const handleQuadroChange = (quadro) => {
    setDocumentoLocal((prev) => {
      if (!prev) return prev;
      return updateQuadroInDocumento(prev, quadro);
    });
    setDirty(true);
  };
  const irParaStep = (index) => setStepIdx(index);
  const irParaQuadro = (quadroId) => {
    const index = QUADROS_DETAIL_STEPS.findIndex((s) => s.id === quadroId);
    if (index >= 0) setStepIdx(index);
  };
  const baixarAnexo = async () => {
    if (!quadroArquivo) return;
    setBaixando(true);
    try {
      const url = await createQuadroSignedUrl(quadroArquivo.storagePath);
      if (!url) throw new Error("URL indisponível");
      const link = document.createElement("a");
      link.href = url;
      link.download = quadroArquivo.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setBaixando(false);
    }
  };
  if (empreendimentoId === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-muted-foreground", children: "Dados validados disponíveis apenas para empreendimentos salvos no banco." });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" })
    ] });
  }
  if (isError || !documento) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 border-border shadow-none text-center space-y-3 max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Não foi possível carregar os quadros validados. Verifique se o arquivo CFMD está vinculado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void refetch(), children: "Tentar novamente" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 border-[var(--color-verde-claro)]/40 bg-[var(--color-verde-claro)]/5 shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-[var(--color-verde-escuro)] shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-[var(--color-verde-escuro)]", children: "Quadros validados — edição habilitada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Corrija qualquer campo nos quadros abaixo e clique em Salvar alterações para atualizar o empreendimento." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        dirty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--color-atencao)]", children: "Alterações não salvas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            disabled: !dirty || saveMutation.isPending,
            onClick: () => void saveMutation.mutateAsync(),
            children: [
              saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
              "Salvar alterações"
            ]
          }
        ),
        quadroArquivo && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            disabled: baixando,
            onClick: () => void baixarAnexo(),
            children: [
              baixando ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              "Baixar anexo"
            ]
          }
        )
      ] })
    ] }) }),
    quadroArquivo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-foreground", children: quadroArquivo.fileName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatFileSize(quadroArquivo.sizeBytes) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "importado em ",
        formatUploadedAt(quadroArquivo.createdAt)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: QUADROS_DETAIL_STEPS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: i === stepIdx ? "default" : "secondary",
          role: "button",
          tabIndex: 0,
          title: `Editar: ${getWizardStepTitulo(s.id, documento, s.titulo)}`,
          className: cn(
            "rounded-full text-[10px] cursor-pointer hover:opacity-90",
            i !== stepIdx && "opacity-80"
          ),
          onClick: () => irParaStep(i),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              irParaStep(i);
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1 text-[var(--color-verde-escuro)]" }),
            i + 1,
            ". ",
            getWizardStepTitulo(s.id, documento, s.titulo)
          ]
        }
      ),
      i < QUADROS_DETAIL_STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "›" })
    ] }, s.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: meta.descricao }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      QuadroWizardContent,
      {
        stepId: step.id,
        documento,
        alertas: alertasAtuais,
        stepTituloFallback: step.titulo,
        onQuadroChange: handleQuadroChange,
        onIrParaQuadro: irParaQuadro
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          disabled: stepIdx === 0,
          onClick: () => setStepIdx((i) => Math.max(0, i - 1)),
          children: "Quadro anterior"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          disabled: stepIdx >= QUADROS_DETAIL_STEPS.length - 1,
          onClick: () => setStepIdx((i) => Math.min(QUADROS_DETAIL_STEPS.length - 1, i + 1)),
          children: "Próximo quadro"
        }
      )
    ] })
  ] });
}
function buildMemorialPlainText(input) {
  const lines = [];
  const tipoLabel = input.tipo === "revisao" ? "VERSÃO DE REVISÃO" : "VERSÃO FINAL";
  lines.push(`MEMORIAL DE INCORPORAÇÃO — ${input.empreendimentoNome.toUpperCase()}`);
  lines.push(`${tipoLabel} · v${input.memorial.versao}`);
  lines.push("—".repeat(72));
  lines.push("");
  for (const secao of input.memorial.secoes) {
    lines.push(secao.titulo.toUpperCase());
    lines.push("");
    if (input.tipo === "revisao" && secao.status !== "aprovada") {
      lines.push(`[${getSecaoStatusLabel(secao.status).toUpperCase()}]`);
      lines.push("");
    }
    if (secao.conteudo) {
      lines.push(secao.conteudo);
      lines.push("");
    }
    if (isUnidadesSection(secao.titulo) && input.unidades.length > 0) {
      const grupos = agruparUnidadesPorTorrePavimento(input.unidades);
      for (const [torre, pavs] of Object.entries(grupos)) {
        lines.push(torre.toUpperCase());
        for (const pav of ORDEM_PAVIMENTOS.filter((p) => pavs[p]?.length)) {
          lines.push(NOME_PAVIMENTO_DOC[pav] ?? pav.toUpperCase());
          for (const u of pavs[pav]) {
            lines.push(gerarDescricaoUnidade(u, { nome: input.empreendimentoNome }));
            lines.push("");
          }
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}
const DOCUMENTOS_EXPORTADOS_BUCKET = "documentos-exportados";
const LINES_PER_PAGE = 42;
const MAX_CHARS_PER_LINE = 88;
function wrapLine(line) {
  if (line.length <= MAX_CHARS_PER_LINE) return [line];
  const parts = [];
  let rest = line;
  while (rest.length > MAX_CHARS_PER_LINE) {
    let cut = rest.lastIndexOf(" ", MAX_CHARS_PER_LINE);
    if (cut < 40) cut = MAX_CHARS_PER_LINE;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}
function paginateLines(body) {
  const flat = [];
  for (const line of body.split("\n")) {
    flat.push(...wrapLine(line));
  }
  const pages = [];
  let current = [];
  for (const line of flat) {
    if (current.length >= LINES_PER_PAGE) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([""]);
  return pages;
}
function encodePdfUtf16Hex(text) {
  const chars = ["FEFF"];
  for (let i = 0; i < text.length; i++) {
    chars.push(text.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0"));
  }
  return chars.join("");
}
function pdfHexText(text) {
  return `<${encodePdfUtf16Hex(text)}>`;
}
function buildPageStream(lines) {
  const commands = ["BT", "/F1 10 Tf", "50 750 Td", "14 TL"];
  let first = true;
  for (const line of lines) {
    const safe = line || " ";
    if (first) {
      commands.push(`${pdfHexText(safe)} Tj`);
      first = false;
    } else {
      commands.push("T*");
      commands.push(`${pdfHexText(safe)} Tj`);
    }
  }
  commands.push("ET");
  return commands.join("\n");
}
function createPdfBlob(body) {
  const pages = paginateLines(body);
  const pageCount = pages.length;
  const objects = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push(
    `2 0 obj<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pageCount} >>endobj
`
  );
  const fontObjId = 3 + pageCount * 2;
  let objId = 3;
  for (let i = 0; i < pageCount; i++) {
    const contentId = objId + 1;
    const stream = buildPageStream(pages[i]);
    objects.push(
      `${contentId} 0 obj<< /Length ${stream.length} >>stream
${stream}
endstream endobj
`
    );
    objects.push(
      `${objId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>endobj
`
    );
    objId += 2;
  }
  objects.push(`${fontObjId} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
`);
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref
0 ${objects.length + 1}
`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n 
`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>
`;
  pdf += `startxref
${xrefStart}
%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
function toRtfText(text) {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (ch === "\\" || ch === "{" || ch === "}") {
      out += `\\${ch}`;
    } else if (ch === "\n") {
      out += "\\par ";
    } else if (code > 127) {
      out += `\\u${code}?`;
    } else {
      out += ch;
    }
  }
  return out;
}
function createDocxBlob(body) {
  const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs22 ${toRtfText(body)}}`;
  return new Blob([rtf], { type: "application/rtf" });
}
function mapRowToExportacao(row) {
  if (!row.storage_path) return null;
  const fileName = row.storage_path.split("/").pop() ?? row.storage_path;
  return {
    id: row.id,
    memorialId: row.memorial_id,
    empreendimentoId: row.empreendimento_id,
    tipo: row.tipo,
    formato: row.formato,
    status: row.status,
    storagePath: row.storage_path,
    fileName,
    memorialVersao: row.memoriais?.versao ?? null,
    createdAt: row.created_at,
    createdByName: row.profiles?.full_name ?? "—"
  };
}
const EXPORT_SELECT = `
  id,
  memorial_id,
  empreendimento_id,
  tipo,
  formato,
  status,
  storage_path,
  created_at,
  profiles:created_by_profile_id ( full_name ),
  memoriais ( versao )
`;
async function logAudit(organizationId, empreendimentoId, eventType, description, metadata) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null
  });
  if (error) throw error;
}
function slugifyNome(nome) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}
function buildStoragePath(organizationId, empreendimentoId, empreendimentoNome, versao, tipo, formato) {
  const slug = slugifyNome(empreendimentoNome) || `emp_${empreendimentoId}`;
  const stamp = Date.now();
  const ext = formato === "pdf" ? "pdf" : "docx";
  const fileName = `${slug}_v${versao}_${tipo}_${stamp}.${ext}`;
  return `${organizationId}/${empreendimentoId}/${fileName}`;
}
function mimeForFormato(formato) {
  return formato === "pdf" ? "application/pdf" : "application/rtf";
}
async function fetchPendenciasBloqueantes(empreendimentoId) {
  const { data, error } = await supabase.from("pendencias").select("mensagem").eq("empreendimento_id", empreendimentoId).eq("status", "aberta").eq("severidade", "bloqueante");
  if (error) throw error;
  const mensagens = (data ?? []).map((p) => p.mensagem);
  return { total: mensagens.length, mensagens };
}
async function fetchExportacoes(empreendimentoId) {
  const { data, error } = await supabase.from("document_exports").select(EXPORT_SELECT).eq("empreendimento_id", empreendimentoId).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapRowToExportacao).filter((r) => r !== null);
}
async function exportDocument(input) {
  if (input.tipo === "final") {
    const bloqueantes = await fetchPendenciasBloqueantes(input.empreendimentoId);
    if (bloqueantes.total > 0) {
      throw new Error(
        `Exportação final bloqueada: ${bloqueantes.total} pendência(s) bloqueante(s) aberta(s).`
      );
    }
  }
  const memorial = await fetchMemorial(input.empreendimentoId);
  if (!memorial) {
    throw new Error("Memorial não encontrado. Gere o memorial antes de exportar.");
  }
  const unidades = await fetchUnidades(input.empreendimentoId);
  const plainText = buildMemorialPlainText({
    empreendimentoNome: input.empreendimentoNome,
    memorial,
    tipo: input.tipo,
    unidades
  });
  const blob = input.formato === "pdf" ? createPdfBlob(plainText) : createDocxBlob(plainText);
  const storagePath = buildStoragePath(
    input.organizationId,
    input.empreendimentoId,
    input.empreendimentoNome,
    memorial.versao,
    input.tipo,
    input.formato
  );
  const { error: uploadError } = await supabase.storage.from(DOCUMENTOS_EXPORTADOS_BUCKET).upload(storagePath, blob, {
    contentType: mimeForFormato(input.formato),
    upsert: false
  });
  if (uploadError) throw uploadError;
  const { data: inserted, error: insertError } = await supabase.from("document_exports").insert({
    memorial_id: memorial.id,
    empreendimento_id: input.empreendimentoId,
    tipo: input.tipo,
    formato: input.formato,
    storage_path: storagePath,
    status: "exportado",
    created_by_profile_id: input.profileId
  }).select(EXPORT_SELECT).single();
  if (insertError) throw insertError;
  const record = mapRowToExportacao(inserted);
  if (!record) throw new Error("Falha ao registrar exportação.");
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "exportacao",
    `Exportou memorial ${input.tipo.toUpperCase()} (${input.formato.toUpperCase()}) v${memorial.versao}.`,
    {
      export_id: record.id,
      storage_path: storagePath,
      tipo: input.tipo,
      formato: input.formato
    }
  );
  if (input.tipo === "final") {
    await supabase.from("memoriais").update({ status: "exportado" }).eq("id", memorial.id);
  }
  return record;
}
async function getExportDownloadUrl(storagePath) {
  const { data, error } = await supabase.storage.from(DOCUMENTOS_EXPORTADOS_BUCKET).createSignedUrl(storagePath, 3600);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("URL de download indisponível.");
  return data.signedUrl;
}
function exportacoesQueryKey(empreendimentoId) {
  return ["exportacoes", empreendimentoId];
}
function pendenciasBloqueantesQueryKey(empreendimentoId) {
  return ["pendencias-bloqueantes", empreendimentoId];
}
function useExportacoes(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? exportacoesQueryKey(empreendimentoId) : ["exportacoes", "disabled"],
    queryFn: () => fetchExportacoes(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function usePendenciasBloqueantes(empreendimentoId) {
  return useQuery({
    queryKey: empreendimentoId ? pendenciasBloqueantesQueryKey(empreendimentoId) : ["pendencias-bloqueantes", "disabled"],
    queryFn: () => fetchPendenciasBloqueantes(empreendimentoId),
    enabled: empreendimentoId !== null && empreendimentoId > 0
  });
}
function useExportDocument(empreendimentoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => exportDocument(input),
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: exportacoesQueryKey(empreendimentoId) });
      }
    }
  });
}
function useDownloadExportacao() {
  return useMutation({
    mutationFn: getExportDownloadUrl,
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });
}
const GRUPO_LABELS = {
  cadastro: "Cadastro jurídico",
  quadros: "Dados técnicos (quadros)",
  unidades: "Unidades autônomas",
  memorial: "Memorial",
  anexo: "Anexo e integridade"
};
const GRUPO_ICONS = {
  cadastro: ClipboardCheck,
  quadros: FileStack,
  unidades: Users,
  memorial: CircleCheck,
  anexo: FileStack
};
function StatusDot({ status }) {
  const cls = status === "ok" ? "bg-[var(--color-verde-claro)]" : status === "atencao" ? "bg-[var(--color-atencao)]" : status === "bloqueante" ? "bg-[var(--color-alerta)]" : "bg-border";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-1.5 h-2 w-2 rounded-full shrink-0 ${cls}` });
}
function ChecklistItem({ item, compact }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 py-2.5 border-b border-border last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusDot, { status: item.status }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: item.titulo }),
        item.clausula && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: item.clausula })
      ] }),
      !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: item.descricao }),
      item.detalhe && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/80 mt-1", children: item.detalhe })
    ] })
  ] });
}
function ProntidaoExportacaoPanel({
  empreendimentoId,
  compact = false
}) {
  const { data, isLoading, isError } = useProntidaoExportacao(empreendimentoId);
  if (empreendimentoId === null) return null;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `border-border shadow-none ${compact ? "p-4" : "p-6"} space-y-3`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-56" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" })
    ] });
  }
  if (isError || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-border shadow-none ${compact ? "p-4" : "p-6"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Checklist de prontidão indisponível." }) });
  }
  const grupos = [...new Set(data.itens.map((i) => i.grupo))];
  const bloqueantes = data.itens.filter((i) => i.status === "bloqueante").length;
  const atencao = data.itens.filter((i) => i.status === "atencao").length;
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-border shadow-none space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: ClipboardCheck, children: "Prontidão para exportação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-mono-tabular", children: [
          data.progressoGeral,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-[var(--color-verde-claro)]",
          style: { width: `${data.progressoGeral}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0", children: data.itens.filter((i) => i.status !== "ok" && i.status !== "nao_aplicavel").slice(0, 4).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistItem, { item, compact: true }, item.id)) }),
      bloqueantes === 0 && atencao === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--color-verde-escuro)] flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        "Pronto para gerar e exportar o memorial."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border shadow-none overflow-hidden p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: ClipboardCheck, children: "Checklist de prontidão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-mono-tabular", children: [
          data.progressoGeral,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Alinhado às cláusulas do instrumento de incorporação e ao pacote de anexos NBR 12.721." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-[var(--color-verde-claro)] transition-all",
          style: { width: `${data.progressoGeral}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs", children: [
        bloqueantes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--color-alerta)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
          bloqueantes,
          " bloqueante",
          bloqueantes > 1 ? "s" : ""
        ] }),
        atencao > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[oklch(0.45_0.13_85)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5" }),
          atencao,
          " em atenção"
        ] }),
        data.prontoExportacaoFinal && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--color-verde-escuro)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
          "Pronto para versão final"
        ] })
      ] })
    ] }),
    grupos.map((grupo) => {
      const Icon = GRUPO_ICONS[grupo];
      const itensGrupo = data.itens.filter((i) => i.grupo === grupo);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border last:border-b-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-2.5 bg-muted/30 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
          GRUPO_LABELS[grupo]
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "px-5", children: itensGrupo.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistItem, { item }, item.id)) })
      ] }, grupo);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 bg-muted/20 text-xs text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "A versão de revisão pode ser exportada com pendências. A versão final exige seções aprovadas e ausência de pendências bloqueantes no sistema." })
    ] })
  ] });
}
function ExportacoesTab({ empreendimentoId, empreendimentoNome }) {
  const { membership, profile } = useAuthContext();
  const { data: exportacoes, isLoading: loadingExports } = useExportacoes(empreendimentoId);
  const { data: bloqueantes, isLoading: loadingPendencias } = usePendenciasBloqueantes(empreendimentoId);
  const exportMutation = useExportDocument(empreendimentoId);
  const downloadMutation = useDownloadExportacao();
  const bloqueado = (bloqueantes?.total ?? 0) > 0;
  const exportar = async (tipo, formato) => {
    if (!empreendimentoId || !membership || !profile) return;
    try {
      const record = await exportMutation.mutateAsync({
        empreendimentoId,
        empreendimentoNome,
        organizationId: membership.organization_id,
        profileId: profile.id,
        tipo,
        formato
      });
      toast.success(`${record.fileName} exportado e salvo no storage.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível exportar.");
    }
  };
  const baixar = async (storagePath) => {
    try {
      await downloadMutation.mutateAsync(storagePath);
    } catch {
      toast.error("Não foi possível gerar o link de download.");
    }
  };
  if (empreendimentoId === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 border-border shadow-none text-center text-sm text-muted-foreground", children: "Exportações disponíveis apenas para empreendimentos salvos no banco." });
  }
  const isLoading = loadingExports || loadingPendencias;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProntidaoExportacaoPanel, { empreendimentoId }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-md bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "Versão de revisão" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Documento de trabalho para conferência interna." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-4", children: "Inclui marcações de status das seções em revisão ou com pendência." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "flex-1",
              disabled: exportMutation.isPending,
              onClick: () => void exportar("revisao", "docx"),
              children: [
                exportMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4" }),
                "DOCX"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "flex-1",
              disabled: exportMutation.isPending,
              onClick: () => void exportar("revisao", "pdf"),
              children: [
                exportMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4" }),
                "PDF"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-6 border-border shadow-none ${bloqueado ? "opacity-90" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-md bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "Versão final" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Documento aprovado para registro cartorial." })
          ] })
        ] }),
        bloqueado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--color-alerta)] mb-4 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 shrink-0" }),
            "Exportação bloqueada: ",
            bloqueantes?.total,
            " pendência",
            bloqueantes && bloqueantes.total > 1 ? "s" : "",
            " bloqueante",
            bloqueantes && bloqueantes.total > 1 ? "s" : "",
            "."
          ] }),
          bloqueantes?.mensagens.slice(0, 2).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5 text-muted-foreground", children: [
            "· ",
            m
          ] }, m))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-4", children: "Nenhuma pendência bloqueante aberta. Pronto para exportação final." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled: bloqueado || exportMutation.isPending,
              className: "flex-1",
              onClick: () => void exportar("final", "docx"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4" }),
                " DOCX"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled: bloqueado || exportMutation.isPending,
              className: "flex-1",
              onClick: () => void exportar("final", "pdf"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4" }),
                " PDF"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border shadow-none overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-3 border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-medium", children: "Histórico de exportações" }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
      ] }) : (exportacoes ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Nenhuma exportação registrada ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: (exportacoes ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileType, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: a.fileName })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground text-mono-tabular whitespace-nowrap", children: new Date(a.createdAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground", children: a.createdByName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status === "exportado" ? "Exportado" : a.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "ghost",
            disabled: downloadMutation.isPending,
            onClick: () => void baixar(a.storagePath),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
          }
        ) })
      ] }, a.id)) }) })
    ] })
  ] });
}
function HistoricoTab({ empreendimentoId }) {
  const { membership } = useAuthContext();
  const orgId = membership?.organization_id ?? null;
  const { data: events, isLoading, isError } = useAuditEvents(orgId, empreendimentoId);
  if (empreendimentoId === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuditTimeline,
      {
        events: [],
        isLoading: false,
        emptyMessage: "Histórico disponível apenas para empreendimentos salvos no banco."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: History, children: "Linha do tempo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuditTimeline,
      {
        events,
        isLoading,
        isError,
        emptyMessage: "Nenhum evento registrado para este empreendimento."
      }
    ) })
  ] });
}
function emptyToDash(value) {
  const trimmed = value.trim();
  return trimmed || "—";
}
function dashToEmpty(value) {
  return value === "—" ? "" : value;
}
function dadosGeraisFromEmp(emp) {
  return {
    nome: dashToEmpty(emp.nome),
    endereco: dashToEmpty(emp.endereco),
    cidade: dashToEmpty(emp.cidade),
    uf: dashToEmpty(emp.uf),
    lote: dashToEmpty(emp.lote),
    quadra: dashToEmpty(emp.quadra),
    matricula: dashToEmpty(emp.matricula)
  };
}
function DadosGeraisModal({
  open,
  onOpenChange,
  empreendimentoId,
  initial,
  onSalvo
}) {
  const { membership } = useAuthContext();
  const router = useRouter();
  const updateMutation = useUpdateEmpreendimento();
  const [form, setForm] = reactExports.useState(initial);
  const formKey = `${empreendimentoId}-${open}`;
  const [lastKey, setLastKey] = reactExports.useState(formKey);
  if (formKey !== lastKey) {
    setForm(initial);
    setLastKey(formKey);
  }
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const matriculaExtensoPreview = matriculaPorExtenso(form.matricula);
  const handleSalvar = async () => {
    if (!membership) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }
    if (!form.nome.trim()) {
      toast.error("O nome do empreendimento é obrigatório.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId,
        nome: form.nome.trim(),
        endereco: form.endereco.trim() || void 0,
        cidade: form.cidade.trim() || void 0,
        uf: form.uf.trim().toUpperCase() || void 0,
        lote: form.lote.trim() || void 0,
        quadra: form.quadra.trim() || void 0,
        matricula: form.matricula.trim() || void 0
      });
      onSalvo(form);
      await router.invalidate();
      toast.success("Dados gerais atualizados.");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar os dados gerais.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Editar dados gerais" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Atualize a identificação do empreendimento e o número da matrícula do imóvel." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome do empreendimento", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nome, onChange: (e) => set("nome", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Endereço", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: form.endereco,
          onChange: (e) => set("endereco", e.target.value),
          placeholder: "Rua, número, bairro"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cidade", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidade, onChange: (e) => set("cidade", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "UF", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.uf,
            onChange: (e) => set("uf", e.target.value.toUpperCase()),
            maxLength: 2,
            placeholder: "PR"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lote", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lote, onChange: (e) => set("lote", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quadra", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.quadra, onChange: (e) => set("quadra", e.target.value) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Matrícula", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.matricula,
            onChange: (e) => set("matricula", e.target.value),
            placeholder: "Ex.: 76.476"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Matrícula (por extenso)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: matriculaExtensoPreview,
            readOnly: true,
            tabIndex: -1,
            className: "bg-muted/40 text-muted-foreground",
            placeholder: "Preenchido automaticamente"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: handleSalvar, disabled: updateMutation.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        updateMutation.isPending ? "Salvando..." : "Salvar"
      ] })
    ] })
  ] }) });
}
function dadosGeraisToDisplay(form) {
  return {
    nome: emptyToDash(form.nome),
    endereco: emptyToDash(form.endereco),
    cidade: emptyToDash(form.cidade),
    uf: emptyToDash(form.uf),
    lote: emptyToDash(form.lote),
    quadra: emptyToDash(form.quadra),
    matricula: emptyToDash(form.matricula)
  };
}
function areaPavimento(p) {
  return p.areaReal > 0 ? p.areaReal : p.areaEquivalente ?? 0;
}
function rotuloPavimento(p, comTorre) {
  if (comTorre && p.torre) return `${p.torre} — ${p.nome}`;
  return p.nome;
}
function CondominioDadosSection({ emp }) {
  const pavimentos = emp.pavimentosAreas;
  const espacosComuns = emp.espacosComuns;
  const comTorre = pavimentos.some((p) => Boolean(p.torre));
  const totalPavimentos = pavimentos.reduce((s, p) => s + areaPavimento(p), 0);
  const areaPrivativa = emp.areaPrivativaTotal;
  const areaComum = emp.areaComumTotal;
  const areaTotal = emp.areaGlobal > 0 ? emp.areaGlobal : areaPrivativa + areaComum > 0 ? areaPrivativa + areaComum : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: Building2, children: "Dados do condomínio" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ResumoItem,
        {
          icon: Ruler,
          label: "Área total edificada",
          value: areaTotal > 0 ? fmtArea(areaTotal) : "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResumoItem, { icon: Building2, label: "Torres", value: `${emp.torres}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResumoItem, { icon: Hash, label: "Pavimentos / torre", value: `${emp.pavimentos}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResumoItem, { icon: Users, label: "Unidades", value: `${emp.unidades}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: Hash, children: "Quadro I — Áreas por pavimento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: pavimentos.length > 0 ? `Quadro I · ${pavimentos.length} pavimento${pavimentos.length > 1 ? "s" : ""}` : "Sem dados do Quadro I" })
    ] }),
    pavimentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Importe o quadro técnico (Quadro I) para preencher as áreas por pavimento." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-2 px-2 text-[11px] uppercase tracking-wider", children: "Pavimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-2 px-2 text-[11px] uppercase tracking-wider", children: "Área (m²)" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/60", children: [
        pavimentos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", children: rotuloPavimento(p, comTorre) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right text-mono-tabular", children: areaPavimento(p) > 0 ? fmtNum(areaPavimento(p), 2) : "—" })
        ] }, p.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 font-semibold", children: "Σ Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right font-semibold text-mono-tabular", children: totalPavimentos > 0 ? fmtNum(totalPavimentos, 2) : "—" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: FileCheckCorner, children: "Propriedade exclusiva" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InfoLinha,
          {
            label: "Área privativa",
            value: areaPrivativa > 0 ? fmtArea(areaPrivativa) : "—"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoLinha, { label: "Apartamentos", value: `${emp.unidades}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoLinha, { label: "Vagas descobertas", value: `${emp.vagas}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground pt-2 border-t border-border", children: "Vagas acessórias às unidades autônomas." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: Briefcase, children: "Propriedade comum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InfoLinha,
          {
            label: "Área de uso comum",
            value: areaComum > 0 ? fmtArea(areaComum) : "—"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground pt-1", children: "Espaços" }),
        espacosComuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum espaço comum extraído do Quadro VIII." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: espacosComuns.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border",
            children: a.nome
          },
          a.id
        )) })
      ] })
    ] })
  ] });
}
function RepresentanteModal({
  open,
  onOpenChange,
  representante,
  onSalvar
}) {
  const [form, setForm] = reactExports.useState(representante ?? REPRESENTANTE_VAZIO);
  const repId = representante?.id ?? "";
  const [lastId, setLastId] = reactExports.useState(repId);
  if (repId !== lastId) {
    setForm(representante ?? REPRESENTANTE_VAZIO);
    setLastId(repId);
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isCasado = form.estadoCivil === "Casado(a)";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Representante legal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Cadastre a qualificação completa para a abertura do Memorial de Incorporação." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "Identificação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome completo", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nome, onChange: (e) => set("nome", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "CPF", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.cpf,
              onChange: (e) => set("cpf", e.target.value),
              placeholder: "000.000.000-00"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "RG", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.rg,
              onChange: (e) => set("rg", e.target.value),
              placeholder: "0.000.000-0 SSP/UF"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estado civil", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.estadoCivil, onValueChange: (v) => set("estadoCivil", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ESTADOS_CIVIS.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e, children: e }, e)) })
          ] }) }),
          isCasado && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Regime de comunhão", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.regimeComunhao,
              onValueChange: (v) => set("regimeComunhao", v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REGIMES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
              ]
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "Endereço" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-6 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rua", className: "md:col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rua, onChange: (e) => set("rua", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Número", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.numero, onChange: (e) => set("numero", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "CEP", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.cep,
              onChange: (e) => set("cep", e.target.value),
              placeholder: "00.000-000"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bairro", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bairro, onChange: (e) => set("bairro", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cidade", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidade, onChange: (e) => set("cidade", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estado", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.estado,
              onChange: (e) => set("estado", e.target.value),
              placeholder: "UF",
              maxLength: 2
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => onSalvar(form), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        " Salvar representante"
      ] })
    ] })
  ] }) });
}
function VisaoGeralTab({ emp }) {
  const [dadosGerais, setDadosGerais] = reactExports.useState(dadosGeraisFromEmp(emp));
  const dados = dadosGeraisToDisplay(dadosGerais);
  const empreendimentoId = Number(emp.id);
  const [incorporadora, setIncorporadora] = reactExports.useState(emp.incorporadoraEndereco);
  const [representantes, setRepresentantes] = reactExports.useState(emp.representantes);
  const imovel = emp.imovel;
  const [editando, setEditando] = reactExports.useState(null);
  const [modalAberto, setModalAberto] = reactExports.useState(false);
  const [dadosGeraisModalAberto, setDadosGeraisModalAberto] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setDadosGerais(dadosGeraisFromEmp(emp));
    setIncorporadora(emp.incorporadoraEndereco);
    setRepresentantes(emp.representantes);
  }, [emp]);
  const abrirNovo = () => {
    setEditando({ ...REPRESENTANTE_VAZIO, id: `rep-${Date.now()}` });
    setModalAberto(true);
  };
  const abrirEdicao = (r) => {
    setEditando({ ...r });
    setModalAberto(true);
  };
  const remover = (id) => {
    setRepresentantes((arr) => arr.filter((r) => r.id !== id));
    toast.success("Representante removido.");
  };
  const salvar = (r) => {
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
  const pendenciasJuridicas = [];
  if (!incorporadora.cnpj)
    pendenciasJuridicas.push({ tone: "alerta", texto: "CNPJ da incorporadora não informado" });
  representantes.forEach((r) => {
    if (!r.cpf)
      pendenciasJuridicas.push({ tone: "alerta", texto: `${r.nome || "Representante"} sem CPF` });
    if (r.estadoCivil === "Casado(a)" && !r.regimeComunhao)
      pendenciasJuridicas.push({
        tone: "atencao",
        texto: `${r.nome || "Representante"} sem regime de bens`
      });
    if (!r.rua || !r.numero || !r.cep || !r.bairro || !r.cidade || !r.estado)
      pendenciasJuridicas.push({
        tone: "atencao",
        texto: `Endereço incompleto de ${r.nome || "representante"}`
      });
  });
  const pendenciasVisao = [...emp.pendenciasAbertas, ...pendenciasJuridicas];
  const matriculaNumeroDisplay = imovel.matriculaNumero !== "—" ? imovel.matriculaNumero : dados.matricula;
  const matriculaExtensoDisplay = imovel.matriculaExtenso !== "—" ? imovel.matriculaExtenso : matriculaPorExtenso(dados.matricula) || "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: MapPin, children: "Dados gerais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => setDadosGeraisModalAberto(true),
              disabled: !empreendimentoId,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                " Editar"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Nome", value: dados.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Endereço", value: dados.endereco }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Loteamento", value: imovel.loteamento }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Lote (nº)", value: imovel.loteNumero !== "—" ? imovel.loteNumero : dados.lote }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Lote (por extenso)",
              value: imovel.loteExtenso !== "—" ? imovel.loteExtenso : "—"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Quadra (nº)",
              value: imovel.quadraNumero !== "—" ? imovel.quadraNumero : dados.quadra
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Quadra (por extenso)",
              value: imovel.quadraExtenso !== "—" ? imovel.quadraExtenso : "—"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Cidade / Comarca",
              value: imovel.cidade !== "—" || imovel.comarca !== "—" ? `${imovel.cidade !== "—" ? imovel.cidade : dados.cidade} / ${imovel.comarca !== "—" ? imovel.comarca : "—"}` : `${dados.cidade}/${dados.uf}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Estado",
              value: formatEstadoUf(
                imovel.estado !== "—" ? imovel.estado : dados.uf !== "—" ? dados.uf : "",
                imovel.estadoExtenso !== "—" ? imovel.estadoExtenso : ""
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Info,
            {
              label: "Área do terreno",
              value: imovel.areaNumero !== "—" ? `${imovel.areaNumero} m²` : emp.areaTerreno > 0 ? `${fmtNum(emp.areaTerreno, 2)} m²` : "—"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Área (por extenso)", value: imovel.areaExtenso }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Benfeitorias", value: imovel.benfeitorias }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Matrícula (nº)", value: matriculaNumeroDisplay }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Matrícula (por extenso)", value: matriculaExtensoDisplay }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Cartório de registro", value: imovel.cartorio })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: Briefcase, children: "Incorporadora" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => toast("Edição da incorporadora — simulada."),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                " Editar"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Razão social", value: incorporadora.razaoSocial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "CNPJ", value: incorporadora.cnpj || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Endereço", value: incorporadora.endereco || "—" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: CircleUserRound, children: "Representantes legais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: abrirNovo, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Adicionar representante"
          ] })
        ] }),
        representantes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground", children: "Nenhum representante cadastrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: representantes.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border border-border rounded-lg p-4 bg-muted/20 space-y-2.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: r.nome || "Sem nome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                    "CPF ",
                    r.cpf || "—",
                    " · RG ",
                    r.rg || "—"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "icon",
                      variant: "ghost",
                      className: "h-7 w-7",
                      onClick: () => abrirEdicao(r),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  representantes.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "icon",
                      variant: "ghost",
                      className: "h-7 w-7",
                      onClick: () => remover(r.id),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-[var(--color-alerta)]" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Estado civil" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground/90", children: r.estadoCivil })
                ] }),
                r.estadoCivil === "Casado(a)" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Regime" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground/90", children: r.regimeComunhao || "—" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground border-t border-border pt-2", children: [
                r.rua && `${r.rua}, ${r.numero}`,
                r.bairro,
                r.cidade && `${r.cidade}/${r.estado}`,
                r.cep
              ].filter(Boolean).join(" · ") || "Endereço não informado" })
            ]
          },
          r.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CondominioDadosSection, { emp }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: FileText, children: "Dados técnicos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Alvará", value: emp.alvara }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Data de aprovação", value: emp.dataAprovacao }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Responsável técnico", value: emp.responsavel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "CREA / CAU", value: emp.crea }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "ART / RRT", value: emp.art }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Status", value: emp.status })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 h-fit", children: [
      empreendimentoId > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ProntidaoExportacaoPanel, { empreendimentoId, compact: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: TriangleAlert, children: "Pendências" }),
        pendenciasVisao.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma pendência aberta." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5", children: pendenciasVisao.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pendencia, { tone: p.tone, texto: p.texto }, `p-${i}`)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RepresentanteModal,
      {
        open: modalAberto,
        onOpenChange: (o) => {
          setModalAberto(o);
          if (!o) setEditando(null);
        },
        representante: editando,
        onSalvar: salvar
      }
    ),
    empreendimentoId > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DadosGeraisModal,
      {
        open: dadosGeraisModalAberto,
        onOpenChange: setDadosGeraisModalAberto,
        empreendimentoId,
        initial: dadosGerais,
        onSalvo: setDadosGerais
      }
    )
  ] });
}
function EmpreendimentoDetailPage({ emp }) {
  const [aba, setAba] = reactExports.useState("dados-validados");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: emp.nome,
        breadcrumb: [{ label: "Empreendimentos" }, { label: emp.nome }],
        subtitle: `${emp.incorporadora} · ${emp.cidade}/${emp.uf}`,
        action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: emp.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => toast("Exportação simulada", { description: "Versão de revisão gerada." }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                " Exportar"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => {
                setAba("memorial");
                toast.success("Memorial pronto para revisão.");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                " Gerar memorial"
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-none p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { icon: Building2, label: "Torres", value: `${emp.torres}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { icon: Hash, label: "Pavimentos", value: `${emp.pavimentos}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { icon: Users, label: "Unidades", value: `${emp.unidades}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { icon: Ruler, label: "Área global", value: `${fmtNum(emp.areaGlobal, 2)} m²` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "Progresso da esteira" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 flex-1 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-[var(--color-verde-claro)]",
              style: { width: `${emp.progresso}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-mono-tabular", children: [
            emp.progresso,
            "%"
          ] })
        ] }),
        emp.pendencias > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--color-alerta)] mt-2 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          " ",
          emp.pendencias,
          " pendência",
          emp.pendencias > 1 ? "s" : ""
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border flex gap-1 overflow-x-auto", children: EMPREENDIMENTO_DETAIL_ABAS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setAba(a.id),
        className: `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${aba === a.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
        children: a.label
      },
      a.id
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
      aba === "dados-validados" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        DadosValidadosTab,
        {
          empreendimentoId: /^\d+$/.test(emp.id) ? Number(emp.id) : null
        }
      ),
      aba === "visao" && /* @__PURE__ */ jsxRuntimeExports.jsx(VisaoGeralTab, { emp }),
      aba === "memorial" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MemorialTab,
        {
          empreendimentoId: /^\d+$/.test(emp.id) ? Number(emp.id) : null,
          empreendimentoNome: emp.nome
        }
      ),
      aba === "exportacoes" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ExportacoesTab,
        {
          empreendimentoId: /^\d+$/.test(emp.id) ? Number(emp.id) : null,
          empreendimentoNome: emp.nome
        }
      ),
      aba === "historico" && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoricoTab, { empreendimentoId: /^\d+$/.test(emp.id) ? Number(emp.id) : null })
    ] })
  ] });
}
function DetalheEmpreendimento() {
  const {
    emp
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EmpreendimentoDetailPage, { emp });
}
export {
  DetalheEmpreendimento as component
};
