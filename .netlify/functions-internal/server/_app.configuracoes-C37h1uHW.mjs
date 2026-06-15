import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { I as Input } from "./_ssr/input-D_U8fI25.mjs";
import { L as Label } from "./_ssr/label-C8WJLhmR.mjs";
import { B as Button, c as cn } from "./_ssr/button-DjOZMqFS.mjs";
import { S as Switch$1, a as SwitchThumb } from "./_libs/radix-ui__react-switch.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CUSP6kj8.mjs";
import { R as ROLE_LABELS } from "./_ssr/constants-By_tB_Df.mjs";
import { c as canAccessSettings, a as canManageMembers } from "./_ssr/permissions-CG48zVbx.mjs";
import { u as useAuthContext, c as supabase } from "./_ssr/router-B3TCsBUu.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import "./_ssr/index.mjs";
import { i as LoaderCircle, j as CircleCheck } from "./_libs/lucide-react.mjs";
import { o as objectType, b as booleanType, s as stringType } from "./_libs/zod.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "tslib";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/xlsx.mjs";
import "./_libs/date-fns.mjs";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const DEFAULT_EXPORT_PREFS = {
  incluirLogo: true,
  numerarPaginas: true,
  marcaDaguaRevisao: false,
  anexarQuadros: true
};
const DEFAULT_ORGANIZATION_SETTINGS = {
  razaoSocial: "Projetse Engenharia e Arquitetura LTDA",
  cnpj: "12.345.678/0001-90",
  endereco: "Rua das Palmeiras, 1.020 — Cascavel/PR",
  responsavelTecnico: "Francieli Luize Wagner Lima",
  exportPrefs: DEFAULT_EXPORT_PREFS
};
function parseSettingsJson(raw) {
  const data = raw ?? {};
  const prefs = data.export_prefs ?? {};
  return {
    razaoSocial: data.razao_social ?? DEFAULT_ORGANIZATION_SETTINGS.razaoSocial,
    cnpj: data.cnpj ?? DEFAULT_ORGANIZATION_SETTINGS.cnpj,
    endereco: data.endereco ?? DEFAULT_ORGANIZATION_SETTINGS.endereco,
    responsavelTecnico: data.responsavel_tecnico ?? DEFAULT_ORGANIZATION_SETTINGS.responsavelTecnico,
    exportPrefs: {
      incluirLogo: prefs.incluir_logo ?? DEFAULT_EXPORT_PREFS.incluirLogo,
      numerarPaginas: prefs.numerar_paginas ?? DEFAULT_EXPORT_PREFS.numerarPaginas,
      marcaDaguaRevisao: prefs.marca_dagua_revisao ?? DEFAULT_EXPORT_PREFS.marcaDaguaRevisao,
      anexarQuadros: prefs.anexar_quadros ?? DEFAULT_EXPORT_PREFS.anexarQuadros
    }
  };
}
function settingsToJson(settings) {
  return {
    razao_social: settings.razaoSocial,
    cnpj: settings.cnpj,
    endereco: settings.endereco,
    responsavel_tecnico: settings.responsavelTecnico,
    export_prefs: {
      incluir_logo: settings.exportPrefs.incluirLogo,
      numerar_paginas: settings.exportPrefs.numerarPaginas,
      marca_dagua_revisao: settings.exportPrefs.marcaDaguaRevisao,
      anexar_quadros: settings.exportPrefs.anexarQuadros
    }
  };
}
function mapRowToMember(row) {
  return {
    id: row.id,
    profileId: row.profile_id,
    fullName: row.profiles?.full_name ?? "—",
    email: row.profiles?.email ?? "—",
    role: row.role,
    status: row.status
  };
}
const exportPrefsSchema = objectType({
  incluirLogo: booleanType(),
  numerarPaginas: booleanType(),
  marcaDaguaRevisao: booleanType(),
  anexarQuadros: booleanType()
});
const organizationSettingsSchema = objectType({
  razaoSocial: stringType().trim().min(1, "Razão social é obrigatória."),
  cnpj: stringType().trim().min(1, "CNPJ é obrigatório."),
  endereco: stringType().trim().min(1, "Endereço é obrigatório."),
  responsavelTecnico: stringType().trim().min(1, "Responsável técnico é obrigatório."),
  exportPrefs: exportPrefsSchema
});
async function logAudit(organizationId, eventType, description, metadata) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    // Tipos gerados exigem number; o banco aceita null para eventos globais da org.
    p_empreendimento_id: null,
    p_event_type: eventType,
    p_description: description,
    p_metadata: metadata ?? null
  });
  if (error) throw error;
}
async function fetchOrganizationSettings(organizationId) {
  const { data, error } = await supabase.from("organizations").select("settings").eq("id", organizationId).single();
  if (error) throw error;
  return parseSettingsJson(data.settings);
}
async function saveOrganizationSettings(input) {
  const parsed = organizationSettingsSchema.safeParse(input.settings);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Configurações inválidas.");
  }
  const { error } = await supabase.from("organizations").update({ settings: settingsToJson(parsed.data) }).eq("id", input.organizationId);
  if (error) throw error;
  await logAudit(
    input.organizationId,
    "configuracao",
    "Configurações da organização atualizadas.",
    { campos: ["razao_social", "cnpj", "endereco", "responsavel_tecnico", "export_prefs"] }
  );
}
async function fetchOrganizationMembers(organizationId) {
  const { data, error } = await supabase.from("organization_members").select(
    `
      id, role, status, profile_id,
      profiles ( full_name, email )
    `
  ).eq("organization_id", organizationId).eq("status", "active").order("created_at");
  if (error) throw error;
  return data.map(mapRowToMember);
}
async function updateMemberRole(input) {
  const { data: member, error: fetchError } = await supabase.from("organization_members").select("id, role, profiles ( full_name )").eq("id", input.memberId).eq("organization_id", input.organizationId).single();
  if (fetchError) throw fetchError;
  const { error } = await supabase.from("organization_members").update({ role: input.role }).eq("id", input.memberId);
  if (error) throw error;
  const nome = member.profiles?.full_name ?? "Membro";
  await logAudit(
    input.organizationId,
    "configuracao",
    `Papel de "${nome}" alterado para ${input.role}.`,
    { member_id: input.memberId, role: input.role }
  );
}
function settingsQueryKey(organizationId) {
  return ["org-settings", organizationId];
}
function membersQueryKey(organizationId) {
  return ["org-members", organizationId];
}
function useOrganizationSettings(organizationId) {
  return useQuery({
    queryKey: organizationId ? settingsQueryKey(organizationId) : ["org-settings", "disabled"],
    queryFn: () => fetchOrganizationSettings(organizationId),
    enabled: organizationId !== null && organizationId > 0
  });
}
function useOrganizationMembers(organizationId) {
  return useQuery({
    queryKey: organizationId ? membersQueryKey(organizationId) : ["org-members", "disabled"],
    queryFn: () => fetchOrganizationMembers(organizationId),
    enabled: organizationId !== null && organizationId > 0
  });
}
function useSaveOrganizationSettings(organizationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => saveOrganizationSettings(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: settingsQueryKey(organizationId) });
      }
    }
  });
}
function useUpdateMemberRole(organizationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => updateMemberRole(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: membersQueryKey(organizationId) });
      }
    }
  });
}
const ROLES = ["admin", "gestora", "responsavel_tecnica", "revisora"];
function ConfiguracoesPage() {
  const { profile, role, organization, membership } = useAuthContext();
  const orgId = membership?.organization_id ?? null;
  const { data: settings, isLoading: loadingSettings } = useOrganizationSettings(orgId);
  const { data: members, isLoading: loadingMembers } = useOrganizationMembers(orgId);
  const saveMutation = useSaveOrganizationSettings(orgId);
  const roleMutation = useUpdateMemberRole(orgId);
  const [form, setForm] = reactExports.useState(DEFAULT_ORGANIZATION_SETTINGS);
  reactExports.useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);
  const salvar = async () => {
    if (!orgId) return;
    try {
      await saveMutation.mutateAsync({ organizationId: orgId, settings: form });
      toast.success("Configurações salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };
  const alterarPapel = async (memberId, novoRole) => {
    if (!orgId) return;
    try {
      await roleMutation.mutateAsync({ memberId, organizationId: orgId, role: novoRole });
      toast.success("Papel atualizado.");
    } catch {
      toast.error("Não foi possível alterar o papel.");
    }
  };
  const isAdmin = canManageMembers(role);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Configurações",
        subtitle: "Ajustes gerais do sistema, identidade, permissões e exportação.",
        breadcrumb: [{ label: "Configurações" }]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-5xl space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Meu perfil" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Nome", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: profile?.full_name ?? "", readOnly: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "E-mail", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: profile?.email ?? "", readOnly: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Papel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: role ? ROLE_LABELS[role] : "Sem papel atribuído", readOnly: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Organização", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: organization?.name ?? "Sem organização vinculada", readOnly: true }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Dados da Projetse" }),
        loadingSettings ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Razão social", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.razaoSocial,
              onChange: (e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "CNPJ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.cnpj,
              onChange: (e) => setForm((f) => ({ ...f, cnpj: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Endereço", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.endereco,
              onChange: (e) => setForm((f) => ({ ...f, endereco: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Responsável técnica", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.responsavelTecnico,
              onChange: (e) => setForm((f) => ({ ...f, responsavelTecnico: e.target.value }))
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Identidade visual" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [
          { n: "Verde Escuro", c: "var(--color-verde-escuro)" },
          { n: "Verde", c: "var(--color-verde)" },
          { n: "Verde Claro", c: "var(--color-verde-claro)" },
          { n: "Brita", c: "var(--color-brita)" },
          { n: "Concreto", c: "var(--color-concreto)" }
        ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16", style: { background: s.c } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: s.n }) })
        ] }, s.n)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Usuários e permissões" }),
        loadingMembers ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border", children: [
          (members ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0", children: u.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: u.fullName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: u.email })
              ] })
            ] }),
            isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: u.role,
                onValueChange: (v) => void alterarPapel(u.id, v),
                disabled: roleMutation.isPending,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px] h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: ROLE_LABELS[r] }, r)) })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: ROLE_LABELS[u.role] })
          ] }, u.id)),
          (members ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4", children: "Nenhum membro ativo." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Preferências de exportação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Toggle,
            {
              label: "Incluir cabeçalho com logo Projetse",
              checked: form.exportPrefs.incluirLogo,
              onCheckedChange: (v) => setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, incluirLogo: v } }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Toggle,
            {
              label: "Numerar páginas automaticamente",
              checked: form.exportPrefs.numerarPaginas,
              onCheckedChange: (v) => setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, numerarPaginas: v } }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Toggle,
            {
              label: "Inserir marca d'água em versões de revisão",
              checked: form.exportPrefs.marcaDaguaRevisao,
              onCheckedChange: (v) => setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, marcaDaguaRevisao: v } }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Toggle,
            {
              label: "Anexar quadros NBR 12.721 ao final do documento",
              checked: form.exportPrefs.anexarQuadros,
              onCheckedChange: (v) => setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, anexarQuadros: v } }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-border shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Status do sistema" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Esteira de extração" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Geração de memorial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Exportações DOCX/PDF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Histórico e versionamento" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          disabled: saveMutation.isPending || loadingSettings,
          onClick: () => void salvar(),
          children: [
            saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : null,
            "Salvar configurações"
          ]
        }
      ) })
    ] })
  ] });
}
function Box({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: label }),
    children
  ] });
}
function Toggle({
  label,
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between cursor-pointer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, onCheckedChange })
  ] });
}
function StatusItem({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1.5 border-b border-border last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-xs font-medium text-[var(--color-verde-escuro)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-[var(--color-verde-claro)]" }),
      " Operacional"
    ] })
  ] });
}
function ConfiguracoesRoute() {
  const navigate = useNavigate();
  const {
    role,
    isLoading
  } = useAuthContext();
  reactExports.useEffect(() => {
    if (!isLoading && role && !canAccessSettings(role)) {
      void navigate({
        to: "/"
      });
    }
  }, [isLoading, role, navigate]);
  if (!isLoading && role && !canAccessSettings(role)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConfiguracoesPage, {});
}
export {
  ConfiguracoesRoute as component
};
