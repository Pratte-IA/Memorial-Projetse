import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { z as redirect, A as notFound } from "../_libs/tanstack__router-core.mjs";
import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "./index.mjs";
import { r as readSync, u as utils } from "../_libs/xlsx.mjs";
import { f as format, p as ptBR } from "../_libs/date-fns.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function logError(error, context) {
  const payload = {
    scope: context?.scope ?? "app",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : void 0,
    metadata: context?.metadata,
    at: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.error("[Memorial-Projetse]", payload);
}
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3e4,
        gcTime: 5 * 6e4,
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        onError: (error) => {
          logError(error, { scope: "mutation" });
        }
      }
    }
  });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const PLACEHOLDER_URL = "seu-projeto.supabase.co";
const PLACEHOLDER_KEY = "sua-chave-anon-publica";
function getSupabaseEnv() {
  const url = "https://jlnwoapaeiywehihilua.supabase.co"?.trim();
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbndvYXBhZWl5d2VoaWhpbHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDgyNzcsImV4cCI6MjA3NjAyNDI3N30.yWa8DGajNUAKYsfV2E_HUEkw4ytyRDWMTzSGB-S8xpk"?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Copie .env.example para .env.local."
    );
  }
  if (url.includes(PLACEHOLDER_URL) || anonKey === PLACEHOLDER_KEY) {
    throw new Error(
      "Configure as variáveis Supabase com os valores reais do projeto antes de iniciar o app."
    );
  }
  return { url, anonKey };
}
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "projetse"
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
async function sendPasswordReset(email) {
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}
async function fetchUserContext(userId) {
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, user_id, full_name, email, avatar_url, created_at, updated_at").eq("user_id", userId).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return { profile: null, membership: null };
  const { data: membership, error: membershipError } = await supabase.from("organization_members").select(
    `
        id,
        role,
        status,
        organization_id,
        organizations (
          id,
          name,
          slug,
          created_at,
          updated_at
        )
      `
  ).eq("profile_id", profile.id).eq("status", "active").order("id", { ascending: true }).limit(1).maybeSingle();
  if (membershipError) throw membershipError;
  return {
    profile,
    membership
  };
}
async function loadAuthUserContext() {
  const session = await getSession();
  if (!session?.user) {
    return {
      session: null,
      user: null,
      profile: null,
      membership: null
    };
  }
  const { profile, membership } = await fetchUserContext(session.user.id);
  return {
    session,
    user: session.user,
    profile,
    membership
  };
}
const AuthContext = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [membership, setMembership] = reactExports.useState(null);
  const applyContext = reactExports.useCallback(
    (next) => {
      setSession(next.session);
      setUser(next.user);
      setProfile(next.profile);
      setMembership(next.membership);
    },
    []
  );
  const refresh = reactExports.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const context = await loadAuthUserContext();
      applyContext(context);
    } finally {
      setIsRefreshing(false);
    }
  }, [applyContext]);
  reactExports.useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const context = await loadAuthUserContext();
        if (mounted) applyContext(context);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void init();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      if (!nextSession?.user) {
        applyContext({
          session: null,
          user: null,
          profile: null,
          membership: null
        });
        return;
      }
      try {
        const { profile: nextProfile, membership: nextMembership } = await fetchUserContext(
          nextSession.user.id
        );
        applyContext({
          session: nextSession,
          user: nextSession.user,
          profile: nextProfile,
          membership: nextMembership
        });
      } catch (error) {
        logError(error, { scope: "auth-context" });
        applyContext({
          session: nextSession,
          user: nextSession.user,
          profile: null,
          membership: null
        });
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyContext]);
  const value = reactExports.useMemo(
    () => ({
      isLoading,
      isRefreshing,
      session,
      user,
      profile,
      membership,
      role: membership?.role ?? null,
      organization: membership?.organizations ?? null,
      refresh
    }),
    [isLoading, isRefreshing, session, user, profile, membership, refresh]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
}
function useAuthContext() {
  const context = reactExports.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }
  return context;
}
const appCss = "/assets/styles-BzsXhzEc.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", role: "main", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-semibold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Página não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "A página solicitada não existe ou foi movida." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Voltar ao Dashboard"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  logError(error, { scope: "route-error" });
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex min-h-screen items-center justify-center bg-background px-4",
      role: "alert",
      "aria-labelledby": "route-error-title",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "route-error-title", className: "text-xl font-semibold tracking-tight text-foreground", children: "Esta página não carregou" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Ocorreu um erro inesperado. Você pode tentar novamente ou voltar ao início." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                router2.invalidate();
                reset();
              },
              className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Tentar novamente"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "/",
              className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Início"
            }
          )
        ] })
      ] })
    }
  );
}
const Route$b = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Projetse — Sistema de Memorial de Incorporação" },
      {
        name: "description",
        content: "Plataforma técnica da Projetse para automação de Memoriais de Incorporação a partir de quadros técnicos NBR 12.721."
      },
      { name: "author", content: "Projetse" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$b.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right" })
  ] }) });
}
async function requireAuth(redirectPath) {
  if (typeof window === "undefined") return;
  const session = await getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { redirect: redirectPath }
    });
  }
}
async function redirectIfAuthenticated(redirectTo = "/") {
  if (typeof window === "undefined") return;
  const session = await getSession();
  if (session) {
    throw redirect({ to: redirectTo });
  }
}
const $$splitComponentImporter$a = () => import("./login-ujOmB4H_.mjs");
const loginSearchSchema = objectType({
  redirect: stringType().optional()
});
const Route$a = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({
    search
  }) => {
    await redirectIfAuthenticated(search.redirect ?? "/");
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./esqueci-senha-DXIAnJub.mjs");
const Route$9 = createFileRoute("/esqueci-senha")({
  beforeLoad: async () => {
    await redirectIfAuthenticated("/");
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("../_app-YTMROW9T.mjs");
const Route$8 = createFileRoute("/_app")({
  beforeLoad: async ({
    location
  }) => {
    await requireAuth(location.pathname);
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("../_app.index-DRZ8zPch.mjs");
const Route$7 = createFileRoute("/_app/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("../_app.modelos-DOCoSEr-.mjs");
const Route$6 = createFileRoute("/_app/modelos")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("../_app.historico-BuCMybfy.mjs");
const Route$5 = createFileRoute("/_app/historico")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("../_app.configuracoes-C37h1uHW.mjs");
const Route$4 = createFileRoute("/_app/configuracoes")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("../_app.clausulas-0WBf2MsU.mjs");
const Route$3 = createFileRoute("/_app/clausulas")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("../_app.empreendimentos.index-BTGlg-XE.mjs");
const Route$2 = createFileRoute("/_app/empreendimentos/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("../_app.empreendimentos.novo-Do_o7dwE.mjs");
const Route$1 = createFileRoute("/_app/empreendimentos/novo")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const UNITS = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove"
];
const TEENS = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove"
];
const TENS = [
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
const HUNDREDS = [
  "",
  "cem",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos"
];
function belowThousand(value) {
  if (value === 0) return "";
  if (value === 100) return "cem";
  if (value < 10) return UNITS[value];
  if (value < 20) return TEENS[value - 10];
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const unit = value % 10;
    return unit ? `${TENS[tens]} e ${UNITS[unit]}` : TENS[tens];
  }
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const hundredWord = hundreds === 1 && rest > 0 ? "cento" : HUNDREDS[hundreds];
  return rest ? `${hundredWord} e ${belowThousand(rest)}` : hundredWord;
}
function integerPartPorExtenso(value) {
  if (!Number.isFinite(value) || value < 0) return "";
  if (value === 0) return "zero";
  if (value >= 1e6) return String(value);
  if (value < 1e3) return belowThousand(value);
  const thousands = Math.floor(value / 1e3);
  const rest = value % 1e3;
  const thousandWord = thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
  return rest ? `${thousandWord}, ${belowThousand(rest)}` : thousandWord;
}
function integerToPortuguese(value) {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "zero";
  if (value < 0 || value >= 1e6) return String(value);
  if (value < 1e3) return belowThousand(value);
  const thousands = Math.floor(value / 1e3);
  const rest = value % 1e3;
  const thousandWord = thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
  return rest ? `${thousandWord} e ${belowThousand(rest)}` : thousandWord;
}
function areaMetrosQuadradosPorExtenso(area) {
  if (!Number.isFinite(area) || area <= 0) return "";
  const rounded = Math.round(area * 100) / 100;
  const integerPart = Math.floor(rounded);
  const centimeters = Math.round((rounded - integerPart) * 100);
  let result = `${integerPartPorExtenso(integerPart)} metros quadrados`;
  if (centimeters > 0) {
    result += ` e ${integerToPortuguese(centimeters)} centímetros quadrados`;
  }
  return result;
}
function stripLoteQuadraPrefix(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return "";
  return trimmed.replace(/^lote\s*(?:n[º°]?\s*)?/i, "").replace(/^quadra\s*(?:n[º°]?\s*)?/i, "").replace(/,?\s*quadra\s*(?:n[º°]?\s*)?.+$/i, "").trim();
}
function parseMatriculaNumero(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return Number.isFinite(num) && num >= 0 ? num : null;
}
function matriculaPorExtenso(value) {
  const num = parseMatriculaNumero(value);
  if (num === null) return "";
  if (num === 0) return "zero";
  return integerPartPorExtenso(num);
}
function loteQuadraPorExtenso(value) {
  const trimmed = stripLoteQuadraPrefix(value);
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d+)(.*)$/);
  if (!match) return trimmed.toLowerCase();
  const numeric = parseInt(match[1], 10);
  const suffix = match[2].replace(/^[\s-]+/, "").trim();
  const extenso = integerToPortuguese(numeric);
  if (!suffix) return extenso;
  return `${extenso} ${suffix.toUpperCase()}`.trim();
}
function fmtNum(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}
function fmtNumWithDecimals(value, decimals) {
  if (!Number.isFinite(value)) return "—";
  if (decimals !== void 0) return fmtNum(value, decimals);
  return fmtNum(value, inferDecimalPlaces(value));
}
function inferDecimalPlaces(value) {
  if (!Number.isFinite(value)) return 2;
  if (Number.isInteger(value)) return 0;
  const fixed = value.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
  const dot = fixed.indexOf(".");
  return dot >= 0 ? fixed.length - dot - 1 : 0;
}
function fmtArea(value, decimals = 2) {
  return `${fmtNum(value, decimals)} m²`;
}
function parseLoteQuadra(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { lote: "", quadra: "" };
  const match = trimmed.match(/^lote\s*(?:n[º°]?\s*)?([^,]+?)(?:,\s*quadra\s*(?:n[º°]?\s*)?(.+))?$/i);
  if (match) {
    return {
      lote: stripLoteQuadraPrefix(match[1]),
      quadra: stripLoteQuadraPrefix(match[2] ?? "")
    };
  }
  return { lote: stripLoteQuadraPrefix(trimmed), quadra: "" };
}
function normalizeLoteQuadraFields(loteRaw, quadraRaw, loteExtensoRaw, quadraExtensoRaw) {
  let lote = stripLoteQuadraPrefix(loteRaw);
  let quadra = stripLoteQuadraPrefix(quadraRaw);
  if (!quadra && (/^lote\s/i.test(loteRaw.trim()) || /quadra/i.test(loteRaw))) {
    const parsed = parseLoteQuadra(loteRaw);
    lote = parsed.lote;
    quadra = parsed.quadra;
  }
  const loteExtenso = loteExtensoRaw?.trim() || (lote ? loteQuadraPorExtenso(lote) : "");
  const quadraExtenso = quadraExtensoRaw?.trim() || (quadra ? loteQuadraPorExtenso(quadra) : "");
  return { lote, quadra, loteExtenso, quadraExtenso };
}
function parseBrNumeric(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}
const UF_NOME_EXTENSO = {
  AC: "ACRE",
  AL: "ALAGOAS",
  AP: "AMAPÁ",
  AM: "AMAZONAS",
  BA: "BAHIA",
  CE: "CEARÁ",
  DF: "DISTRITO FEDERAL",
  ES: "ESPÍRITO SANTO",
  GO: "GOIÁS",
  MA: "MARANHÃO",
  MT: "MATO GROSSO",
  MS: "MATO GROSSO DO SUL",
  MG: "MINAS GERAIS",
  PA: "PARÁ",
  PB: "PARAÍBA",
  PR: "PARANÁ",
  PE: "PERNAMBUCO",
  PI: "PIAUÍ",
  RJ: "RIO DE JANEIRO",
  RN: "RIO GRANDE DO NORTE",
  RS: "RIO GRANDE DO SUL",
  RO: "RONDÔNIA",
  RR: "RORAIMA",
  SC: "SANTA CATARINA",
  SP: "SÃO PAULO",
  SE: "SERGIPE",
  TO: "TOCANTINS"
};
function ufPorExtenso(uf) {
  const key = uf.trim().toUpperCase();
  return UF_NOME_EXTENSO[key] ?? "";
}
function parseBrDate(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return null;
}
function formatEstadoUf(uf, estadoExtenso) {
  const sigla = uf.trim();
  if (!sigla || sigla === "—") return "—";
  const extensoRaw = estadoExtenso?.trim() ?? "";
  const extenso = extensoRaw && extensoRaw !== "—" ? extensoRaw : ufPorExtenso(sigla);
  if (!extenso || extenso.toUpperCase() === sigla.toUpperCase()) return sigla;
  return `${sigla} — ${extenso}`;
}
const SHEET_PRELIMINARES = "INFORMAÇÕES PRELIMINARES";
const SHEET_MATCHERS = {
  qi: [/^QUADRO I$/i],
  qii: [/^QUADRO II$/i],
  qiii: [/^QUADRO III$/i],
  qiva: [/^QUADRO IV\s*A$/i],
  qivb: [
    /^QUADRO IV\s*B[\s._-]?[1I]$/i,
    /^QUADRO IV\s*B1$/i,
    /^QUADRO IV\s*B(?![\s._-]?[1I])/i
  ],
  qv: [/^QUADRO V$/i],
  qvi: [/^QUADRO VI$/i],
  qvii: [/^QUADRO VII$/i],
  qviii: [/^QUADRO VIII$/i],
  qcomp: [/^QUADRO COMP/i, /COMPLEMENTAR/i],
  resumo: [/^QUADRO RESUMO$/i]
};
const QUADROS_WIZARD_STEPS = [
  {
    id: "upload",
    titulo: "Upload do quadro",
    descricao: "Envie o arquivo XLS/XLSX no padrão ABNT NBR 12.721."
  },
  {
    id: "preliminares",
    titulo: "Informações Preliminares",
    descricao: "Valide incorporador, responsável técnico e dados do projeto."
  },
  {
    id: "qi",
    titulo: "Quadro I",
    descricao: "Cálculo das áreas nos pavimentos (colunas 1 a 18)."
  },
  {
    id: "qii",
    titulo: "Quadro II",
    descricao: "Cálculo das áreas das unidades autônomas (colunas 19 a 38)."
  },
  {
    id: "qiii",
    titulo: "Quadro III",
    descricao: "Avaliação do custo global e unitário da construção."
  },
  {
    id: "qiva",
    titulo: "Quadro IV A",
    descricao: "Custo de construção por unidade e re-rateio."
  },
  {
    id: "qivb",
    titulo: "Quadro IV B",
    descricao: "Resumo das áreas reais para registro (colunas A a G ou IV B.1)."
  },
  {
    id: "qv",
    titulo: "Quadro V",
    descricao: "Informações gerais e explicitação das unidades."
  },
  {
    id: "qvi",
    titulo: "Quadro VI",
    descricao: "Memorial descritivo dos equipamentos."
  },
  {
    id: "qvii",
    titulo: "Quadro VII",
    descricao: "Memorial descritivo dos acabamentos (uso privativo)."
  },
  {
    id: "qviii",
    titulo: "Quadro VIII",
    descricao: "Memorial descritivo dos acabamentos (uso comum)."
  },
  {
    id: "qcomp",
    titulo: "Quadro Complementar",
    descricao: "Áreas nos pavimentos por torre (variante multi-torre)."
  },
  {
    id: "resumo",
    titulo: "Quadro Resumo",
    descricao: "Frações, valores e confrontações por unidade."
  },
  {
    id: "revisao",
    titulo: "Revisão cruzada",
    descricao: "Confira alertas entre quadros antes de criar o empreendimento."
  }
];
const QUADROS_DETAIL_STEPS = QUADROS_WIZARD_STEPS.filter((s) => s.id !== "upload");
const QUADRO_TITULOS = {
  preliminares: "Informações Preliminares",
  qi: "Quadro I — Áreas nos Pavimentos",
  qii: "Quadro II — Áreas das Unidades",
  qiii: "Quadro III — Custo Global",
  qiva: "Quadro IV A — Custo por Unidade",
  qivb: "Quadro IV B — Áreas Reais",
  qv: "Quadro V — Informações Gerais",
  qvi: "Quadro VI — Equipamentos",
  qvii: "Quadro VII — Acabamentos Privativos",
  qviii: "Quadro VIII — Acabamentos Comuns",
  qcomp: "Quadro Complementar — Áreas por Torre",
  resumo: "Quadro Resumo — Frações e Confrontações"
};
const ACCEPTED_QUADRO_EXTENSIONS = [".xlsx", ".xls", ".csv"];
function readWorkbookFromArrayBuffer(buffer) {
  return readSync(buffer, { type: "array", cellDates: true });
}
function sheetToMatrix(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const matrix = utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false
  });
  if (!sheet["!ref"]) return matrix;
  const range = utils.decode_range(sheet["!ref"]);
  for (let r = range.s.r; r <= range.e.r; r++) {
    const rowIdx = r - range.s.r;
    if (!matrix[rowIdx]) matrix[rowIdx] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const colIdx = c - range.s.c;
      const addr = utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (cell?.w != null && cell.w !== "") {
        matrix[rowIdx][colIdx] = cell.w;
        continue;
      }
      const current = matrix[rowIdx][colIdx];
      if (current === null || current === void 0 || current === "") {
        if (cell?.t === "n" && typeof cell.v === "number") {
          matrix[rowIdx][colIdx] = cell.v;
        } else if (cell?.v != null && cell.v !== "") {
          matrix[rowIdx][colIdx] = String(cell.v);
        }
      }
    }
  }
  return matrix;
}
function cellStr(value) {
  if (value === null || value === void 0) return "";
  return String(value).replace(/\s+/g, " ").trim();
}
function countDecimalPlaces(raw) {
  const cleaned = raw.replace(/R\$\s*/gi, "").replace(/m²|m2/gi, "").replace(/%/g, "").trim().replace(/\s/g, "");
  if (!cleaned) return 0;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastDot > lastComma) {
      const fraction2 = cleaned.split(".")[1] ?? "";
      return fraction2.replace(/\D/g, "").length;
    }
    const fraction = cleaned.split(",")[1] ?? "";
    return fraction.replace(/\D/g, "").length;
  }
  if (hasComma) {
    const parts = cleaned.split(",");
    return (parts[parts.length - 1] ?? "").replace(/\D/g, "").length;
  }
  if (hasDot) {
    const parts = cleaned.split(".");
    if (parts.length === 2) {
      if (parts[1].length === 3 && parts[0].length <= 3) return 0;
      return parts[1].replace(/\D/g, "").length;
    }
    return 0;
  }
  return 0;
}
function cellNumParsed(value) {
  const raw = cellStr(value);
  if (!raw) return { value: null, decimals: null };
  const parsed = cellNum(value);
  if (parsed === null) return { value: null, decimals: null };
  return { value: parsed, decimals: countDecimalPlaces(raw) };
}
function cellNum(value) {
  const raw = cellStr(value);
  if (!raw) return null;
  let normalized = raw.replace(/R\$\s*/gi, "").replace(/m²|m2/gi, "").replace(/%/g, "").replace(/\s/g, "");
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");
  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    if (lastDot > lastComma) {
      normalized = normalized.replace(/,/g, "");
    } else {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    }
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
function normalizeNumericDisplayPtBr(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  const hasM2 = /m²|m2/i.test(trimmed);
  const hasCurrency = /R\$/i.test(trimmed);
  const hasPercent = /%/.test(trimmed);
  const withoutUnits = trimmed.replace(/R\$\s*/gi, "").replace(/m²|m2/gi, "").replace(/%/g, "").trim();
  if (/[a-záàâãéêíóôõúç]{2,}/i.test(withoutUnits)) return raw;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(withoutUnits)) return raw;
  const { value, decimals } = cellNumParsed(trimmed);
  if (value === null) return raw;
  const dec = decimals ?? inferDecimalPlaces(value);
  const formatted = fmtNum(value, dec);
  if (hasM2) return `${formatted} m²`;
  if (hasCurrency) return `R$ ${formatted}`;
  if (hasPercent) return `${formatted}%`;
  return formatted;
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function cellMatchesItemNumber(text, itemNumber) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (itemNumber === "3") {
    if (/3\.\d+\.\d+/.test(trimmed)) return false;
    return /(?:^|\s)3\.\s/.test(trimmed) && trimmed.length > 10;
  }
  if (itemNumber === "5") {
    return /(?:^|\s)5\.?\s/i.test(trimmed) && /custo básico global/i.test(trimmed);
  }
  if (itemNumber === "7") {
    return /(?:^|\s)7\.?\s/i.test(trimmed) && /1º\s*subtotal|1o\s*subtotal/i.test(trimmed);
  }
  if (itemNumber === "10") {
    return /(?:^|\s)10\.?\s/i.test(trimmed) && /2º\s*subtotal|2o\s*subtotal/i.test(trimmed);
  }
  if (itemNumber === "11") {
    return /(?:^|\s)11\.?\s/i.test(trimmed) && /construtor/i.test(trimmed);
  }
  if (itemNumber === "12") {
    return /(?:^|\s)12\.?\s/i.test(trimmed) && /incorporador/i.test(trimmed);
  }
  if (itemNumber === "13") {
    return /(?:^|\s)13\.?\s/i.test(trimmed) && /custo global da construção/i.test(trimmed);
  }
  const escaped = escapeRegExp(itemNumber);
  const pattern = new RegExp(`(?:^|\\s)${escaped}(?=\\s|(?:\\.(?!\\d))|$|-)`, "i");
  if (!pattern.test(trimmed)) return false;
  if (/^\d+([.,]\d+)?$/.test(trimmed)) return false;
  return true;
}
function isPercentOnlyCell$1(value) {
  const cleaned = value.replace(/\s/g, "");
  return /^%?$/.test(cleaned) || /^\d+([.,]\d+)?%$/.test(cleaned);
}
function isItemNumberCell(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^\d+\.\d+/.test(trimmed);
}
function isBareCurrencyMarker(value) {
  return /^R\$\s*=?$/i.test(value.trim());
}
function isCurrencyUnitLabel(value) {
  const text = value.trim();
  if (!text) return false;
  return /^R\$\s*por\s*m2?\s*=?\s*$/i.test(text) || /^R\$\s*\/\s*m2?\s*=?$/i.test(text) || text.startsWith("R$") && /por\s*m2/i.test(text) && cellNum(text) === null;
}
function readMoneyAt(row, col) {
  const val = cellStr(row[col]);
  if (!val) return null;
  if (isBareCurrencyMarker(val)) {
    const next = cellStr(row[col + 1]);
    if (next && cellNum(next) !== null) {
      return { valor: `R$ ${next}`, col: col + 1 };
    }
    return null;
  }
  if (/R\$/i.test(val) && cellNum(val) !== null) {
    return { valor: val, col };
  }
  if (/R\$/i.test(val)) {
    const next = cellStr(row[col + 1]);
    if (next && cellNum(next) !== null) {
      return { valor: `${val} ${next}`.replace(/\s+/g, " ").trim(), col: col + 1 };
    }
  }
  return null;
}
function extractLastMoneyInRow(row) {
  for (let k = row.length - 1; k >= 0; k--) {
    const money = readMoneyAt(row, k);
    if (money) return money;
  }
  for (let k = row.length - 1; k >= 0; k--) {
    const val = cellStr(row[k]);
    if (!val || isPercentOnlyCell$1(val) || isItemNumberCell(val)) continue;
    if (isCurrencyUnitLabel(val)) continue;
    if (isInlineFieldLabel(val)) continue;
    if (cellNum(val) !== null) return { valor: val, col: k };
  }
  return null;
}
function extractStandardMoneyColumns(row) {
  return readMoneyAt(row, 9) ?? readMoneyAt(row, 7);
}
function extractValueFromNumberedRow(row, labelCol) {
  const standardMoney = extractStandardMoneyColumns(row);
  if (standardMoney) return standardMoney;
  const moneyCandidates = [];
  const numericCandidates = [];
  const textCandidates = [];
  for (let k = labelCol + 1; k < row.length; k++) {
    const val = cellStr(row[k]);
    if (!val || isPercentOnlyCell$1(val) || isItemNumberCell(val)) continue;
    if (isCurrencyUnitLabel(val)) continue;
    if (isInlineFieldLabel(val)) continue;
    const money = readMoneyAt(row, k);
    if (money) {
      moneyCandidates.push(money);
      if (isBareCurrencyMarker(val)) k += 1;
      continue;
    }
    const next = cellStr(row[k + 1]);
    if (cellNum(val) !== null && /m2|m²/i.test(next)) {
      return { valor: val, col: k };
    }
    if (cellNum(val) !== null) {
      numericCandidates.push({ valor: val, col: k });
      continue;
    }
    if (val.length > 1 && !/^\/\s*m2?$/i.test(val) && !isQuadroHeaderLikeValue(val) && !isInlineFieldLabel(val)) {
      textCandidates.push({ valor: val, col: k });
    }
  }
  if (moneyCandidates.length > 0) return moneyCandidates[moneyCandidates.length - 1];
  if (numericCandidates.length > 0) return numericCandidates[numericCandidates.length - 1];
  if (textCandidates.length > 0) return textCandidates[textCandidates.length - 1];
  return extractLastMoneyInRow(row);
}
function findRowValueByItemNumber(matrix, itemNumber) {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    let labelCol = -1;
    for (let c = 0; c < row.length; c++) {
      if (cellMatchesItemNumber(cellStr(row[c]), itemNumber)) {
        labelCol = c;
        break;
      }
    }
    if (labelCol < 0) continue;
    const extracted = extractValueFromNumberedRow(row, labelCol);
    if (!extracted) continue;
    return {
      valor: normalizeNumericDisplayPtBr(extracted.valor),
      row: r,
      col: extracted.col
    };
  }
  return null;
}
function labelCellMatches(text, needle) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^\d+(\.\d+)*$/.test(needle)) {
    return cellMatchesItemNumber(trimmed, needle);
  }
  return trimmed.toLowerCase().includes(needle.toLowerCase());
}
const LABEL_HEADER_PATTERN = /^(designação|padrão de acabamento|número de pavimentos|área equivalente|dependências|quartos|salas|banheiros)/i;
function isQuadroHeaderLikeValue(value) {
  const text = value.trim();
  if (!text) return true;
  return LABEL_HEADER_PATTERN.test(text);
}
function isInlineFieldLabel(value) {
  const text = value.trim();
  if (!text) return true;
  if (text.endsWith(":")) return true;
  if (/^(cep|cnpj|cpf|rg|art|cau|c\.e\.p)\s*:?\s*$/i.test(text)) return true;
  if (/^número de registro profissional/i.test(text)) return true;
  if (/^registro (no|profissional)/i.test(text)) return true;
  if (/^(nome|cnpj|cep|endereço|logradouro|município|profissional responsável|incorporador|anotação de responsabilidade)\b/i.test(
    text
  )) {
    return true;
  }
  return false;
}
function findSameRowValue(row, labelCol, preferCol) {
  if (preferCol !== void 0) {
    const preferred = cellStr(row[preferCol]);
    if (preferred && !isQuadroHeaderLikeValue(preferred)) {
      return { valor: preferred, col: preferCol };
    }
  }
  for (let k = row.length - 1; k > labelCol; k--) {
    const val = cellStr(row[k]);
    if (!val || isQuadroHeaderLikeValue(val) || isPercentOnlyCell$1(val)) continue;
    if (isItemNumberCell(val)) continue;
    if (isInlineFieldLabel(val)) continue;
    return { valor: val, col: k };
  }
  return null;
}
function findRowIndex(matrix, predicate) {
  return matrix.findIndex(predicate);
}
function findLabelValue(matrix, labelIncludes, startRow = 0) {
  const isNumericLabel = /^\d+(\.\d+)*$/.test(labelIncludes.trim());
  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const text = cellStr(row[c]);
      if (!labelCellMatches(text, labelIncludes)) continue;
      if (isNumericLabel || /r\$\s*por\s*m2/i.test(labelIncludes)) {
        const extracted = extractValueFromNumberedRow(row, c);
        if (extracted) {
          return {
            valor: normalizeNumericDisplayPtBr(extracted.valor),
            row: r,
            col: extracted.col
          };
        }
        continue;
      }
      for (let k = c + 1; k < row.length; k++) {
        const candidate = cellStr(row[k]);
        if (!candidate || isItemNumberCell(candidate)) continue;
        if (isInlineFieldLabel(candidate)) continue;
        if (isQuadroHeaderLikeValue(candidate)) continue;
        if (isCurrencyUnitLabel(candidate)) continue;
        const money = readMoneyAt(row, k);
        if (money) {
          return {
            valor: normalizeNumericDisplayPtBr(money.valor),
            row: r,
            col: money.col
          };
        }
        if (cellNum(candidate) !== null) {
          return { valor: normalizeNumericDisplayPtBr(candidate), row: r, col: k };
        }
        return { valor: normalizeNumericDisplayPtBr(candidate), row: r, col: k };
      }
    }
  }
  return null;
}
function extractFolhaInfo(matrix) {
  const folhaRaw = findLabelValue(matrix, "folha");
  const totalRaw = findLabelValue(matrix, "total de folhas");
  return {
    folha: folhaRaw ? cellNum(folhaRaw.valor) : null,
    totalFolhas: totalRaw ? cellNum(totalRaw.valor) : null
  };
}
function slicePreview(matrix, maxRows = 28) {
  return matrix.slice(0, maxRows).map(
    (row) => (row ?? []).slice(0, 14).map((cell) => {
      const text = normalizeNumericDisplayPtBr(cellStr(cell));
      return text.length > 48 ? `${text.slice(0, 45)}…` : text;
    })
  );
}
function isBlocoRow(designacao) {
  return /^bloco\s+\d+/i.test(designacao);
}
function isTorreRow(designacao) {
  return /^torre\s+\d+/i.test(designacao);
}
function isTorreOuBlocoRow(designacao) {
  return isBlocoRow(designacao) || isTorreRow(designacao);
}
function findSheetName(sheetNames, matchers) {
  for (const matcher of matchers) {
    for (const name of sheetNames) {
      const normalized = name.toUpperCase().trim();
      if (typeof matcher === "string") {
        if (normalized === matcher.toUpperCase() || normalized.includes(matcher.toUpperCase())) {
          return name;
        }
      } else if (matcher.test(name)) {
        return name;
      }
    }
  }
  return void 0;
}
function isDataEndRow(firstCell) {
  const upper = firstCell.toUpperCase();
  return upper.startsWith("TOTAIS") || upper.startsWith("TOTAL GERAL") || upper.startsWith("OBSERVA") || upper.startsWith("ÁREA REAL GLOBAL");
}
function isQuadroSheetHeaderRow(text) {
  const t = text.trim();
  if (!t) return true;
  return /^informações para arquivo/i.test(t) || /^\(?lei\s+4\.591/i.test(t) || /^quadro\s+(i{1,3}|iv|v|vi{1,3}|resumo)/i.test(t) || /^local do imóvel/i.test(t) || /^empreendimento:/i.test(t) || /^logradouro:/i.test(t) || /^lote\s*\/\s*quadra:/i.test(t) || /^município\s*\/\s*uf:/i.test(t) || /^designação da unidade/i.test(t) || /^profissional responsável/i.test(t) || /^incorporador/i.test(t) || /^folha\s*n[oº°]/i.test(t) || /^total de folhas:/i.test(t) || /^unidade$/i.test(t) || /^cálculo das áreas/i.test(t) || /^resumo das áreas reais/i.test(t);
}
function isColunaMarkerRow(text) {
  return /^[A-G]$/i.test(text.trim());
}
const UNIDADE_DESIGNACAO_PATTERNS = [
  /^apartamento\s+\S+/i,
  /^vaga\s+autônoma\s+n[º°]?\s*\S+/i,
  /^vaga\s+autônoma\s/i,
  /^vaga\s+n[º°]?\s*\S+/i,
  /^vaga\s+\S+/i,
  /^sala\s+comercial\b/i,
  /^dep[óo]sito\s+\S+/i,
  /^garden\s+\S+/i,
  /^loja\s+\S+/i,
  /^garagem\s+\S+/i,
  /^box\s+\S+/i,
  /^cobertura\s+\S+/i,
  /^unidade\s+\S+/i
];
function isUnidadeDesignacaoValida(designacao) {
  const t = designacao.trim();
  if (!t) return false;
  if (isQuadroSheetHeaderRow(t)) return false;
  if (isColunaMarkerRow(t)) return false;
  if (isDataEndRow(t)) return false;
  if (isTorreOuBlocoRow(t)) return false;
  if (/^coluna\s+\d+/i.test(t)) return false;
  return UNIDADE_DESIGNACAO_PATTERNS.some((pattern) => pattern.test(t));
}
function designacaoParaExibicao(designacao) {
  const t = designacao.trim().replace(/\s+/g, " ");
  const extrair = [
    /^(apartamento\s+[\w./-]+)/i,
    /^(vaga\s+autônoma\s*n[º°]?\s*[\w./-]+)/i,
    /^(vaga\s+[\w./-]+)/i,
    /^(sala\s+comercial(?:\s+[\w./-]+)?)/i,
    /^(dep[óo]sito\s+[\w./-]+)/i,
    /^(garden(?:\s+[\w./-]+)?)/i,
    /^(loja\s+[\w./-]+)/i,
    /^(garagem\s+[\w./-]+)/i,
    /^(box\s+[\w./-]+)/i,
    /^(cobertura\s+[\w./-]+)/i
  ];
  for (const pattern of extrair) {
    const match = t.match(pattern);
    if (match) return match[1];
  }
  if (t.length <= 48) return t;
  return `${t.slice(0, 45)}…`;
}
function parseCabecalhoPadrao(matrix) {
  const empreendimento = findLabelValue(matrix, "empreendimento:")?.valor ?? "";
  const logradouro = findLabelValue(matrix, "logradouro:")?.valor ?? "";
  const loteQuadra = findLabelValue(matrix, "lote / quadra:")?.valor ?? "";
  const municipioUf = findLabelValue(matrix, "município / uf:")?.valor ?? "";
  const incorporadorNome = findLabelValue(matrix, "nome:")?.valor ?? "";
  const socios = [];
  for (const row of matrix.slice(0, 12)) {
    for (let c = 0; c < (row?.length ?? 0); c++) {
      if (!cellStr(row[c]).toLowerCase().includes("sócio administrador")) continue;
      for (let k = c + 1; k < (row?.length ?? 0); k++) {
        const nome = cellStr(row[k]);
        if (nome && !nome.toLowerCase().includes("sócio")) {
          socios.push(nome);
          break;
        }
      }
    }
  }
  const responsavelNome = findLabelValue(matrix, "registro no crea:") !== null ? findNthLabelBefore(matrix, "registro no crea:", "nome:") : "";
  const responsavelCrea = findLabelValue(matrix, "registro no crea:")?.valor ?? "";
  return {
    empreendimento,
    logradouro,
    loteQuadra,
    municipioUf,
    incorporadorNome,
    incorporadorSocios: socios,
    responsavelNome,
    responsavelCrea
  };
}
function findNthLabelBefore(matrix, anchor, label) {
  const anchorIdx = findLabelValue(matrix, anchor);
  if (!anchorIdx) return "";
  for (let r = anchorIdx.row; r >= Math.max(0, anchorIdx.row - 3); r--) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (!cellStr(row[c]).toLowerCase().includes(label)) continue;
      for (let k = c + 1; k < row.length; k++) {
        const val = cellStr(row[k]);
        if (val) return val;
      }
    }
  }
  return "";
}
const DEFAULT_QIVB_COLUMN_MAP = {
  areaPrivativaPrincipal: 1,
  areaPrivativaAcessoria: 2,
  areaPrivativaTotal: 3,
  areaUsoComum: 4,
  areaRealTotal: 5,
  coeficienteProporcionalidade: 6,
  quantidadeIdenticas: 7,
  observacoes: 8
};
const OBSERVACOES_HEADER = /observa[çc][oõeê]s?|observa[çc][aã]o|obs\.?\b/i;
const OBSERVACOES_VAGA_HINT = /direito\s+de\s+uso|\bvaga\b/i;
function isObservacoesText(value) {
  const text = value.trim();
  if (!text) return false;
  return OBSERVACOES_VAGA_HINT.test(text);
}
function resolveObservacoesFromRow(row, columnMap) {
  const mapped = cellStr(row[columnMap.observacoes]).trim();
  if (mapped) return mapped;
  if (columnMap.quantidadeIdenticas >= 0) {
    const qtdCell = cellStr(row[columnMap.quantidadeIdenticas]).trim();
    if (qtdCell && isObservacoesText(qtdCell) && cellNumParsed(row[columnMap.quantidadeIdenticas]).value === null) {
      return qtdCell;
    }
  }
  const startCol = Math.max(
    columnMap.coeficienteTerreno ?? -1,
    columnMap.quantidadeIdenticas ?? -1,
    columnMap.coeficienteProporcionalidade ?? 6
  ) + 1;
  for (let c = Math.max(startCol, 0); c < row.length; c++) {
    const text = cellStr(row[c]).trim();
    if (text && isObservacoesText(text)) return text;
  }
  for (let c = 7; c < row.length; c++) {
    if (c === columnMap.observacoes || c === columnMap.quantidadeIdenticas) continue;
    const text = cellStr(row[c]).trim();
    if (text && isObservacoesText(text)) return text;
  }
  return "";
}
function findColumnByHeader(matrix, pattern, startCol = 0) {
  for (let r = 0; r < Math.min(matrix.length, 60); r++) {
    const row = matrix[r] ?? [];
    for (let c = startCol; c < row.length; c++) {
      if (pattern.test(cellStr(row[c]))) return c;
    }
  }
  return -1;
}
function buildQivbColumnMap(matrix, letterRowHint) {
  const letters = {};
  let letterRow = letterRowHint ?? -1;
  if (letterRow < 0) {
    letterRow = findRowIndex(
      matrix,
      (row) => cellStr(row[0]).toUpperCase() === "A" && cellStr(row[1]).toUpperCase() === "B"
    );
  }
  if (letterRow >= 0) {
    const row = matrix[letterRow] ?? [];
    for (let c = 0; c < row.length; c++) {
      const letter = cellStr(row[c]).toUpperCase();
      if (/^[A-J]$/.test(letter) && letters[letter] === void 0) {
        letters[letter] = c;
      }
    }
  }
  const col = (letter, fallback) => letters[letter] ?? fallback;
  const afterG = col("G", 6) + 1;
  let qtdCol = findColumnByHeader(
    matrix,
    /quantidade.*(?:unidades|número).*idênticas|número de unidades idênticas/i,
    afterG
  );
  let obsCol = findColumnByHeader(
    matrix,
    OBSERVACOES_HEADER,
    qtdCol >= 0 ? qtdCol + 1 : afterG
  );
  if (qtdCol < 0) qtdCol = col("H", 7);
  if (obsCol < 0) obsCol = col("I", 8);
  return {
    areaPrivativaPrincipal: col("B", 1),
    areaPrivativaAcessoria: col("C", 2),
    areaPrivativaTotal: col("D", 3),
    areaUsoComum: col("E", 4),
    areaRealTotal: col("F", 5),
    coeficienteProporcionalidade: col("G", 6),
    quantidadeIdenticas: qtdCol,
    observacoes: obsCol
  };
}
function buildQivb1ColumnMap(matrix, letterRowHint) {
  const letters = {};
  let letterRow = letterRowHint ?? -1;
  if (letterRow < 0) {
    letterRow = findRowIndex(
      matrix,
      (row) => cellStr(row[0]).toUpperCase() === "A" && cellStr(row[1]).toUpperCase() === "B"
    );
  }
  if (letterRow >= 0) {
    const row = matrix[letterRow] ?? [];
    for (let c = 0; c < row.length; c++) {
      const letter = cellStr(row[c]).toUpperCase();
      if (/^[A-J]$/.test(letter) && letters[letter] === void 0) {
        letters[letter] = c;
      }
    }
  }
  const col = (letter, fallback) => letters[letter] ?? fallback;
  const afterJ = col("J", 9) + 1;
  let qtdCol = findColumnByHeader(
    matrix,
    /quantidade.*(?:unidades|número).*idênticas|número de unidades idênticas/i,
    afterJ
  );
  let obsCol = findColumnByHeader(
    matrix,
    OBSERVACOES_HEADER,
    qtdCol >= 0 ? qtdCol + 1 : afterJ
  );
  if (qtdCol < 0) {
    qtdCol = findColumnByHeader(matrix, /quantidade/i, afterJ);
  }
  if (obsCol < 0) obsCol = col("K", 10);
  if (obsCol < 0) obsCol = col("L", 11);
  return {
    areaPrivativaPrincipal: col("B", 1),
    areaPrivativaAcessoria: col("C", 2),
    areaPrivativaTotal: col("D", 3),
    areaUsoComum: col("E", 4),
    areaRealTotal: col("F", 5),
    areaTerrenoExclusivo: col("G", 6),
    areaTerrenoComum: col("H", 7),
    coeficienteProporcionalidade: col("I", 8),
    coeficienteTerreno: col("J", 9),
    quantidadeIdenticas: qtdCol >= 0 ? qtdCol : col("K", 10),
    observacoes: obsCol >= 0 ? obsCol : col("L", 11)
  };
}
function parseNumericField(target, fieldKey, cell) {
  const { value, decimals } = cellNumParsed(cell);
  if (value !== null && decimals !== null) {
    target.formatDecimals ??= {};
    target.formatDecimals[fieldKey] = decimals;
  }
  return value;
}
function assignNumericField(target, fieldKey, cell) {
  const value = parseNumericField(target, fieldKey, cell);
  target[fieldKey] = value;
}
function finalizeFormatDecimals(target) {
  if (target.formatDecimals && Object.keys(target.formatDecimals).length === 0) {
    delete target.formatDecimals;
  }
}
const PAVIMENTO_FIELDS = [
  { field: "areaPrivativaCobertaPadrao", col: 1 },
  { field: "areaPrivativaCobertaDiferenteReal", col: 2 },
  { field: "areaPrivativaCobertaDiferenteEquivalente", col: 3 },
  { field: "areaPrivativaTotalReal", col: 4 },
  { field: "areaPrivativaTotalEquivalente", col: 5 },
  { field: "areaUsoComumNaoPropCobertaPadrao", col: 6 },
  { field: "areaUsoComumNaoPropCobertaDiferenteReal", col: 7 },
  { field: "areaUsoComumNaoPropCobertaDiferenteEquivalente", col: 8 },
  { field: "areaUsoComumNaoPropTotalReal", col: 9 },
  { field: "areaUsoComumNaoPropTotalEquivalente", col: 10 },
  { field: "areaUsoComumPropCobertaPadrao", col: 11 },
  { field: "areaUsoComumPropCobertaDiferenteReal", col: 12 },
  { field: "areaUsoComumPropCobertaDiferenteEquivalente", col: 13 },
  { field: "areaUsoComumPropTotalReal", col: 14 },
  { field: "areaUsoComumPropTotalEquivalente", col: 15 },
  { field: "areaPavimentoReal", col: 16 },
  { field: "areaPavimentoEquivalente", col: 17 },
  { field: "quantidadePavimentosIdenticos", col: 18 }
];
function parseLinhaPavimentoFromRow(row, meta) {
  const linha = {
    pavimento: meta.pavimento,
    torre: meta.torre,
    formatDecimals: {},
    areaPrivativaCobertaPadrao: null,
    areaPrivativaCobertaDiferenteReal: null,
    areaPrivativaCobertaDiferenteEquivalente: null,
    areaPrivativaTotalReal: null,
    areaPrivativaTotalEquivalente: null,
    areaUsoComumNaoPropCobertaPadrao: null,
    areaUsoComumNaoPropCobertaDiferenteReal: null,
    areaUsoComumNaoPropCobertaDiferenteEquivalente: null,
    areaUsoComumNaoPropTotalReal: null,
    areaUsoComumNaoPropTotalEquivalente: null,
    areaUsoComumPropCobertaPadrao: null,
    areaUsoComumPropCobertaDiferenteReal: null,
    areaUsoComumPropCobertaDiferenteEquivalente: null,
    areaUsoComumPropTotalReal: null,
    areaUsoComumPropTotalEquivalente: null,
    areaPavimentoReal: null,
    areaPavimentoEquivalente: null,
    quantidadePavimentosIdenticos: null
  };
  for (const { field, col } of PAVIMENTO_FIELDS) {
    assignNumericField(linha, field, row[col]);
  }
  finalizeFormatDecimals(linha);
  return linha;
}
function parseLinhaUnidadeAreaFromRow(row, meta) {
  const linha = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {},
    areaPrivativaCobertaPadrao: null,
    areaPrivativaCobertaDiferenteReal: null,
    areaPrivativaCobertaDiferenteEquivalente: null,
    areaPrivativaTotalReal: null,
    areaPrivativaTotalEquivalente: null,
    areaUsoComumNaoPropCobertaPadrao: null,
    areaUsoComumNaoPropCobertaDiferenteReal: null,
    areaUsoComumNaoPropCobertaDiferenteEquivalente: null,
    areaUsoComumNaoPropTotalReal: null,
    areaUsoComumNaoPropTotalEquivalente: null,
    coeficienteProporcionalidade: null,
    areaUnidadeReal: null,
    areaUnidadeEquivalente: null
  };
  const fields = [
    { field: "areaPrivativaCobertaPadrao", col: 1 },
    { field: "areaPrivativaCobertaDiferenteReal", col: 2 },
    { field: "areaPrivativaCobertaDiferenteEquivalente", col: 3 },
    { field: "areaPrivativaTotalReal", col: 4 },
    { field: "areaPrivativaTotalEquivalente", col: 5 },
    { field: "areaUsoComumNaoPropCobertaPadrao", col: 6 },
    { field: "areaUsoComumNaoPropCobertaDiferenteReal", col: 7 },
    { field: "areaUsoComumNaoPropCobertaDiferenteEquivalente", col: 8 },
    { field: "areaUsoComumNaoPropTotalReal", col: 9 },
    { field: "areaUsoComumNaoPropTotalEquivalente", col: 10 },
    { field: "coeficienteProporcionalidade", col: 12 },
    { field: "areaUnidadeReal", col: 18 },
    { field: "areaUnidadeEquivalente", col: 19 }
  ];
  for (const { field, col } of fields) {
    assignNumericField(linha, field, row[col]);
  }
  finalizeFormatDecimals(linha);
  return linha;
}
function parseLinhaUnidadeRealFromRow(row, meta, columnMap = DEFAULT_QIVB_COLUMN_MAP) {
  const linha = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    observacoes: resolveObservacoesFromRow(row, columnMap),
    formatDecimals: {},
    areaPrivativaPrincipal: null,
    areaPrivativaAcessoria: null,
    areaPrivativaTotal: null,
    areaUsoComum: null,
    areaRealTotal: null,
    coeficienteProporcionalidade: null,
    quantidadeIdenticas: null
  };
  const fields = [
    { field: "areaPrivativaPrincipal", col: columnMap.areaPrivativaPrincipal },
    { field: "areaPrivativaAcessoria", col: columnMap.areaPrivativaAcessoria },
    { field: "areaPrivativaTotal", col: columnMap.areaPrivativaTotal },
    { field: "areaUsoComum", col: columnMap.areaUsoComum },
    { field: "areaRealTotal", col: columnMap.areaRealTotal },
    { field: "coeficienteProporcionalidade", col: columnMap.coeficienteProporcionalidade },
    { field: "quantidadeIdenticas", col: columnMap.quantidadeIdenticas },
    { field: "areaTerrenoExclusivo", col: columnMap.areaTerrenoExclusivo },
    { field: "areaTerrenoComum", col: columnMap.areaTerrenoComum },
    { field: "coeficienteTerreno", col: columnMap.coeficienteTerreno }
  ];
  for (const { field, col } of fields) {
    if (col === void 0) continue;
    assignNumericField(linha, field, row[col]);
  }
  finalizeFormatDecimals(linha);
  return linha;
}
const DEFAULT_CONFRONTACAO_LABELS = {
  norte: "Norte",
  sul: "Sul",
  leste: "Leste",
  oeste: "Oeste"
};
const MADRID_CONFRONTACAO_LABELS = {
  norte: "Noroeste",
  sul: "Sudoeste",
  leste: "Nordeste",
  oeste: "Sudeste"
};
function parseResumoConfrontacaoLabels(matrix, headerRow, madridLayout) {
  if (madridLayout) {
    for (let r = headerRow + 1; r <= headerRow + 3; r++) {
      const row = matrix[r] ?? [];
      const first = cellStr(row[12]).toUpperCase();
      if (/NOROESTE|NORTE|SUDOESTE|SUL|NORDESTE|SUDESTE/i.test(first)) {
        return {
          norte: cellStr(row[12]) || MADRID_CONFRONTACAO_LABELS.norte,
          sul: cellStr(row[13]) || MADRID_CONFRONTACAO_LABELS.sul,
          leste: cellStr(row[14]) || MADRID_CONFRONTACAO_LABELS.leste,
          oeste: cellStr(row[15]) || MADRID_CONFRONTACAO_LABELS.oeste
        };
      }
    }
    return { ...MADRID_CONFRONTACAO_LABELS };
  }
  for (let r = headerRow + 1; r <= headerRow + 3; r++) {
    const row = matrix[r] ?? [];
    const first = cellStr(row[8]).toUpperCase();
    if (/^(NORTE|NOROESTE|SUL|SUDOESTE|LESTE|OESTE)/i.test(first)) {
      return {
        norte: cellStr(row[8]) || DEFAULT_CONFRONTACAO_LABELS.norte,
        sul: cellStr(row[9]) || DEFAULT_CONFRONTACAO_LABELS.sul,
        leste: cellStr(row[10]) || DEFAULT_CONFRONTACAO_LABELS.leste,
        oeste: cellStr(row[11]) || DEFAULT_CONFRONTACAO_LABELS.oeste
      };
    }
  }
  return { ...DEFAULT_CONFRONTACAO_LABELS };
}
function parseLinhaResumoFromRow(row, meta, madridLayout) {
  const linha = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {},
    confrontacaoNorte: "",
    confrontacaoSul: "",
    confrontacaoLeste: "",
    confrontacaoOeste: "",
    areaPrivativaPrincipal: null,
    areaPrivativaAcessoria: null,
    areaComum: null,
    areaTotal: null,
    fracaoPredial: null,
    fracaoTerrenoPercentual: null,
    fracaoTerrenoM2: null,
    valorUnidade: null
  };
  if (madridLayout) {
    const fields = [
      { field: "areaPrivativaPrincipal", col: 1 },
      { field: "areaPrivativaAcessoria", col: 7 },
      { field: "areaComum", col: 4 },
      { field: "areaTotal", col: 5 },
      { field: "fracaoPredial", col: 9 },
      { field: "fracaoTerrenoM2", col: 10 },
      { field: "valorUnidade", col: 11 }
    ];
    for (const { field, col } of fields) {
      assignNumericField(linha, field, row[col]);
    }
    linha.confrontacaoNorte = cellStr(row[12]);
    linha.confrontacaoSul = cellStr(row[13]);
    linha.confrontacaoLeste = cellStr(row[14]);
    linha.confrontacaoOeste = cellStr(row[15]);
  } else {
    const fields = [
      { field: "areaPrivativaPrincipal", col: 1 },
      { field: "areaPrivativaAcessoria", col: 2 },
      { field: "areaComum", col: 3 },
      { field: "areaTotal", col: 4 },
      { field: "fracaoTerrenoPercentual", col: 5 },
      { field: "fracaoTerrenoM2", col: 6 },
      { field: "valorUnidade", col: 7 }
    ];
    for (const { field, col } of fields) {
      assignNumericField(linha, field, row[col]);
    }
    linha.confrontacaoNorte = cellStr(row[8]);
    linha.confrontacaoSul = cellStr(row[9]);
    linha.confrontacaoLeste = cellStr(row[10]);
    linha.confrontacaoOeste = cellStr(row[11]);
  }
  finalizeFormatDecimals(linha);
  return linha;
}
function parseQivaLinhaFromRow(row, meta) {
  const linha = {
    designacao: meta.designacao,
    bloco: meta.bloco,
    formatDecimals: {},
    areaEquivalente: null,
    custo: null,
    coeficienteProporcionalidade: null,
    quantidadeIdenticas: null
  };
  const fields = [
    { field: "areaEquivalente", col: 1 },
    { field: "custo", col: 2 },
    { field: "coeficienteProporcionalidade", col: 3 },
    { field: "quantidadeIdenticas", col: 11 }
  ];
  for (const { field, col } of fields) {
    assignNumericField(linha, field, row[col]);
  }
  finalizeFormatDecimals(linha);
  return linha;
}
const ACABAMENTO_DATA_COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
function rowHasAcabamentoData(row) {
  return ACABAMENTO_DATA_COLS.some((col) => cellStr(row[col]).length > 0);
}
function isAcabamentoSecaoRow(row, dependencia) {
  if (!dependencia.trim()) return false;
  return !rowHasAcabamentoData(row);
}
function parseLinhaAcabamentoFromRow(row) {
  const dependencia = cellStr(row[0]);
  if (!dependencia || dependencia.toUpperCase() === "DEPENDÊNCIAS") return null;
  const isSecao = isAcabamentoSecaoRow(row, dependencia);
  return {
    dependencia,
    isSecao,
    pisoRevestimento: isSecao ? "" : cellStr(row[2]),
    pisoAcabamento: isSecao ? "" : cellStr(row[3]),
    pisoSoleira: isSecao ? "" : cellStr(row[4]),
    paredeRevestimento: isSecao ? "" : cellStr(row[5]),
    paredeAcabamento: isSecao ? "" : cellStr(row[6]),
    paredeRodape: isSecao ? "" : cellStr(row[7]),
    tetoRevestimento: isSecao ? "" : cellStr(row[8]),
    tetoAcabamento: isSecao ? "" : cellStr(row[9]),
    peitoril: isSecao ? "" : cellStr(row[10])
  };
}
const QUADRO_III_SECOES_ORDEM = [
  "Classificação e projeto-padrão",
  "CUB — Custo Unitário Básico",
  "Áreas globais (item 4)",
  "Custo básico global (item 5)",
  "Parcelas adicionais (item 6)",
  "Subtotais, impostos e projetos (itens 7–10)",
  "Remunerações e custo global (itens 11–14)"
];
const QUADRO_III_FIELD_DEFS = [
  // Classificação / projeto-padrão
  {
    chave: "classificacao_geral",
    rotulo: "Classificação geral",
    grupo: "Classificação e projeto-padrão",
    labelBusca: "classificação geral"
  },
  {
    chave: "designacao_padrao",
    rotulo: "Designação do projeto-padrão",
    grupo: "Classificação e projeto-padrão"
  },
  {
    chave: "padrao_acabamento",
    rotulo: "Padrão de acabamento",
    grupo: "Classificação e projeto-padrão"
  },
  {
    chave: "numero_pavimentos",
    rotulo: "Número de pavimentos",
    grupo: "Classificação e projeto-padrão"
  },
  {
    chave: "area_equivalente_padrao",
    rotulo: "Área equivalente do projeto-padrão",
    grupo: "Classificação e projeto-padrão"
  },
  // CUB
  {
    chave: "sindicato_cub",
    rotulo: "Sindicato que forneceu o CUB",
    grupo: "CUB — Custo Unitário Básico",
    labelBusca: "sindicato que forneceu"
  },
  {
    chave: "cub_mes",
    rotulo: "CUB — mês de referência",
    grupo: "CUB — Custo Unitário Básico",
    labelBusca: "custo unitário básico para o mês"
  },
  {
    chave: "cub_valor",
    rotulo: "CUB — valor (R$/m²)",
    grupo: "CUB — Custo Unitário Básico"
  },
  // Item 4 — áreas
  {
    chave: "area_real_privativa_global",
    rotulo: "4.1 — Área real privativa global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.1"
  },
  {
    chave: "area_real_uso_comum_global",
    rotulo: "4.2 — Área real de uso comum global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.2",
    labelBusca: "área real de uso comum"
  },
  {
    chave: "area_real_global",
    rotulo: "4.3 — Área real global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.3"
  },
  {
    chave: "area_equiv_privativa_global",
    rotulo: "4.4 — Área equivalente privativa global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.4"
  },
  {
    chave: "area_equiv_uso_comum_global",
    rotulo: "4.5 — Área equivalente de uso comum global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.5",
    labelBusca: "área equivalente de uso comum"
  },
  {
    chave: "area_equiv_global",
    rotulo: "4.6 — Área equivalente global",
    grupo: "Áreas globais (item 4)",
    itemNumber: "4.6"
  },
  // Item 5 — custo básico
  {
    chave: "custo_basico_global",
    rotulo: "5 — Custo básico global da edificação",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5",
    labelBusca: "custo básico global da edificação"
  },
  {
    chave: "custo_materiais_5_1_1",
    rotulo: "5.1.1 — Custo básico de materiais e outros",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5.1.1"
  },
  {
    chave: "custo_mao_obra_5_1_2",
    rotulo: "5.1.2 — Custo básico de mão-de-obra",
    grupo: "Custo básico global (item 5)",
    itemNumber: "5.1.2"
  },
  // Item 6 — parcelas adicionais
  {
    chave: "parcela_fundacoes_6_1",
    rotulo: "6.1 — Fundações",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.1"
  },
  {
    chave: "parcela_elevadores_6_2",
    rotulo: "6.2 — Elevador(es)",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.2"
  },
  {
    chave: "parcela_fogoes_6_3_1",
    rotulo: "6.3.1 — Fogões",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.1"
  },
  {
    chave: "parcela_aquecedores_6_3_2",
    rotulo: "6.3.2 — Aquecedores",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.2"
  },
  {
    chave: "parcela_bombas_6_3_3",
    rotulo: "6.3.3 — Bombas de recalque",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.3"
  },
  {
    chave: "parcela_incineracao_6_3_4",
    rotulo: "6.3.4 — Incineração",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.4"
  },
  {
    chave: "parcela_ar_condicionado_6_3_5",
    rotulo: "6.3.5 — Ar condicionado",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.5"
  },
  {
    chave: "parcela_calefacao_6_3_6",
    rotulo: "6.3.6 — Calefação",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.6"
  },
  {
    chave: "parcela_ventilacao_6_3_7",
    rotulo: "6.3.7 — Ventilação e exaustão",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.7"
  },
  {
    chave: "parcela_equip_outros_6_3_8",
    rotulo: "6.3.8 — Equipamentos — outros",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.3.8"
  },
  {
    chave: "parcela_playground_6_4",
    rotulo: "6.4 — Playground",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.4"
  },
  {
    chave: "parcela_urbanizacao_6_5_1",
    rotulo: "6.5.1 — Urbanização",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.1"
  },
  {
    chave: "parcela_recreacao_6_5_2",
    rotulo: "6.5.2 — Recreação (piscinas, campos)",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.2"
  },
  {
    chave: "parcela_ajardinamento_6_5_3",
    rotulo: "6.5.3 — Ajardinamento",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.3"
  },
  {
    chave: "parcela_instalacao_cond_6_5_4",
    rotulo: "6.5.4 — Instalação e regulamentação do condomínio",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.4"
  },
  {
    chave: "parcela_obras_outros_6_5_5",
    rotulo: "6.5.5 — Obras complementares — outros",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.5.5"
  },
  {
    chave: "parcela_outros_servicos_6_6",
    rotulo: "6.6 — Outros serviços",
    grupo: "Parcelas adicionais (item 6)",
    itemNumber: "6.6"
  },
  // Itens 7–10
  {
    chave: "subtotal_1_7",
    rotulo: "7 — 1º subtotal",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "7"
  },
  {
    chave: "impostos_taxas_8",
    rotulo: "8 — Impostos, taxas e emolumentos cartoriais",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "8"
  },
  {
    chave: "projeto_arquitetonico_9_1",
    rotulo: "9.1 — Projetos arquitetônicos",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.1"
  },
  {
    chave: "projeto_estrutural_9_2",
    rotulo: "9.2 — Projeto estrutural",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.2"
  },
  {
    chave: "projeto_instalacoes_9_3",
    rotulo: "9.3 — Projeto de instalações",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.3"
  },
  {
    chave: "projetos_especiais_9_4",
    rotulo: "9.4 — Projetos especiais",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "9.4"
  },
  {
    chave: "subtotal_2_10",
    rotulo: "10 — 2º subtotal",
    grupo: "Subtotais, impostos e projetos (itens 7–10)",
    itemNumber: "10"
  },
  // Itens 11–14
  {
    chave: "remuneracao_construtor_11",
    rotulo: "11 — Remuneração do construtor",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "11"
  },
  {
    chave: "remuneracao_incorporador_12",
    rotulo: "12 — Remuneração do incorporador",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "12"
  },
  {
    chave: "custo_global_construcao_13",
    rotulo: "13 — Custo global da construção",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "13"
  },
  {
    chave: "custo_unitario_obra_14",
    rotulo: "14 — Custo unitário da obra (R$/m²)",
    grupo: "Remunerações e custo global (itens 11–14)",
    itemNumber: "14"
  }
];
function campoTemValor(valor) {
  const text = valor.trim();
  if (!text) return false;
  if (cellNum(text) === 0) return false;
  return true;
}
function resolveFieldValue(matrix, def) {
  if (def.itemNumber) {
    const byNumber = findRowValueByItemNumber(matrix, def.itemNumber);
    if (byNumber) return byNumber;
    const byLabelItem = findLabelValue(matrix, def.itemNumber);
    if (byLabelItem) return byLabelItem;
  }
  if (def.labelBusca) {
    const byText = findLabelValue(matrix, def.labelBusca);
    if (byText) return byText;
  }
  return null;
}
function pushCampo$1(campos, sheetName, def, hit) {
  if (!campoTemValor(hit.valor)) return;
  campos.push({
    chave: def.chave,
    rotulo: def.rotulo,
    valor: normalizeNumericDisplayPtBr(hit.valor),
    grupo: def.grupo,
    fonte: { sheet: sheetName, row: hit.row, col: hit.col }
  });
}
function parseProjetoPadraoCampos(matrix, sheetName) {
  const campos = [];
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (!/classificação\s+geral/i.test(cellStr(row[c]))) continue;
      const hit = findSameRowValue(row, c, 5);
      if (hit) {
        pushCampo$1(
          campos,
          sheetName,
          {
            chave: "classificacao_geral",
            rotulo: "Classificação geral",
            grupo: "Classificação e projeto-padrão"
          },
          { valor: hit.valor, row: r, col: hit.col }
        );
      }
      break;
    }
    const pavCell = cellStr(row[3]);
    if (!/^\d+\s*pavimentos?/i.test(pavCell)) continue;
    const projetoDefs = [
      { chave: "designacao_padrao", rotulo: "Designação do projeto-padrão", col: 1 },
      { chave: "padrao_acabamento", rotulo: "Padrão de acabamento", col: 2 },
      { chave: "numero_pavimentos", rotulo: "Número de pavimentos", col: 3 },
      { chave: "area_equivalente_padrao", rotulo: "Área equivalente do projeto-padrão", col: 4 }
    ];
    for (const pd of projetoDefs) {
      const valor = cellStr(row[pd.col]);
      if (!campoTemValor(valor)) continue;
      pushCampo$1(campos, sheetName, {
        chave: pd.chave,
        rotulo: pd.rotulo,
        grupo: "Classificação e projeto-padrão"
      }, { valor, row: r, col: pd.col });
    }
  }
  return campos;
}
function parseDependenciasPrivativas(matrix, sheetName) {
  const campos = [];
  let inSection = false;
  let configIdx = 0;
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const rowText = row.map((cell) => cellStr(cell)).join(" ");
    if (/dependências de uso privativo/i.test(rowText)) {
      inSection = true;
      continue;
    }
    if (inSection && /sindicato que forneceu|custo unitário básico/i.test(rowText)) break;
    if (!inSection) continue;
    const quartos = cellStr(row[5]);
    const salas = cellStr(row[6]);
    const banheiros = cellStr(row[7]);
    const empregados = cellStr(row[9]);
    if (!quartos || !salas || !banheiros) continue;
    if (/^quartos$/i.test(quartos)) continue;
    const quartosNum = cellNum(quartos);
    if (quartosNum === null && !/não há/i.test(quartos)) continue;
    configIdx += 1;
    campos.push({
      chave: `dependencia_config_${configIdx}`,
      rotulo: `Dependências privativas — configuração ${configIdx}`,
      valor: [quartos, salas, banheiros, empregados || "—"].join(" | "),
      grupo: "Classificação e projeto-padrão",
      fonte: { sheet: sheetName, row: r, col: 5 }
    });
  }
  return campos;
}
const PROJETO_PADRAO_CHAVES = /* @__PURE__ */ new Set([
  "classificacao_geral",
  "designacao_padrao",
  "padrao_acabamento",
  "numero_pavimentos",
  "area_equivalente_padrao"
]);
function parseCubValorCampo(matrix, sheetName) {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const rowText = row.map((cell) => cellStr(cell)).join(" ");
    if (!/custo unitário básico/i.test(rowText)) continue;
    for (let k = row.length - 1; k >= 0; k--) {
      const valor = cellStr(row[k]);
      if (!valor || isPercentOnlyCell(valor)) continue;
      if (isCurrencyUnitLabel(valor)) continue;
      if (cellNum(valor) === null) continue;
      return {
        chave: "cub_valor",
        rotulo: "CUB — valor (R$/m²)",
        valor: normalizeNumericDisplayPtBr(valor),
        grupo: "CUB — Custo Unitário Básico",
        fonte: { sheet: sheetName, row: r, col: k }
      };
    }
  }
  return null;
}
function isPercentOnlyCell(value) {
  const cleaned = value.replace(/\s/g, "");
  return /^\d+([.,]\d+)?%$/.test(cleaned);
}
function parseQuadroIIICampos(matrix, sheetName = "QUADRO III") {
  const campos = [
    ...parseProjetoPadraoCampos(matrix, sheetName),
    ...parseDependenciasPrivativas(matrix, sheetName)
  ];
  const cubValor = parseCubValorCampo(matrix, sheetName);
  if (cubValor) campos.push(cubValor);
  for (const def of QUADRO_III_FIELD_DEFS) {
    if (PROJETO_PADRAO_CHAVES.has(def.chave)) continue;
    if (def.chave === "cub_valor") continue;
    const hit = resolveFieldValue(matrix, def);
    if (!hit) continue;
    pushCampo$1(campos, sheetName, def, hit);
  }
  return campos;
}
const QUADRO_V_SECOES_ORDEM = [
  "Informações gerais (itens a–c)",
  "Explicitação da numeração (item d)",
  "Pavimentos especiais (item e)",
  "Outras informações (itens f–g)"
];
const GRUPO_GERAL = "Informações gerais (itens a–c)";
const GRUPO_EXPLICITACAO = "Explicitação da numeração (item d)";
const GRUPO_PAVIMENTOS = "Pavimentos especiais (item e)";
const GRUPO_OUTRAS = "Outras informações (itens f–g)";
function readQuadroVValue(row, labelCol = 0) {
  const preferred = findSameRowValue(row, labelCol, 4);
  if (preferred?.valor) return preferred.valor;
  for (const col of [4, 2, 3, 5, 1]) {
    const val = cellStr(row[col]);
    if (!val || val.endsWith(":")) continue;
    if (/^(nome|empreendimento|logradouro):/i.test(val)) continue;
    return val;
  }
  return null;
}
function pushCampo(campos, sheetName, def, valor, row, col) {
  const text = valor.trim();
  if (!text) return;
  campos.push({
    chave: def.chave,
    rotulo: def.rotulo,
    valor: text,
    grupo: def.grupo,
    fonte: { sheet: sheetName, row, col }
  });
}
function parseItensABC(matrix, sheetName) {
  const campos = [];
  const items = [
    { chave: "tipo_edificacao", rotulo: "a) Tipo de edificação", busca: "a) tipo de edificação" },
    { chave: "numero_pavimentos", rotulo: "b) Número de pavimentos", busca: "b) numero de pavimentos" },
    {
      chave: "unidades_por_pavimento",
      rotulo: "c) Unidades autônomas por pavimento",
      busca: "c) número de unidades"
    }
  ];
  for (const item of items) {
    const hit = findLabelValue(matrix, item.busca);
    pushCampo(
      campos,
      sheetName,
      { chave: item.chave, rotulo: item.rotulo, grupo: GRUPO_GERAL },
      hit?.valor ?? "",
      hit?.row ?? 0,
      hit?.col ?? 4
    );
  }
  return campos;
}
function parseExplicitacoes(matrix, sheetName) {
  const startRow = findRowIndex(matrix, (row) => /d\)\s*explicitação/i.test(cellStr(row[0])));
  if (startRow < 0) return [];
  const campos = [];
  let idx = 0;
  const collectRow = (row, r) => {
    const valor = readQuadroVValue(row, 0);
    if (!valor) return;
    idx += 1;
    campos.push({
      chave: `explicitacao_${idx}`,
      rotulo: idx === 1 ? "d) Explicitação da numeração das unidades autônomas" : `d) Explicitação (${idx})`,
      valor,
      grupo: GRUPO_EXPLICITACAO,
      fonte: { sheet: sheetName, row: r, col: 4 }
    });
  };
  collectRow(matrix[startRow] ?? [], startRow);
  for (let r = startRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const col0 = cellStr(row[0]);
    if (/^e\)\s/i.test(col0) || /pavimentos especiais/i.test(col0)) break;
    if (/^[f-g]\)\s/i.test(col0)) break;
    if (col0 && /^[a-g]\)\s/i.test(col0)) break;
    collectRow(row, r);
  }
  return campos;
}
const PAVIMENTOS_ESPECIAIS = [
  { chave: "e_pilotis", rotulo: "Pilotis", pattern: /pilotis/i },
  { chave: "e_transicao", rotulo: "Pavimentos de transição", pattern: /transição/i },
  { chave: "e_garagens", rotulo: "Garagens", pattern: /garagens/i },
  { chave: "e_comunitarios", rotulo: "Pavimentos comunitários", pattern: /comunitários/i },
  { chave: "e_outros", rotulo: "Outros pavimentos", pattern: /outros pavimentos/i }
];
function parsePavimentosEspeciais(matrix, sheetName) {
  const campos = [];
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const col0 = cellStr(row[0]);
    if (!col0) continue;
    for (const def of PAVIMENTOS_ESPECIAIS) {
      if (!def.pattern.test(col0)) continue;
      const hit = findSameRowValue(row, 0, 4);
      pushCampo(
        campos,
        sheetName,
        { chave: def.chave, rotulo: `e) ${def.rotulo}`, grupo: GRUPO_PAVIMENTOS },
        hit?.valor ?? "",
        r,
        hit?.col ?? 4
      );
      break;
    }
  }
  return campos;
}
function parseItensFG(matrix, sheetName) {
  const campos = [];
  const fHit = findLabelValue(matrix, "f) data da aprovação");
  pushCampo(
    campos,
    sheetName,
    {
      chave: "data_aprovacao",
      rotulo: "f) Data da aprovação do projeto e repartição competente",
      grupo: GRUPO_OUTRAS
    },
    fHit?.valor ?? "",
    fHit?.row ?? 0,
    fHit?.col ?? 4
  );
  const gHit = findLabelValue(matrix, "g) outras indicações");
  pushCampo(
    campos,
    sheetName,
    { chave: "outras_indicacoes", rotulo: "g) Outras indicações", grupo: GRUPO_OUTRAS },
    gHit?.valor ?? "",
    gHit?.row ?? 0,
    gHit?.col ?? 4
  );
  return campos;
}
function parseQuadroVCampos(matrix, sheetName = "QUADRO V") {
  return [
    ...parseItensABC(matrix, sheetName),
    ...parseExplicitacoes(matrix, sheetName),
    ...parsePavimentosEspeciais(matrix, sheetName),
    ...parseItensFG(matrix, sheetName)
  ];
}
function detectQivbVariante(sheetName, matrix) {
  const sheet = sheetName.trim();
  if (/QUADRO\s+IV\s*B[\s._-]?[1I]\b/i.test(sheet)) return "b1";
  if (/QUADRO\s+IV\s*B1\b/i.test(sheet)) return "b1";
  const header = matrix.slice(0, 35).flat().map((cell) => cellStr(cell)).join(" ");
  if (/QUADRO\s+IV\s*B[\s._-]?[1I]\b|colunas A a J|terreno de uso exclusivo|área de terreno de uso exclusivo/i.test(
    header
  )) {
    return "b1";
  }
  return "padrao";
}
const PRELIMINARES_LABELS = [
  { chave: "incorporador_nome", rotulo: "1.1 Nome", busca: "1.1" },
  { chave: "incorporador_cnpj", rotulo: "1.3 CNPJ", busca: "cnpj:" },
  { chave: "incorporador_endereco", rotulo: "1.4 Endereço", busca: "1.4" },
  { chave: "rt_nome", rotulo: "2.1 Responsável Técnico", busca: "2.1" },
  { chave: "rt_crea", rotulo: "2.2 CREA", busca: "2.2" },
  { chave: "rt_art", rotulo: "2.3 ART", busca: "2.3" },
  { chave: "rt_endereco", rotulo: "2.4 Endereço RT", busca: "2.4" },
  { chave: "projeto_nome", rotulo: "3.1 Nome do Edifício", busca: "3.1" },
  { chave: "projeto_logradouro", rotulo: "3.2.1 Logradouro", busca: "3.2.1" },
  { chave: "projeto_lote_quadra", rotulo: "3.2.2 Lote/Quadra", busca: "3.2.2" },
  { chave: "projeto_cep", rotulo: "3.2.3 CEP", busca: "3.2.3" },
  { chave: "projeto_cidade_uf", rotulo: "3.3 Cidade/UF", busca: "3.3" },
  { chave: "projeto_padrao_nbr", rotulo: "3.4 Projeto-padrão NBR", busca: "3.4" },
  { chave: "projeto_qtd_unidades", rotulo: "3.5 Qtd. unidades", busca: "3.5" },
  { chave: "projeto_acabamento", rotulo: "3.6 Padrão acabamento", busca: "3.6" },
  { chave: "projeto_pavimentos", rotulo: "3.7 Pavimentos", busca: "3.7" },
  { chave: "projeto_vagas_ua", rotulo: "3.8.1 Vagas UA", busca: "3.8.1" },
  { chave: "projeto_vagas_38_2", rotulo: "3.8.2 Vagas", busca: "3.8.2" },
  { chave: "projeto_vagas_38_3", rotulo: "3.8.3 Vagas", busca: "3.8.3" },
  { chave: "projeto_vagas_38_4", rotulo: "3.8.4 Vagas", busca: "3.8.4" },
  { chave: "projeto_area_terreno", rotulo: "3.9 Área terreno", busca: "3.9" },
  { chave: "projeto_data_aprovacao", rotulo: "3.10 Data aprovação", busca: "3.10" },
  { chave: "projeto_alvara", rotulo: "3.11 Alvará", busca: "3.11" }
];
function parsePreliminares(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const campos = [];
  for (const def of PRELIMINARES_LABELS) {
    const hit = def.chave === "rt_crea" ? findPreliminarCreaValue(matrix) : def.chave === "projeto_cep" ? findPreliminarCepValue(matrix) : findPreliminarValue(matrix, def.busca);
    campos.push({
      chave: def.chave,
      rotulo: def.rotulo,
      valor: hit?.valor ?? "",
      fonte: hit ? { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col } : void 0
    });
  }
  const socios = findSocioAdministradores(matrix);
  socios.forEach((nome, i) => {
    campos.push({
      chave: `incorporador_socio_${i + 1}`,
      rotulo: `1.2 Sócio Administrador ${i + 1}`,
      valor: nome
    });
  });
  for (const vaga of parseCamposSecao38(matrix)) {
    const idx = campos.findIndex((c) => c.chave === vaga.chave);
    if (idx >= 0) {
      campos[idx] = { ...campos[idx], valor: vaga.valor, fonte: vaga.fonte ?? campos[idx].fonte };
    } else {
      campos.push(vaga);
    }
  }
  return {
    id: "preliminares",
    titulo: "NBR 12.721 — Informações Preliminares",
    folha,
    totalFolhas,
    cabecalho: buildCabecalhoFromPreliminares(campos),
    fontePreview: slicePreview(matrix),
    campos
  };
}
function parseCamposSecao38(matrix) {
  const campos = [];
  const seenSubs = /* @__PURE__ */ new Set();
  for (let sub = 1; sub <= 9; sub++) {
    const token = `3.8.${sub}`;
    const hit = findLabelValue(matrix, token);
    if (!hit) continue;
    const digitsOnly = hit.valor.replace(/[^\d]/g, "");
    if (!digitsOnly || Number(digitsOnly) <= 0) continue;
    const valor = /^\d+$/.test(hit.valor.trim()) ? hit.valor.trim() : digitsOnly;
    seenSubs.add(String(sub));
    campos.push({
      chave: sub === 1 ? "projeto_vagas_ua" : `projeto_vagas_38_${sub}`,
      rotulo: token,
      valor,
      fonte: { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col }
    });
  }
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cellText = cellStr(row[c]);
      const match = cellText.match(/\b3\.8\.(\d+)/i);
      if (!match) continue;
      const sub = match[1];
      if (seenSubs.has(sub)) continue;
      const hit = findLabelValue(matrix, `3.8.${sub}`);
      if (!hit) continue;
      const digitsOnly = hit.valor.replace(/[^\d]/g, "");
      if (!digitsOnly || Number(digitsOnly) <= 0) continue;
      const valor = /^\d+$/.test(hit.valor.trim()) ? hit.valor.trim() : digitsOnly;
      seenSubs.add(sub);
      campos.push({
        chave: sub === "1" ? "projeto_vagas_ua" : `projeto_vagas_38_${sub}`,
        rotulo: cellText.trim() || `3.8.${sub}`,
        valor,
        fonte: { sheet: SHEET_PRELIMINARES, row: hit.row, col: hit.col }
      });
    }
  }
  return campos;
}
function findPreliminarCreaValue(matrix) {
  for (const label of [
    "registro no crea:",
    "registro profissional no crea:",
    "crea/cau:",
    "crea:"
  ]) {
    const hit = findLabelValue(matrix, label);
    if (hit && !isInlineFieldLabel(hit.valor)) return hit;
  }
  const numbered = findLabelValue(matrix, "2.2");
  if (numbered && !isInlineFieldLabel(numbered.valor)) return numbered;
  let anchorRow = numbered?.row;
  let startCol = numbered?.col ?? 0;
  if (anchorRow === void 0) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      for (let c = 0; c < row.length; c++) {
        const text = cellStr(row[c]);
        if (!text.includes("2.2")) continue;
        anchorRow = r;
        startCol = c;
        break;
      }
      if (anchorRow !== void 0) break;
    }
  }
  if (anchorRow === void 0) return null;
  for (let dr = 0; dr <= 2; dr++) {
    const row = matrix[anchorRow + dr] ?? [];
    for (let k = dr === 0 ? startCol + 1 : startCol; k < row.length; k++) {
      const val = cellStr(row[k]);
      if (!val || isInlineFieldLabel(val)) continue;
      if (/^\d+(\.\d+)*$/.test(val.trim())) continue;
      return { valor: val, row: anchorRow + dr, col: k };
    }
  }
  return null;
}
function looksLikeCep(value) {
  return value.replace(/\D/g, "").length === 8;
}
function formatCep(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return value.trim();
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
function scanNearbyPreliminarValue(matrix, anchorRow, startCol, validate) {
  for (let dr = 0; dr <= 2; dr++) {
    const row = matrix[anchorRow + dr] ?? [];
    const colStart = dr === 0 ? startCol + 1 : startCol;
    for (let k = colStart; k < row.length; k++) {
      const val = cellStr(row[k]);
      if (!val || isInlineFieldLabel(val)) continue;
      if (validate && !validate(val)) continue;
      if (!validate && /^\d+(\.\d+)*$/.test(val.trim())) continue;
      return { valor: val, row: anchorRow + dr, col: k };
    }
  }
  return null;
}
function findPreliminarCepValue(matrix) {
  for (const label of ["cep:", "c.e.p:"]) {
    const hit = findLabelValue(matrix, label);
    if (hit && !isInlineFieldLabel(hit.valor) && looksLikeCep(hit.valor)) {
      return { ...hit, valor: formatCep(hit.valor) };
    }
  }
  const numbered = findLabelValue(matrix, "3.2.3");
  if (numbered && !isInlineFieldLabel(numbered.valor) && looksLikeCep(numbered.valor)) {
    return { ...numbered, valor: formatCep(numbered.valor) };
  }
  let anchorRow = numbered?.row;
  let startCol = numbered?.col ?? 0;
  if (anchorRow === void 0) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      for (let c = 0; c < row.length; c++) {
        const text = cellStr(row[c]);
        if (!text.includes("3.2.3")) continue;
        anchorRow = r;
        startCol = c;
        break;
      }
      if (anchorRow !== void 0) break;
    }
  }
  if (anchorRow === void 0) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      for (let c = 0; c < row.length; c++) {
        if (!/^cep\s*:?\s*$/i.test(cellStr(row[c]))) continue;
        anchorRow = r;
        startCol = c;
        break;
      }
      if (anchorRow !== void 0) break;
    }
  }
  if (anchorRow === void 0) return null;
  const nearby = scanNearbyPreliminarValue(matrix, anchorRow, startCol, looksLikeCep);
  if (!nearby) return null;
  return { ...nearby, valor: formatCep(nearby.valor) };
}
function findPreliminarValue(matrix, token) {
  const trimmedToken = token.trim();
  if (/^\d+(\.\d+)+$/.test(trimmedToken)) {
    const numbered = findLabelValue(matrix, trimmedToken);
    if (numbered) {
      if (!isInlineFieldLabel(numbered.valor)) return numbered;
      const nearby = scanNearbyPreliminarValue(matrix, numbered.row, numbered.col);
      if (nearby) return { ...nearby, valor: normalizeNumericDisplayPtBr(nearby.valor) };
    }
  }
  const needle = trimmedToken.toLowerCase();
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const text = cellStr(row[c]).toLowerCase();
      if (!text.includes(needle)) continue;
      for (let k = c + 1; k < row.length; k++) {
        const val = cellStr(row[k]);
        if (!val || isInlineFieldLabel(val)) continue;
        if (val.toLowerCase().includes(needle.replace(":", ""))) continue;
        return { valor: normalizeNumericDisplayPtBr(val), row: r, col: k };
      }
      const nearby = scanNearbyPreliminarValue(matrix, r, c);
      if (nearby) return { ...nearby, valor: normalizeNumericDisplayPtBr(nearby.valor) };
    }
  }
  return null;
}
function findSocioAdministradores(matrix) {
  const socios = [];
  for (const row of matrix) {
    for (let c = 0; c < (row?.length ?? 0); c++) {
      const text = cellStr(row[c]).toLowerCase();
      if (!text.includes("sócio administrador") && !text.includes("administrador:")) continue;
      for (let k = c + 1; k < (row?.length ?? 0); k++) {
        const nome = cellStr(row[k]);
        if (nome && !nome.toLowerCase().includes("sócio")) {
          socios.push(nome);
          break;
        }
      }
    }
  }
  return socios;
}
function buildCabecalhoFromPreliminares(campos) {
  const get = (chave) => campos.find((c) => c.chave === chave)?.valor ?? "";
  const socios = campos.filter((c) => c.chave.startsWith("incorporador_socio_")).map((c) => c.valor).filter(Boolean);
  return {
    empreendimento: get("projeto_nome"),
    logradouro: get("projeto_logradouro"),
    loteQuadra: get("projeto_lote_quadra"),
    municipioUf: get("projeto_cidade_uf"),
    incorporadorNome: get("incorporador_nome"),
    incorporadorSocios: socios,
    responsavelNome: get("rt_nome"),
    responsavelCrea: get("rt_crea")
  };
}
function parseQuadroI(matrix, sheetName) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toLowerCase() === "pavimento");
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "1" && cellStr(row[1]) === "2");
  const linhas = [];
  let observacoes = "";
  if (headerRow >= 0 && colNumsRow >= 0) {
    for (let r = colNumsRow + 1; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const pavimento = cellStr(row[0]);
      if (!pavimento || isDataEndRow(pavimento)) {
        if (pavimento.toUpperCase().startsWith("OBSERVA")) {
          observacoes = cellStr(row[1]) || cellStr(row[4]) || "";
        }
        if (isDataEndRow(pavimento)) break;
        continue;
      }
      linhas.push(parseLinhaPavimentoFromRow(row, { pavimento }));
    }
  }
  const totaisRow = matrix.find((row) => cellStr(row[0]).toUpperCase() === "TOTAIS");
  const areaRealGlobal = findLabelValue(matrix, "área real global")?.valor !== void 0 ? cellNum(findLabelValue(matrix, "área real global")?.valor) : cellNum(totaisRow?.[16]);
  const areaEquivalenteGlobal = findLabelValue(matrix, "área equivalente global")?.valor !== void 0 ? cellNum(findLabelValue(matrix, "área equivalente global")?.valor) : cellNum(totaisRow?.[17]);
  return {
    id: "qi",
    titulo: "Quadro I — Cálculo das Áreas nos Pavimentos",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    totais: { areaRealGlobal, areaEquivalenteGlobal },
    observacoes
  };
}
function parseUnidadesComBloco(matrix, colNumsRow, mapRow2) {
  const linhas = [];
  let blocoAtual = "";
  for (let r = colNumsRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const designacao = cellStr(row[0]);
    if (!designacao) continue;
    if (isDataEndRow(designacao)) break;
    if (isTorreOuBlocoRow(designacao)) {
      blocoAtual = designacao;
      continue;
    }
    if (!isUnidadeDesignacaoValida(designacao)) continue;
    const parsed = mapRow2(row, blocoAtual);
    if (parsed) linhas.push(parsed);
  }
  return linhas;
}
function parsePavimentosComTorre(matrix, colNumsRow, sheetName) {
  const linhas = [];
  let torreAtual = "";
  for (let r = colNumsRow + 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const first = cellStr(row[0]);
    if (!first) continue;
    if (isDataEndRow(first)) break;
    if (isTorreOuBlocoRow(first)) {
      torreAtual = first;
      continue;
    }
    const isPavimento = /pavimento|térreo|terreo|subsolo|cobertura/i.test(first);
    if (!isPavimento && cellNum(row[1]) === null && cellNum(row[16]) === null) continue;
    linhas.push(
      parseLinhaPavimentoFromRow(row, { pavimento: first, torre: torreAtual || void 0 })
    );
  }
  return linhas;
}
function parseQuadroComplementar(matrix, sheetName) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "1" && cellStr(row[1]) === "2");
  const linhas = colNumsRow >= 0 ? parsePavimentosComTorre(matrix, colNumsRow) : [];
  const totaisRow = matrix.find((row) => cellStr(row[0]).toUpperCase() === "TOTAIS");
  return {
    id: "qcomp",
    titulo: "Quadro Complementar — Áreas nos Pavimentos por Torre",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    totais: {
      areaRealGlobal: cellNum(totaisRow?.[16]) ?? findLabelValue(matrix, "área real global")?.valor ? cellNum(findLabelValue(matrix, "área real global")?.valor) : null,
      areaEquivalenteGlobal: cellNum(totaisRow?.[17]) ?? (findLabelValue(matrix, "área equivalente global")?.valor ? cellNum(findLabelValue(matrix, "área equivalente global")?.valor) : null)
    },
    observacoes: ""
  };
}
function parseQuadroII(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "19");
  const linhas = colNumsRow >= 0 ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco) => {
    const designacao = cellStr(row[0]);
    if (!designacao) return null;
    return parseLinhaUnidadeAreaFromRow(row, { designacao, bloco });
  }) : [];
  return {
    id: "qii",
    titulo: "Quadro II — Cálculo das Áreas das Unidades Autônomas",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas
  };
}
function parseQuadroIII(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const campos = parseQuadroIIICampos(matrix);
  return {
    id: "qiii",
    titulo: "Quadro III — Avaliação do Custo Global",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    campos
  };
}
function parseQuadroIVA(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "39");
  const linhas = colNumsRow >= 0 ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco) => {
    const designacao = cellStr(row[0]);
    if (!designacao) return null;
    return parseQivaLinhaFromRow(row, { designacao, bloco });
  }) : [];
  return {
    id: "qiva",
    titulo: "Quadro IV A — Custo por Unidade",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas
  };
}
function parseQuadroIVB(matrix, sheetName = "") {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const colNumsRow = findRowIndex(matrix, (row) => cellStr(row[0]) === "A");
  const variante = detectQivbVariante(sheetName, matrix);
  const columnMap = variante === "b1" ? buildQivb1ColumnMap(matrix, colNumsRow >= 0 ? colNumsRow : void 0) : buildQivbColumnMap(matrix, colNumsRow >= 0 ? colNumsRow : void 0);
  const linhas = colNumsRow >= 0 ? parseUnidadesComBloco(matrix, colNumsRow, (row, bloco) => {
    const designacao = cellStr(row[0]);
    if (!designacao) return null;
    return parseLinhaUnidadeRealFromRow(row, { designacao, bloco }, columnMap);
  }) : [];
  return {
    id: "qivb",
    variante,
    nomeAba: sheetName || void 0,
    titulo: variante === "b1" ? "Quadro IV B.1 — Áreas Reais para Registro (terreno exclusivo)" : "Quadro IV B — Áreas Reais para Registro",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas
  };
}
function parseQuadroV(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  return {
    id: "qv",
    titulo: "Quadro V — Informações Gerais",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix, 32),
    campos: parseQuadroVCampos(matrix),
    textosDescritivos: []
  };
}
function parseQuadroVI(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "EQUIPAMENTOS");
  const linhas = [];
  if (headerRow >= 0) {
    for (let r = headerRow + 1; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const equipamento = cellStr(row[0]);
      if (!equipamento) continue;
      linhas.push({
        equipamento,
        tipoMarca: cellStr(row[2]),
        acabamento: cellStr(row[4])
      });
    }
  }
  return {
    id: "qvi",
    titulo: "Quadro VI — Memorial de Equipamentos",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas
  };
}
function parseAcabamentos(matrix, id, titulo) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "DEPENDÊNCIAS");
  const linhas = [];
  if (headerRow >= 0) {
    for (let r = headerRow + 2; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const parsed = parseLinhaAcabamentoFromRow(row);
      if (parsed) linhas.push(parsed);
    }
  }
  const base = {
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas
  };
  if (id === "qvii") {
    return { id: "qvii", titulo, ...base };
  }
  return { id: "qviii", titulo, ...base };
}
function findResumoDataStart(matrix, headerRow) {
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const first = cellStr(matrix[r]?.[0]);
    if (!first) continue;
    if (isTorreOuBlocoRow(first) || /apartamento|sala|depósito|garagem|loja/i.test(first)) {
      return r;
    }
  }
  return headerRow + 2;
}
function isResumoFormatoMadrid(matrix) {
  return matrix.some(
    (row) => (row ?? []).some((cell) => /noroeste|nordeste|sudoeste|sudeste/i.test(cellStr(cell)))
  );
}
function parseQuadroResumo(matrix) {
  const { folha, totalFolhas } = extractFolhaInfo(matrix);
  const headerRow = findRowIndex(matrix, (row) => cellStr(row[0]).toUpperCase() === "UNIDADE");
  const linhas = [];
  let blocoAtual = "";
  const formatoMadrid = isResumoFormatoMadrid(matrix);
  if (headerRow >= 0) {
    const startRow = findResumoDataStart(matrix, headerRow);
    for (let r = startRow; r < matrix.length; r++) {
      const row = matrix[r] ?? [];
      const designacao = cellStr(row[0]);
      if (!designacao) continue;
      if (isDataEndRow(designacao)) break;
      if (designacao.length === 1 && /^[A-Z]$/i.test(designacao)) continue;
      if (isTorreOuBlocoRow(designacao)) {
        blocoAtual = designacao;
        continue;
      }
      if (!isUnidadeDesignacaoValida(designacao)) continue;
      linhas.push(
        parseLinhaResumoFromRow(row, { designacao, bloco: blocoAtual }, formatoMadrid)
      );
    }
  }
  const confrontacaoLabels = headerRow >= 0 ? parseResumoConfrontacaoLabels(matrix, headerRow, formatoMadrid) : { norte: "Norte", sul: "Sul", leste: "Leste", oeste: "Oeste" };
  return {
    id: "resumo",
    titulo: "Quadro Resumo — Frações e Confrontações",
    folha,
    totalFolhas,
    cabecalho: parseCabecalhoPadrao(matrix),
    fontePreview: slicePreview(matrix),
    linhas,
    confrontacaoLabels
  };
}
async function parseQuadroNbrFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = readWorkbookFromArrayBuffer(buffer);
  const preliminaresSheet = workbook.SheetNames.find(
    (n) => n.toUpperCase().includes("PRELIMINAR")
  );
  if (!preliminaresSheet) {
    throw new Error("Aba 'Informações Preliminares' não encontrada no arquivo.");
  }
  const preliminaresMatrix = sheetToMatrix(workbook, preliminaresSheet);
  const preliminares = parsePreliminares(preliminaresMatrix);
  const quadros = [preliminares];
  const quadrosPresentes = [];
  const parserById = {
    qi: (matrix, sheet) => parseQuadroI(matrix),
    qii: (matrix) => parseQuadroII(matrix),
    qiii: (matrix) => parseQuadroIII(matrix),
    qiva: (matrix) => parseQuadroIVA(matrix),
    qivb: (matrix, sheet) => parseQuadroIVB(matrix, sheet),
    qv: (matrix) => parseQuadroV(matrix),
    qvi: (matrix) => parseQuadroVI(matrix),
    qvii: (matrix) => parseAcabamentos(matrix, "qvii", "Quadro VII — Acabamentos Privativos"),
    qviii: (matrix) => parseAcabamentos(matrix, "qviii", "Quadro VIII — Acabamentos Comuns"),
    qcomp: (matrix, sheet) => parseQuadroComplementar(matrix),
    resumo: (matrix) => parseQuadroResumo(matrix)
  };
  const quadroOrder = [
    "qi",
    "qii",
    "qiii",
    "qiva",
    "qivb",
    "qv",
    "qvi",
    "qvii",
    "qviii",
    "qcomp",
    "resumo"
  ];
  for (const quadroId of quadroOrder) {
    const sheet = findSheetName(workbook.SheetNames, SHEET_MATCHERS[quadroId]);
    if (!sheet) continue;
    const matrix = sheetToMatrix(workbook, sheet);
    const parsed = parserById[quadroId](matrix, sheet);
    quadros.push(parsed);
    quadrosPresentes.push(quadroId);
  }
  const qivbQuadro = quadros.find((q) => q.id === "qivb");
  const quadroIvVariante = qivbQuadro && "variante" in qivbQuadro && qivbQuadro.variante === "b1" ? "b1" : "padrao";
  return {
    nomeArquivo: file.name,
    quadros,
    preliminares,
    quadrosPresentes,
    quadroIvVariante
  };
}
function getQuadroById(documento, id) {
  return documento.quadros.find((q) => q.id === id);
}
function extractVaga(observacoes) {
  const text = observacoes.trim().replace(/\s+/g, " ");
  if (!text) return "";
  const direitoUsoCompacto = text.match(
    /direito\s+de\s+uso\s+de\s+(\d+)\s+vaga\s+([\w-]+)/i
  );
  if (direitoUsoCompacto) {
    return `${direitoUsoCompacto[1]} Vaga ${direitoUsoCompacto[2]}`;
  }
  const direitoUso = text.match(
    /direito\s+de\s+uso\s+(?:de\s+)?(?:(?:\d+|0?\d+)\s+)?(?:\(\s*\w+\s*\)\s*)?(?:(\d+)\s+)?vaga\s+(.+?)(?:[.;,]|$)/i
  );
  if (direitoUso) {
    const quantidade = direitoUso[1]?.trim();
    const tipo = direitoUso[2]?.trim();
    if (quantidade && tipo) return `${quantidade} Vaga ${tipo}`;
    if (tipo) return tipo;
  }
  const patterns = [
    /vaga\s+aut[oô]noma\s*n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+(?:de\s+)?garagem\s*(?:descoberta\s*)?n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+n[º°.]?\s*([\w./-]+)/i,
    /vaga\s+([\w./-]+)/i,
    /\b(V-\d+)\b/i,
    /\b(G-\d+)\b/i,
    /\b(B-\d+)\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  if (/^(V|G|B)-\d+$/i.test(text)) return text;
  if (/vaga/i.test(text)) {
    const trecho = text.match(/vaga\s+(.+?)(?:[.;,]|$)/i);
    if (trecho?.[1]?.trim()) return trecho[1].trim();
  }
  return "";
}
function normalizeDesignacao(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
function normalizeTorre(torre) {
  const text = torre.trim().replace(/\s+/g, " ").toLowerCase();
  const semPrefixo = text.replace(/^torre\s*/i, "").replace(/^bloco\s*/i, "");
  const numero = semPrefixo.match(/^0*(\d+)$/);
  if (numero) return numero[1];
  return semPrefixo || text;
}
function stripApartamentoPrefix(designacao) {
  return designacao.replace(/^apartamento\s+/i, "").trim();
}
function extractTipoPrefix(designacao) {
  if (/garden/i.test(designacao)) return "garden";
  if (/apartamento/i.test(designacao)) return "apartamento";
  if (/cobertura/i.test(designacao)) return "cobertura";
  return "";
}
function extractDesignacaoNumero(designacao) {
  const trimmed = designacao.trim();
  if (/^vaga\s/i.test(trimmed)) return null;
  const match = trimmed.match(/(\d[\d./-]*)$/);
  return match?.[1] ?? null;
}
function numeroLookupVariants(numero) {
  const bare = numero.replace(/^0+/, "") || "0";
  const padded = bare.padStart(2, "0");
  return [.../* @__PURE__ */ new Set([numero, bare, padded])];
}
function buildUnidadeVagaLookupKeys(designacao, torre) {
  const keys = /* @__PURE__ */ new Set();
  const normalized = normalizeDesignacao(designacao);
  const semApartamento = normalizeDesignacao(stripApartamentoPrefix(designacao));
  keys.add(normalized);
  if (semApartamento !== normalized) keys.add(semApartamento);
  const numero = extractDesignacaoNumero(designacao);
  const tipo = extractTipoPrefix(designacao);
  if (numero) {
    for (const variant of numeroLookupVariants(numero)) {
      keys.add(`num:${variant}`);
      if (tipo) keys.add(`num:${tipo}:${variant}`);
    }
  }
  if (torre) {
    const torreKey = normalizeTorre(torre);
    keys.add(`torre:${torreKey}:${normalized}`);
    if (semApartamento !== normalized) keys.add(`torre:${torreKey}:${semApartamento}`);
    if (numero && tipo) {
      for (const variant of numeroLookupVariants(numero)) {
        keys.add(`torre:${torreKey}:num:${tipo}:${variant}`);
      }
    }
  }
  return [...keys];
}
function registerLookupKeys(lookup, keys, entry) {
  for (const key of keys) {
    lookup.set(key, entry);
  }
}
function buildQivbVagaLookup(documento) {
  const qivb = getQuadroById(documento, "qivb");
  const lookup = /* @__PURE__ */ new Map();
  for (const linha of qivb?.linhas ?? []) {
    const observacoes = linha.observacoes?.trim() ?? "";
    if (!observacoes) continue;
    const vaga = extractVaga(observacoes);
    const entry = { observacoes, vaga };
    registerLookupKeys(
      lookup,
      buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || void 0),
      entry
    );
  }
  return lookup;
}
function lookupVagaInfo(lookup, unidadeNome, torre) {
  const torreNorm = torre && torre !== "—" ? torre : void 0;
  for (const key of buildUnidadeVagaLookupKeys(unidadeNome, torreNorm)) {
    const hit = lookup.get(key);
    if (hit) return hit;
  }
  if (/garden/i.test(unidadeNome)) {
    const numero = extractDesignacaoNumero(unidadeNome);
    if (numero) {
      for (const variant of numeroLookupVariants(numero)) {
        const gardenKey = torreNorm ? `torre:${normalizeTorre(torreNorm)}:num:garden:${variant}` : `num:garden:${variant}`;
        const hit = lookup.get(gardenKey);
        if (hit) return hit;
      }
    }
  }
  return void 0;
}
function buildQivbVagaLookupFromObservacoesCampos(campos) {
  const lookup = /* @__PURE__ */ new Map();
  const prefix = "observacoes__";
  for (const { campo, valor } of campos) {
    if (!campo.startsWith(prefix)) continue;
    const observacoes = valor?.trim() ?? "";
    if (!observacoes) continue;
    const key = campo.slice(prefix.length);
    const entry = {
      observacoes,
      vaga: extractVaga(observacoes)
    };
    lookup.set(key, entry);
  }
  return lookup;
}
function mergeVagaLookups(primary, secondary) {
  const merged = new Map(primary);
  for (const [key, value] of secondary) {
    if (!merged.has(key)) merged.set(key, value);
  }
  return merged;
}
function getCampoValor(documento, chave) {
  return documento.preliminares.campos.find((c) => c.chave === chave)?.valor ?? "";
}
function parseCidadeUf(raw) {
  const parts = raw.split("/").map((s) => s.trim());
  return { cidade: parts[0] ?? "", uf: parts[1] ?? "" };
}
function parseIntFromText(raw) {
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}
function parseVagasFromValor(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (!/\d/.test(trimmed)) return 0;
  const numbers = [...trimmed.matchAll(/\d+/g)].map((m) => Number(m[0])).filter((n) => n > 0);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0);
}
function computeTotalVagas(documento) {
  const fromCampos = sumVagasSecao38(documento.preliminares.campos);
  if (fromCampos > 0) return fromCampos;
  let total = 0;
  for (const chave of [
    "projeto_vagas_ua",
    "projeto_vagas_38_2",
    "projeto_vagas_38_3",
    "projeto_vagas_38_4"
  ]) {
    const raw = getCampoValor(documento, chave).trim();
    if (/^\d+$/.test(raw)) total += Number(raw);
  }
  return total;
}
function sumVagasSecao38(campos) {
  let total = 0;
  const contabilizados = /* @__PURE__ */ new Set();
  for (const item of campos) {
    const chave = (item.chave ?? item.campo ?? "").trim();
    const rotulo = (item.rotulo ?? chave).trim();
    const valor = item.valor ?? "";
    const quantidade = parseVagasFromValor(valor);
    if (quantidade <= 0) continue;
    const isCampoVagas = chave.startsWith("projeto_vagas") || /\b3\.8\.\d+/i.test(rotulo) || /\b3\.8\b/i.test(rotulo) && /\bvaga/i.test(rotulo);
    if (!isCampoVagas) continue;
    const chaveDedupe = chave.startsWith("projeto_vagas") ? chave : rotulo.match(/\b3\.8\.\d+/i)?.[0]?.toLowerCase() ?? rotulo;
    if (contabilizados.has(chaveDedupe)) continue;
    contabilizados.add(chaveDedupe);
    total += quantidade;
  }
  return total;
}
function inferPavimento(designacao) {
  if (/garden/i.test(designacao)) return "Térreo";
  const match = designacao.match(/(\d{3,4})/);
  if (!match) return "—";
  const numero = match[1];
  if (numero.length === 3) {
    const pav = numero[0];
    return pav === "0" ? "Térreo" : `${pav}º Pavimento`;
  }
  return `${numero.slice(0, 2)}º Pavimento`;
}
function inferTipo(designacao) {
  if (/garden/i.test(designacao)) return "Garden";
  if (/sala comercial/i.test(designacao)) return "Comercial";
  if (/depósito/i.test(designacao)) return "Depósito";
  if (/apartamento/i.test(designacao)) return "Apartamento";
  return "Unidade";
}
function resolveVagaQuadro(vagaLookup, nome, observacoesFallback, torre) {
  const fromQuadro = lookupVagaInfo(vagaLookup, nome, torre);
  if (fromQuadro) {
    return {
      vaga: fromQuadro.vaga || extractVaga(fromQuadro.observacoes) || null,
      observacoes: fromQuadro.observacoes || observacoesFallback
    };
  }
  const observacoes = observacoesFallback?.trim() || null;
  return {
    vaga: observacoes ? extractVaga(observacoes) || null : null,
    observacoes
  };
}
function formatConfrontacoes(linha, labels) {
  const dirs = labels ?? {
    norte: "Norte",
    sul: "Sul",
    leste: "Leste",
    oeste: "Oeste"
  };
  const parts = [
    linha.confrontacaoNorte && `${dirs.norte}: ${linha.confrontacaoNorte}`,
    linha.confrontacaoSul && `${dirs.sul}: ${linha.confrontacaoSul}`,
    linha.confrontacaoLeste && `${dirs.leste}: ${linha.confrontacaoLeste}`,
    linha.confrontacaoOeste && `${dirs.oeste}: ${linha.confrontacaoOeste}`
  ].filter(Boolean);
  return parts.join(" | ");
}
function mapDocumentoToWizardInput(documento, organizationId, profileId) {
  const qi = getQuadroById(documento, "qi");
  const qivb = getQuadroById(documento, "qivb");
  const resumo = getQuadroById(documento, "resumo");
  const cidadeUf = parseCidadeUf(getCampoValor(documento, "projeto_cidade_uf"));
  const socios = documento.preliminares.campos.filter((c) => c.chave.startsWith("incorporador_socio_")).map((c) => c.valor).filter(Boolean);
  const blocos = /* @__PURE__ */ new Set();
  for (const linha of qivb?.linhas ?? resumo?.linhas ?? []) {
    if (linha.bloco) blocos.add(linha.bloco);
  }
  const qcomp = getQuadroById(documento, "qcomp");
  for (const linha of qcomp?.linhas ?? []) {
    if (linha.torre) blocos.add(linha.torre);
  }
  const unidadesFonte = resumo?.linhas.length ? resumo.linhas : qivb?.linhas ?? [];
  const totalUnidades = unidadesFonte.length || parseIntFromText(getCampoValor(documento, "projeto_qtd_unidades"));
  const torres = [...blocos].map((nome) => {
    const unidadesBloco = unidadesFonte.filter((u) => u.bloco === nome);
    const pavimentos = new Set(unidadesBloco.map((u) => inferPavimento(u.designacao)));
    return {
      nome,
      pavimentos: pavimentos.size || parseIntFromText(getCampoValor(documento, "projeto_pavimentos")),
      unidadesPorPavimento: Math.ceil(unidadesBloco.length / Math.max(pavimentos.size, 1)),
      totalUnidades: unidadesBloco.length
    };
  });
  if (!torres.length) {
    torres.push({
      nome: "Bloco 01",
      pavimentos: parseIntFromText(getCampoValor(documento, "projeto_pavimentos")) || 1,
      unidadesPorPavimento: totalUnidades || 1,
      totalUnidades: totalUnidades || 1
    });
  }
  const areaTerrenoRaw = getCampoValor(documento, "projeto_area_terreno");
  const areaTerrenoNum = parseBrNumeric(areaTerrenoRaw);
  const areaGlobal = qi?.totais.areaRealGlobal ? fmtArea(qi.totais.areaRealGlobal) : areaTerrenoNum !== null ? "" : "";
  const totaisQi = qi?.linhas.reduce(
    (acc, l) => ({
      privativa: acc.privativa + (l.areaPrivativaTotalReal ?? 0),
      comum: acc.comum + (l.areaUsoComumNaoPropTotalReal ?? 0) + (l.areaUsoComumPropTotalReal ?? 0)
    }),
    { privativa: 0, comum: 0 }
  );
  return {
    organizationId,
    profileId,
    identificacao: {
      nome: getCampoValor(documento, "projeto_nome") || documento.preliminares.cabecalho.empreendimento,
      incorporadora: getCampoValor(documento, "incorporador_nome"),
      cnpj: getCampoValor(documento, "incorporador_cnpj"),
      representante: socios[0] ?? "",
      incorporadoraEndereco: getCampoValor(documento, "incorporador_endereco"),
      socios
    },
    localizacao: (() => {
      const loteQuadraRaw = getCampoValor(documento, "projeto_lote_quadra");
      const { lote, quadra } = parseLoteQuadra(loteQuadraRaw);
      return {
        endereco: getCampoValor(documento, "projeto_logradouro"),
        matricula: "",
        cidade: cidadeUf.cidade,
        uf: cidadeUf.uf,
        lote: lote || loteQuadraRaw,
        quadra,
        bairro: ""
      };
    })(),
    torres,
    unidades: {
      total: totalUnidades,
      tipos: [...new Set(unidadesFonte.map((u) => inferTipo(u.designacao)))],
      vagas: computeTotalVagas(documento)
    },
    areas: {
      terreno: areaTerrenoNum !== null ? fmtArea(areaTerrenoNum) : "",
      construida: areaGlobal,
      privativa: totaisQi ? fmtArea(totaisQi.privativa) : "",
      comum: totaisQi ? fmtArea(totaisQi.comum) : ""
    },
    equipe: {
      responsavel: getCampoValor(documento, "rt_nome"),
      creaCau: getCampoValor(documento, "rt_crea"),
      observacoes: getCampoValor(documento, "rt_art")
    },
    aprovacao: {
      alvara: getCampoValor(documento, "projeto_alvara"),
      dataAprovacao: getCampoValor(documento, "projeto_data_aprovacao")
    }
  };
}
function mapDocumentoToUnidades(documento) {
  const resumo = getQuadroById(documento, "resumo");
  const qivb = getQuadroById(documento, "qivb");
  const vagaLookup = buildQivbVagaLookup(documento);
  if (resumo?.linhas.length) {
    return resumo.linhas.map((linha) => {
      const refQivb = qivb?.linhas.find(
        (u) => normalizeDesignacao(u.designacao) === normalizeDesignacao(linha.designacao)
      );
      const { vaga, observacoes } = resolveVagaQuadro(
        vagaLookup,
        linha.designacao,
        refQivb?.observacoes ?? null,
        linha.bloco || refQivb?.bloco || null
      );
      return {
        nome: linha.designacao,
        torre: linha.bloco || "—",
        pavimento: inferPavimento(linha.designacao),
        tipo: inferTipo(linha.designacao),
        areaPrivativa: linha.areaPrivativaPrincipal,
        areaComum: linha.areaComum,
        areaTotal: linha.areaTotal,
        areaGarden: /garden/i.test(linha.designacao) ? linha.areaPrivativaAcessoria : null,
        vaga,
        fracao: linha.fracaoTerrenoPercentual !== null ? String(linha.fracaoTerrenoPercentual) : linha.fracaoPredial !== null ? String(linha.fracaoPredial) : null,
        confrontacoes: formatConfrontacoes(linha, resumo.confrontacaoLabels) || null,
        observacoes
      };
    });
  }
  return (qivb?.linhas ?? []).filter((linha) => !/^vaga\s/i.test(linha.designacao.trim())).map((linha) => {
    const { vaga, observacoes } = resolveVagaQuadro(
      vagaLookup,
      linha.designacao,
      linha.observacoes || null,
      linha.bloco || null
    );
    return {
      nome: linha.designacao,
      torre: linha.bloco || "—",
      pavimento: inferPavimento(linha.designacao),
      tipo: inferTipo(linha.designacao),
      areaPrivativa: linha.areaPrivativaPrincipal,
      areaComum: linha.areaUsoComum,
      areaTotal: linha.areaRealTotal,
      areaGarden: /garden/i.test(linha.designacao) ? linha.areaPrivativaAcessoria : null,
      vaga,
      fracao: linha.coeficienteProporcionalidade !== null ? String(linha.coeficienteProporcionalidade) : null,
      confrontacoes: null,
      observacoes
    };
  });
}
function dadoExtraidoKey(bloco, campo) {
  return `${bloco}:${campo}`;
}
function upsertDadoExtraido(index, record) {
  index.set(dadoExtraidoKey(record.bloco, record.campo), record);
}
function mapDocumentoToDadosExtraidos(documento, options) {
  const index = /* @__PURE__ */ new Map();
  const statusCampo = options?.validadoNoWizard ? "confirmado" : "extraido";
  const statusPreliminares = "confirmado";
  for (const campo of documento.preliminares.campos) {
    upsertDadoExtraido(index, {
      bloco: "preliminares",
      campo: campo.chave,
      valor: campo.valor,
      confianca: 95,
      status: statusPreliminares
    });
  }
  for (const quadro of documento.quadros) {
    if (quadro.id === "preliminares") continue;
    if ("campos" in quadro && quadro.campos) {
      for (const campo of quadro.campos) {
        if (!campo.valor.trim()) continue;
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: campo.chave,
          valor: campo.valor,
          confianca: 92,
          status: statusCampo
        });
      }
    }
    if ((quadro.id === "qi" || quadro.id === "qcomp") && "totais" in quadro) {
      const areaRealGlobal = quadro.totais.areaRealGlobal !== null ? String(quadro.totais.areaRealGlobal) : "";
      if (areaRealGlobal) {
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: "area_real_global",
          valor: areaRealGlobal,
          confianca: 98,
          status: statusCampo
        });
      }
      const areaEquivGlobal = quadro.totais.areaEquivalenteGlobal !== null ? String(quadro.totais.areaEquivalenteGlobal) : "";
      if (areaEquivGlobal) {
        upsertDadoExtraido(index, {
          bloco: quadro.id,
          campo: "area_equiv_global",
          valor: areaEquivGlobal,
          confianca: 98,
          status: statusCampo
        });
      }
    }
    if (quadro.id === "qivb" && "linhas" in quadro) {
      for (const linha of quadro.linhas) {
        const observacoes = linha.observacoes?.trim() ?? "";
        if (!observacoes) continue;
        for (const key of buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || void 0)) {
          upsertDadoExtraido(index, {
            bloco: "qivb",
            campo: `observacoes__${key}`,
            valor: observacoes,
            confianca: 96,
            status: statusCampo
          });
        }
      }
    }
  }
  return [...index.values()];
}
function updateQuadroInDocumento(documento, quadroAtualizado) {
  const quadros = documento.quadros.map(
    (q) => q.id === quadroAtualizado.id ? quadroAtualizado : q
  );
  return {
    ...documento,
    quadros,
    preliminares: quadroAtualizado.id === "preliminares" ? quadroAtualizado : documento.preliminares
  };
}
function mapDocumentoToCondominioPavimentos(documento) {
  const qcomp = getQuadroById(documento, "qcomp");
  const qi = getQuadroById(documento, "qi");
  const fonte = quadroTemPavimentosUtil(qcomp) ? qcomp : quadroTemPavimentosUtil(qi) ? qi : qcomp?.linhas.length ? qcomp : qi;
  if (!fonte?.linhas.length) return [];
  return fonte.linhas.filter((linha) => linha.pavimento.trim()).map((linha, ordem) => ({
    torre: linha.torre?.trim() || null,
    nome: linha.pavimento.trim(),
    areaReal: linha.areaPavimentoReal,
    areaEquivalente: linha.areaPavimentoEquivalente,
    ordem,
    fonteQuadro: fonte.id
  }));
}
function quadroTemPavimentosUtil(quadro) {
  return (quadro?.linhas ?? []).some(
    (linha) => linha.pavimento.trim().length > 0 && (linha.areaPavimentoReal != null && linha.areaPavimentoReal > 0 || linha.areaPavimentoEquivalente != null && linha.areaPavimentoEquivalente > 0)
  );
}
function mapDocumentoToEspacosComuns(documento) {
  const qviii = getQuadroById(documento, "qviii");
  if (!qviii?.linhas.length) return [];
  const vistos = /* @__PURE__ */ new Set();
  const espacos = [];
  for (const linha of qviii.linhas) {
    if (linha.isSecao) continue;
    const nome = linha.dependencia.trim();
    if (!nome) continue;
    const chave = nome.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    espacos.push({
      nome,
      ordem: espacos.length,
      fonteQuadro: "qviii"
    });
  }
  return espacos;
}
const QUADROS_TECNICOS_BUCKET = "quadros-tecnicos";
const MIME_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".csv": "text/csv"
};
function resolveQuadroContentType(fileName, fileType) {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (MIME_BY_EXTENSION[ext]) return MIME_BY_EXTENSION[ext];
  const normalized = fileType?.trim();
  if (normalized && normalized !== "application/octet-stream") return normalized;
  return MIME_BY_EXTENSION[".pdf"];
}
function fileFromBuffer(buffer, name, type) {
  const contentType = resolveQuadroContentType(name, type);
  return new File([buffer], name, { type: contentType });
}
function buildQuadroStoragePath(organizationId, empreendimentoId, fileName) {
  const safeName = fileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return `${organizationId}/${empreendimentoId}/${unique}_${safeName || "quadro.pdf"}`;
}
function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatUploadedAt(iso) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}
function mapRow(row) {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    uploadedByProfileId: row.uploaded_by_profile_id,
    createdAt: row.created_at,
    processedAt: row.processed_at
  };
}
async function uploadQuadroBlob(storagePath, payload, contentType) {
  const body = payload instanceof Blob || payload instanceof File ? payload : new Blob([payload], { type: contentType });
  const { error } = await supabase.storage.from(QUADROS_TECNICOS_BUCKET).upload(storagePath, body, {
    cacheControl: "3600",
    upsert: false,
    contentType
  });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
async function persistQuadroFile(input, options = {}) {
  const status = options.status ?? "enviado";
  const processedAt = options.processedAt ?? null;
  const contentType = resolveQuadroContentType(input.file.name, input.file.type);
  const payload = input.fileBuffer ?? input.file;
  const storagePath = buildQuadroStoragePath(
    input.organizationId,
    input.empreendimentoId,
    input.file.name
  );
  const uploadResult = await uploadQuadroBlob(storagePath, payload, contentType);
  const storageOk = uploadResult.ok;
  if (!storageOk && !options.allowStorageFailure) {
    throw new Error(
      uploadResult.message || "Não foi possível enviar o arquivo para o storage do quadro técnico."
    );
  }
  const { data, error: insertError } = await supabase.from("quadros_tecnicos").insert({
    empreendimento_id: input.empreendimentoId,
    storage_path: storagePath,
    file_name: input.file.name,
    mime_type: contentType,
    size_bytes: input.file.size,
    status,
    processed_at: processedAt,
    uploaded_by_profile_id: input.profileId
  }).select("*").single();
  if (insertError) {
    if (storageOk) {
      await supabase.storage.from(QUADROS_TECNICOS_BUCKET).remove([storagePath]);
    }
    throw insertError;
  }
  const record = mapRow(data);
  if (options.auditDescription) {
    const metadata = {
      quadro_tecnico_id: record.id,
      storage_path: storagePath,
      storage_uploaded: storageOk,
      ...storageOk ? {} : { storage_error: uploadResult.ok ? null : uploadResult.message }
    };
    const { error: auditError } = await supabase.rpc("log_audit_event", {
      p_organization_id: input.organizationId,
      p_empreendimento_id: input.empreendimentoId,
      p_event_type: options.auditEventType ?? "upload",
      p_description: options.auditDescription,
      p_metadata: metadata
    });
    if (auditError) throw auditError;
  }
  return record;
}
const DB_EMPREENDIMENTO_STATUS = {
  rascunho: "rascunho",
  quadro_enviado: "quadro_enviado",
  dados_extraidos: "dados_extraidos",
  em_validacao: "em_validacao",
  pronto_para_gerar: "pronto_para_gerar",
  memorial_gerado: "memorial_gerado",
  em_revisao: "em_revisao",
  aprovado: "aprovado",
  exportado: "exportado"
};
const STATUS_LABELS = {
  rascunho: "Rascunho",
  quadro_enviado: "Quadro enviado",
  dados_extraidos: "Dados extraídos",
  em_validacao: "Em validação",
  pronto_para_gerar: "Pronto para gerar",
  memorial_gerado: "Memorial gerado",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  exportado: "Exportado"
};
const LABEL_TO_DB = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([db, label]) => [label, db])
);
const STATUS_FILTER_OPTIONS = [
  { label: "Todos", dbStatus: null },
  { label: "Em revisão", dbStatus: "em_revisao" },
  { label: "Dados extraídos", dbStatus: "dados_extraidos" },
  { label: "Pronto para gerar", dbStatus: "pronto_para_gerar" },
  { label: "Aprovado", dbStatus: "aprovado" }
];
function getEmpreendimentoStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}
function resolveStatusLabel(status) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  if (LABEL_TO_DB[status]) return status;
  return status;
}
function statusLabelToDb(label) {
  if (label === "Todos") return null;
  return LABEL_TO_DB[label] ?? label;
}
function emptyOrDash(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}
function formatDateBr(value) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}
function parseEnderecoParts(endereco) {
  if (!endereco) {
    return { rua: "", numero: "", cep: "", bairro: "", cidade: "", estado: "" };
  }
  return {
    rua: String(endereco.logradouro ?? endereco.rua ?? ""),
    numero: String(endereco.numero ?? ""),
    cep: String(endereco.cep ?? ""),
    bairro: String(endereco.bairro ?? ""),
    cidade: String(endereco.cidade ?? ""),
    estado: String(endereco.uf ?? endereco.estado ?? "")
  };
}
function formatEnderecoFromJson(endereco) {
  if (!endereco) return "";
  const texto = String(endereco.texto ?? endereco.completo ?? "").trim();
  if (texto) return texto;
  const parts = parseEnderecoParts(endereco);
  const linha = [parts.rua, parts.numero].filter(Boolean).join(", ");
  return [linha, parts.bairro, parts.cep].filter(Boolean).join(" · ");
}
function representanteFromNomeParcial(nome, id) {
  return {
    id,
    nome,
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
}
function mapSociosFromCampos(campos) {
  return campos.filter((c) => c.campo.startsWith("incorporador_socio_") && c.valor?.trim()).sort((a, b) => a.campo.localeCompare(b.campo)).map((c) => representanteFromNomeParcial(c.valor.trim(), `socio-${c.campo}`));
}
function mapRepresentante(row) {
  const endereco = parseEnderecoParts(row.endereco);
  return {
    id: String(row.id),
    nome: row.nome,
    cpf: row.cpf ?? "",
    rg: row.rg ?? "",
    estadoCivil: row.estado_civil ?? "Solteiro(a)",
    regimeComunhao: row.regime_comunhao ?? "",
    rua: endereco.rua,
    numero: endereco.numero,
    cep: endereco.cep,
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    estado: endereco.estado
  };
}
function normalizeImovelRow(imoveis) {
  if (!imoveis) return null;
  if (Array.isArray(imoveis)) return imoveis[0] ?? null;
  return imoveis;
}
function mapImovel(row, areaTerreno) {
  const imovel = normalizeImovelRow(row.imoveis);
  const cidade = emptyOrDash(row.cidade);
  const uf = emptyOrDash(row.uf);
  const loteQuadraBase = normalizeLoteQuadraFields(
    imovel?.lote_numero ?? row.lote ?? "",
    imovel?.quadra_numero ?? row.quadra ?? "",
    imovel?.lote_extenso,
    imovel?.quadra_extenso
  );
  const areaValor = imovel?.area_numero != null ? Number(imovel.area_numero) : areaTerreno > 0 ? areaTerreno : 0;
  const areaExtensoCalculado = imovel?.area_extenso?.trim() || (areaValor > 0 ? areaMetrosQuadradosPorExtenso(areaValor) : "");
  const ufBase = imovel?.uf ?? row.uf ?? "";
  const estadoExtensoCalculado = imovel?.estado_extenso?.trim() || ufPorExtenso(ufBase) || "";
  const matriculaNumeroBase = imovel?.matricula_numero ?? row.matricula ?? "";
  const matriculaExtensoCalculado = imovel?.matricula_extenso?.trim() || matriculaPorExtenso(matriculaNumeroBase);
  if (!imovel) {
    return {
      loteNumero: emptyOrDash(loteQuadraBase.lote),
      loteExtenso: emptyOrDash(loteQuadraBase.loteExtenso),
      quadraNumero: emptyOrDash(loteQuadraBase.quadra),
      quadraExtenso: emptyOrDash(loteQuadraBase.quadraExtenso),
      loteamento: "—",
      cidade,
      comarca: cidade,
      estado: uf,
      estadoExtenso: emptyOrDash(estadoExtensoCalculado),
      areaNumero: areaTerreno > 0 ? fmtNum(areaTerreno, 2) : "—",
      areaExtenso: emptyOrDash(areaExtensoCalculado),
      benfeitorias: "—",
      matriculaNumero: emptyOrDash(matriculaNumeroBase),
      matriculaExtenso: emptyOrDash(matriculaExtensoCalculado),
      cartorio: "—",
      confrontacoes: []
    };
  }
  const confrontacoes = (imovel.imovel_confrontacoes ?? []).sort((a, b) => a.ordem - b.ordem).map((c) => ({
    direcao: c.direcao,
    confrontante: c.confrontante ?? "—",
    medida: c.medida ?? "—",
    azimute: c.azimute ?? "—"
  }));
  const areaNumero = imovel.area_numero != null ? fmtNum(Number(imovel.area_numero), 2) : areaTerreno > 0 ? fmtNum(areaTerreno, 2) : "—";
  return {
    loteNumero: emptyOrDash(loteQuadraBase.lote),
    loteExtenso: emptyOrDash(loteQuadraBase.loteExtenso),
    quadraNumero: emptyOrDash(loteQuadraBase.quadra),
    quadraExtenso: emptyOrDash(loteQuadraBase.quadraExtenso),
    loteamento: emptyOrDash(imovel.loteamento),
    cidade: emptyOrDash(imovel.cidade ?? row.cidade),
    comarca: emptyOrDash(imovel.comarca ?? imovel.cidade ?? row.cidade),
    estado: emptyOrDash(imovel.uf ?? row.uf),
    estadoExtenso: emptyOrDash(estadoExtensoCalculado),
    areaNumero,
    areaExtenso: emptyOrDash(areaExtensoCalculado),
    benfeitorias: emptyOrDash(imovel.benfeitorias),
    matriculaNumero: emptyOrDash(matriculaNumeroBase),
    matriculaExtenso: emptyOrDash(matriculaExtensoCalculado),
    cartorio: emptyOrDash(imovel.cartorio),
    confrontacoes
  };
}
function mapPendenciasAbertas(pendencias) {
  return (pendencias ?? []).filter((p) => p.status === "aberta").map((p) => ({
    tone: p.severidade === "bloqueante" ? "alerta" : p.severidade === "atencao" ? "atencao" : "ceu",
    texto: p.mensagem
  }));
}
function mapIncorporadoraEndereco(row) {
  const enderecoJson = row.incorporadoras?.endereco ?? null;
  const parts = parseEnderecoParts(enderecoJson);
  const enderecoTexto = formatEnderecoFromJson(enderecoJson);
  return {
    razaoSocial: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "",
    endereco: enderecoTexto || "—",
    cidade: parts.cidade || row.cidade || "",
    estado: parts.estado || row.uf || ""
  };
}
function mapRowToListItem(row) {
  const dt = row.dados_tecnicos;
  return {
    id: row.id,
    idParam: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    responsavel: dt?.responsavel_tecnico ?? row.profiles?.full_name ?? "—",
    status: row.status,
    statusLabel: getEmpreendimentoStatusLabel(row.status),
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    unidades: dt?.unidades ?? 0
  };
}
function mapRowToView(row) {
  const dt = row.dados_tecnicos;
  const areaTerreno = Number(dt?.area_terreno ?? 0);
  const representantes = (row.incorporadoras?.representantes_legais ?? []).map(mapRepresentante);
  const loteQuadraEmp = normalizeLoteQuadraFields(row.lote ?? "", row.quadra ?? "");
  return {
    id: String(row.id),
    nome: row.nome,
    incorporadora: row.incorporadoras?.razao_social ?? "—",
    cnpj: row.incorporadoras?.cnpj ?? "—",
    cidade: row.cidade ?? "—",
    uf: row.uf ?? "—",
    endereco: row.endereco ?? "—",
    lote: emptyOrDash(loteQuadraEmp.lote),
    quadra: emptyOrDash(loteQuadraEmp.quadra),
    matricula: row.matricula ?? "—",
    responsavel: dt?.responsavel_tecnico ?? row.profiles?.full_name ?? "—",
    status: getEmpreendimentoStatusLabel(row.status),
    atualizadoEm: formatDateBr(row.updated_at),
    progresso: row.progresso,
    pendencias: row.pendencias_count,
    areaTerreno,
    areaGlobal: Number(dt?.area_global ?? 0),
    torres: dt?.torres ?? 0,
    pavimentos: dt?.pavimentos ?? 0,
    unidades: dt?.unidades ?? 0,
    vagas: dt?.vagas ?? 0,
    alvara: dt?.alvara ?? "—",
    dataAprovacao: formatDateBr(dt?.data_aprovacao),
    crea: dt?.crea_cau ?? "—",
    art: dt?.art_rrt ?? "—",
    incorporadoraEndereco: mapIncorporadoraEndereco(row),
    representantes,
    imovel: mapImovel(row, areaTerreno),
    areaPrivativaTotal: Number(dt?.area_privativa_total ?? 0),
    areaComumTotal: Number(dt?.area_comum_total ?? 0),
    pavimentosAreas: mapCondominioPavimentosEmbed(row.condominio_pavimentos),
    espacosComuns: mapCondominioEspacosComunsEmbed(row.condominio_espacos_comuns),
    pendenciasAbertas: mapPendenciasAbertas(row.pendencias)
  };
}
function mapCondominioPavimentosEmbed(rows) {
  return (rows ?? []).slice().sort((a, b) => a.ordem - b.ordem).map((row) => ({
    id: row.id,
    torre: row.torre?.trim() || null,
    nome: row.nome,
    areaReal: Number(row.area_real ?? 0),
    areaEquivalente: row.area_equivalente != null ? Number(row.area_equivalente) : null
  }));
}
function mapCondominioEspacosComunsEmbed(rows) {
  return (rows ?? []).slice().sort((a, b) => a.ordem - b.ordem).map((row) => ({
    id: row.id,
    nome: row.nome
  }));
}
async function persistCondominioComposicao(empreendimentoId, pavimentos, espacosComuns) {
  const { error: deletePavError } = await supabase.from("condominio_pavimentos").delete().eq("empreendimento_id", empreendimentoId);
  if (deletePavError) throw deletePavError;
  const { error: deleteEspError } = await supabase.from("condominio_espacos_comuns").delete().eq("empreendimento_id", empreendimentoId);
  if (deleteEspError) throw deleteEspError;
  if (pavimentos.length > 0) {
    const { error } = await supabase.from("condominio_pavimentos").insert(
      pavimentos.map((p) => ({
        empreendimento_id: empreendimentoId,
        torre: p.torre,
        nome: p.nome,
        area_real: p.areaReal,
        area_equivalente: p.areaEquivalente,
        ordem: p.ordem,
        fonte_quadro: p.fonteQuadro
      }))
    );
    if (error) throw error;
  }
  if (espacosComuns.length > 0) {
    const { error } = await supabase.from("condominio_espacos_comuns").insert(
      espacosComuns.map((e) => ({
        empreendimento_id: empreendimentoId,
        nome: e.nome,
        ordem: e.ordem,
        fonte_quadro: e.fonteQuadro
      }))
    );
    if (error) throw error;
  }
}
async function fetchLatestQuadroRow(empreendimentoId) {
  const { data, error } = await supabase.from("quadros_tecnicos").select("storage_path, file_name, mime_type").eq("empreendimento_id", empreendimentoId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}
async function downloadQuadroBuffer(storagePath) {
  const { data, error } = await supabase.storage.from(QUADROS_TECNICOS_BUCKET).download(storagePath);
  if (error || !data) return null;
  return data.arrayBuffer();
}
async function replaceCondominioComposicao(empreendimentoId, pavimentos, espacosComuns) {
  const { error: deletePavError } = await supabase.from("condominio_pavimentos").delete().eq("empreendimento_id", empreendimentoId);
  if (deletePavError) throw deletePavError;
  const { error: deleteEspError } = await supabase.from("condominio_espacos_comuns").delete().eq("empreendimento_id", empreendimentoId);
  if (deleteEspError) throw deleteEspError;
  if (pavimentos.length > 0) {
    const { error } = await supabase.from("condominio_pavimentos").insert(
      pavimentos.map((p) => ({
        empreendimento_id: empreendimentoId,
        torre: p.torre,
        nome: p.nome,
        area_real: p.areaReal,
        area_equivalente: p.areaEquivalente,
        ordem: p.ordem,
        fonte_quadro: p.fonteQuadro
      }))
    );
    if (error) throw error;
  }
  if (espacosComuns.length > 0) {
    const { error } = await supabase.from("condominio_espacos_comuns").insert(
      espacosComuns.map((e) => ({
        empreendimento_id: empreendimentoId,
        nome: e.nome,
        ordem: e.ordem,
        fonte_quadro: e.fonteQuadro
      }))
    );
    if (error) throw error;
  }
}
async function syncCondominioComposicaoFromDocumento(empreendimentoId, documento) {
  const pavimentos = mapDocumentoToCondominioPavimentos(documento);
  const espacosComuns = mapDocumentoToEspacosComuns(documento);
  await replaceCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);
  const [{ data: pavRows, error: pavError }, { data: espRows, error: espError }] = await Promise.all([
    supabase.from("condominio_pavimentos").select("id, torre, nome, area_real, area_equivalente, ordem").eq("empreendimento_id", empreendimentoId).order("ordem"),
    supabase.from("condominio_espacos_comuns").select("id, nome, ordem").eq("empreendimento_id", empreendimentoId).order("ordem")
  ]);
  if (pavError) throw pavError;
  if (espError) throw espError;
  return {
    pavimentos: mapCondominioPavimentosEmbed(pavRows),
    espacosComuns: mapCondominioEspacosComunsEmbed(espRows)
  };
}
async function backfillCondominioComposicaoFromQuadro(empreendimentoId) {
  const quadro = await fetchLatestQuadroRow(empreendimentoId);
  if (!quadro) return null;
  const buffer = await downloadQuadroBuffer(quadro.storage_path);
  if (!buffer) return null;
  const file = new File([buffer], quadro.file_name, {
    type: resolveQuadroContentType(quadro.file_name, quadro.mime_type ?? void 0)
  });
  const documento = await parseQuadroNbrFile(file);
  const synced = await syncCondominioComposicaoFromDocumento(empreendimentoId, documento);
  if (synced.pavimentos.length === 0 && synced.espacosComuns.length === 0) {
    return null;
  }
  return synced;
}
const EMPREENDIMENTO_LIST_SELECT = `
  id,
  nome,
  cidade,
  uf,
  endereco,
  lote,
  quadra,
  matricula,
  status,
  progresso,
  pendencias_count,
  updated_at,
  incorporadoras ( razao_social, cnpj ),
  profiles:responsavel_profile_id ( full_name ),
  dados_tecnicos (
    unidades,
    torres,
    pavimentos,
    vagas,
    area_terreno,
    area_global,
    alvara,
    data_aprovacao,
    crea_cau,
    art_rrt,
    responsavel_tecnico
  )
`;
const EMPREENDIMENTO_DETAIL_SELECT = `
  id,
  nome,
  cidade,
  uf,
  endereco,
  lote,
  quadra,
  matricula,
  status,
  progresso,
  pendencias_count,
  updated_at,
  incorporadoras (
    razao_social,
    cnpj,
    endereco,
    representantes_legais (
      id,
      nome,
      cpf,
      rg,
      estado_civil,
      regime_comunhao,
      endereco
    )
  ),
  profiles:responsavel_profile_id ( full_name ),
  dados_tecnicos (
    unidades,
    torres,
    pavimentos,
    vagas,
    area_terreno,
    area_global,
    area_privativa_total,
    area_comum_total,
    alvara,
    data_aprovacao,
    crea_cau,
    art_rrt,
    responsavel_tecnico
  ),
  imoveis (
    lote_numero,
    lote_extenso,
    quadra_numero,
    quadra_extenso,
    loteamento,
    cidade,
    comarca,
    uf,
    estado_extenso,
    area_numero,
    area_extenso,
    benfeitorias,
    matricula_numero,
    matricula_extenso,
    cartorio,
    imovel_confrontacoes (
      direcao,
      confrontante,
      medida,
      azimute,
      ordem
    )
  ),
  pendencias (
    mensagem,
    severidade,
    status
  ),
  condominio_pavimentos (
    id,
    torre,
    nome,
    area_real,
    area_equivalente,
    ordem
  ),
  condominio_espacos_comuns (
    id,
    nome,
    ordem
  )
`;
async function logAudit(organizationId, empreendimentoId, eventType, description) {
  const { error } = await supabase.rpc("log_audit_event", {
    p_organization_id: organizationId,
    p_empreendimento_id: empreendimentoId,
    p_event_type: eventType,
    p_description: description,
    p_metadata: null
  });
  if (error) throw error;
}
function incorporadoraEnderecoJson(endereco) {
  const texto = endereco?.trim();
  return texto ? { texto } : null;
}
async function findOrCreateIncorporadora(organizationId, razaoSocial, cnpj, endereco) {
  const normalizedCnpj = cnpj.replace(/\D/g, "");
  const enderecoJson = incorporadoraEnderecoJson(endereco);
  if (normalizedCnpj) {
    const { data: byCnpj } = await supabase.from("incorporadoras").select("id, endereco").eq("organization_id", organizationId).eq("cnpj", cnpj).maybeSingle();
    if (byCnpj) {
      if (enderecoJson && !byCnpj.endereco) {
        await supabase.from("incorporadoras").update({ endereco: enderecoJson }).eq("id", byCnpj.id);
      }
      return byCnpj.id;
    }
  }
  const { data: byName } = await supabase.from("incorporadoras").select("id, endereco").eq("organization_id", organizationId).ilike("razao_social", razaoSocial).maybeSingle();
  if (byName) {
    if (enderecoJson && !byName.endereco) {
      await supabase.from("incorporadoras").update({ endereco: enderecoJson }).eq("id", byName.id);
    }
    return byName.id;
  }
  const { data: created, error } = await supabase.from("incorporadoras").insert({
    organization_id: organizationId,
    razao_social: razaoSocial,
    cnpj: cnpj || null,
    endereco: enderecoJson
  }).select("id").single();
  if (error) throw error;
  return created.id;
}
async function fetchEmpreendimentosList() {
  const { data, error } = await supabase.from("empreendimentos").select(EMPREENDIMENTO_LIST_SELECT).order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(mapRowToListItem);
}
async function fetchEmpreendimentoDetail(id) {
  const { data, error } = await supabase.from("empreendimentos").select(EMPREENDIMENTO_DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const view = mapRowToView(data);
  const { data: dadosFallback } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", id).in("campo", [
    "projeto_area_terreno",
    "incorporador_endereco",
    "projeto_lote_quadra",
    "projeto_alvara",
    "projeto_data_aprovacao",
    "rt_art"
  ]);
  for (const dado of dadosFallback ?? []) {
    if (dado.campo === "projeto_area_terreno" && view.areaTerreno <= 0) {
      const parsed = parseBrNumeric(dado.valor ?? "");
      if (parsed !== null && parsed > 0) {
        view.areaTerreno = parsed;
        if (view.imovel.areaNumero === "—") {
          view.imovel.areaNumero = fmtNum(parsed, 2);
        }
        if (view.imovel.areaExtenso === "—") {
          view.imovel.areaExtenso = areaMetrosQuadradosPorExtenso(parsed);
        }
      }
    }
    if (dado.campo === "incorporador_endereco" && (view.incorporadoraEndereco.endereco === "—" || !view.incorporadoraEndereco.endereco.trim())) {
      const texto = dado.valor?.trim();
      if (texto) view.incorporadoraEndereco.endereco = texto;
    }
    if (dado.campo === "projeto_lote_quadra" && dado.valor?.trim()) {
      const parsed = parseLoteQuadra(dado.valor);
      const normalized = normalizeLoteQuadraFields(parsed.lote, parsed.quadra);
      const loteAtual = view.imovel.loteNumero;
      const precisaNormalizar = loteAtual === "—" || /quadra/i.test(loteAtual) || view.imovel.quadraNumero === "—";
      if (precisaNormalizar) {
        view.imovel.loteNumero = normalized.lote || "—";
        view.imovel.quadraNumero = normalized.quadra || "—";
        view.imovel.loteExtenso = normalized.loteExtenso || "—";
        view.imovel.quadraExtenso = normalized.quadraExtenso || "—";
        view.lote = normalized.lote || "—";
        view.quadra = normalized.quadra || "—";
      }
    }
    if (dado.campo === "projeto_alvara" && view.alvara === "—" && dado.valor?.trim()) {
      view.alvara = dado.valor.trim();
    }
    if (dado.campo === "projeto_data_aprovacao" && view.dataAprovacao === "—" && dado.valor?.trim()) {
      const iso = parseBrDate(dado.valor);
      view.dataAprovacao = iso ? formatDateBr(iso) : dado.valor.trim();
    }
    if (dado.campo === "rt_art" && view.art === "—" && dado.valor?.trim()) {
      view.art = dado.valor.trim();
    }
  }
  if (view.vagas <= 0) {
    const { data: preliminaresDados } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", id).eq("bloco", "preliminares");
    const preliminaresCampos = (preliminaresDados ?? []).map((d) => ({
      campo: d.campo,
      valor: d.valor ?? ""
    }));
    let totalVagas = sumVagasSecao38(preliminaresCampos);
    if (totalVagas <= 0) {
      totalVagas = preliminaresCampos.reduce((sum, item) => {
        if (!item.campo?.startsWith("projeto_vagas")) return sum;
        const v = item.valor.trim();
        return /^\d+$/.test(v) ? sum + Number(v) : sum;
      }, 0);
    }
    if (totalVagas > 0) {
      view.vagas = totalVagas;
      await supabase.from("dados_tecnicos").update({ vagas: totalVagas }).eq("empreendimento_id", id);
    }
  }
  if (view.representantes.length === 0) {
    const { data: sociosDados } = await supabase.from("dados_extraidos").select("campo, valor").eq("empreendimento_id", id).like("campo", "incorporador_socio_%").order("campo");
    const socios = mapSociosFromCampos(sociosDados ?? []);
    if (socios.length > 0) view.representantes = socios;
  }
  if (view.pavimentosAreas.length === 0) {
    try {
      const synced = await backfillCondominioComposicaoFromQuadro(id);
      if (synced) {
        view.pavimentosAreas = synced.pavimentos;
        view.espacosComuns = synced.espacosComuns;
      }
    } catch (error2) {
      console.warn("Falha ao sincronizar composição do condomínio a partir do quadro técnico:", error2);
    }
  }
  return view;
}
async function createEmpreendimentoFromWizard(input) {
  const incorporadoraId = await findOrCreateIncorporadora(
    input.organizationId,
    input.identificacao.incorporadora,
    input.identificacao.cnpj,
    input.identificacao.incorporadoraEndereco
  );
  const totalTorres = input.torres.length;
  const maxPavimentos = input.torres.length > 0 ? Math.max(...input.torres.map((t) => t.pavimentos)) : null;
  const loteQuadra = normalizeLoteQuadraFields(
    input.localizacao.lote,
    input.localizacao.quadra
  );
  const { data: empreendimento, error: empError } = await supabase.from("empreendimentos").insert({
    organization_id: input.organizationId,
    nome: input.identificacao.nome,
    incorporadora_id: incorporadoraId,
    cidade: input.localizacao.cidade,
    uf: input.localizacao.uf,
    endereco: input.localizacao.endereco,
    lote: loteQuadra.lote || null,
    quadra: loteQuadra.quadra || null,
    matricula: input.localizacao.matricula,
    responsavel_profile_id: input.profileId,
    status: DB_EMPREENDIMENTO_STATUS.dados_extraidos,
    progresso: 15,
    pendencias_count: 0
  }).select("id").single();
  if (empError) throw empError;
  const { error: dadosError } = await supabase.from("dados_tecnicos").insert({
    empreendimento_id: empreendimento.id,
    area_terreno: parseBrNumeric(input.areas.terreno),
    area_global: parseBrNumeric(input.areas.construida),
    area_privativa_total: parseBrNumeric(input.areas.privativa),
    area_comum_total: parseBrNumeric(input.areas.comum),
    torres: totalTorres || null,
    pavimentos: maxPavimentos,
    unidades: input.unidades.total,
    vagas: input.unidades.vagas,
    responsavel_tecnico: input.equipe.responsavel,
    crea_cau: input.equipe.creaCau || null,
    art_rrt: input.equipe.observacoes || null,
    alvara: input.aprovacao.alvara || null,
    data_aprovacao: parseBrDate(input.aprovacao.dataAprovacao) ?? null
  });
  if (dadosError) throw dadosError;
  const socios = [
    ...new Set(
      [
        ...input.identificacao.socios.map((s) => s.trim()),
        input.identificacao.representante.trim()
      ].filter(Boolean)
    )
  ];
  for (const nome of socios) {
    const { data: existente } = await supabase.from("representantes_legais").select("id").eq("incorporadora_id", incorporadoraId).ilike("nome", nome).maybeSingle();
    if (existente) continue;
    const { error: repError } = await supabase.from("representantes_legais").insert({
      incorporadora_id: incorporadoraId,
      nome
    });
    if (repError) throw repError;
  }
  const areaTerreno = parseBrNumeric(input.areas.terreno);
  const matriculaNumero = input.localizacao.matricula || null;
  const { error: imovelError } = await supabase.from("imoveis").insert({
    empreendimento_id: empreendimento.id,
    lote_numero: loteQuadra.lote || null,
    lote_extenso: loteQuadra.loteExtenso || null,
    quadra_numero: loteQuadra.quadra || null,
    quadra_extenso: loteQuadra.quadraExtenso || null,
    matricula_numero: matriculaNumero,
    matricula_extenso: matriculaNumero ? matriculaPorExtenso(matriculaNumero) : null,
    cidade: input.localizacao.cidade || null,
    uf: input.localizacao.uf || null,
    area_numero: areaTerreno,
    area_extenso: areaTerreno ? areaMetrosQuadradosPorExtenso(areaTerreno) : null
  });
  if (imovelError) throw imovelError;
  await logAudit(
    input.organizationId,
    empreendimento.id,
    "criacao",
    `Empreendimento "${input.identificacao.nome}" criado a partir do quadro técnico.`
  );
  return empreendimento.id;
}
async function createEmpreendimentoFromNbr(input) {
  const wizardInput = mapDocumentoToWizardInput(
    input.documento,
    input.organizationId,
    input.profileId
  );
  const empreendimentoId = await createEmpreendimentoFromWizard(wizardInput);
  try {
    const arquivo = fileFromBuffer(input.arquivo.buffer, input.arquivo.name, input.arquivo.type);
    const quadroRecord = await persistQuadroFile(
      {
        file: arquivo,
        fileBuffer: input.arquivo.buffer,
        empreendimentoId,
        organizationId: input.organizationId,
        profileId: input.profileId
      },
      {
        status: "processado",
        processedAt: (/* @__PURE__ */ new Date()).toISOString(),
        allowStorageFailure: true,
        auditEventType: "importacao_nbr",
        auditDescription: `Quadro CFMD "${input.arquivo.name}" vinculado na criação do empreendimento.`
      }
    );
    const dadosExtraidos = mapDocumentoToDadosExtraidos(input.documento, {
      validadoNoWizard: true
    });
    if (dadosExtraidos.length > 0) {
      const { error: dadosExtraidosError } = await supabase.from("dados_extraidos").insert(
        dadosExtraidos.map((d) => ({
          empreendimento_id: empreendimentoId,
          quadro_tecnico_id: quadroRecord.id,
          bloco: d.bloco,
          campo: d.campo,
          valor: d.valor,
          confianca: d.confianca,
          status: d.status
        }))
      );
      if (dadosExtraidosError) throw dadosExtraidosError;
    }
    const unidades = mapDocumentoToUnidades(input.documento);
    if (unidades.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < unidades.length; i += BATCH_SIZE) {
        const batch = unidades.slice(i, i + BATCH_SIZE);
        const { error: unidadesError } = await supabase.from("unidades_autonomas").insert(
          batch.map((u) => ({
            empreendimento_id: empreendimentoId,
            nome: u.nome,
            torre: u.torre,
            pavimento: u.pavimento,
            tipo: u.tipo,
            area_privativa: u.areaPrivativa,
            area_comum: u.areaComum,
            area_total: u.areaTotal,
            area_garden: u.areaGarden,
            vaga: u.vaga,
            fracao: u.fracao,
            confrontacoes: u.confrontacoes,
            observacoes: u.observacoes,
            status: "validado"
          }))
        );
        if (unidadesError) throw unidadesError;
      }
    }
    const pavimentos = mapDocumentoToCondominioPavimentos(input.documento);
    const espacosComuns = mapDocumentoToEspacosComuns(input.documento);
    await persistCondominioComposicao(empreendimentoId, pavimentos, espacosComuns);
    await supabase.from("empreendimentos").update({
      status: DB_EMPREENDIMENTO_STATUS.pronto_para_gerar,
      progresso: 55
    }).eq("id", empreendimentoId);
    await logAudit(
      input.organizationId,
      empreendimentoId,
      "importacao_nbr",
      `Importados ${input.documento.quadros.length} quadros NBR, ${unidades.length} unidades, ${pavimentos.length} pavimentos e ${espacosComuns.length} espaços comuns de "${wizardInput.identificacao.nome}".`
    );
    return empreendimentoId;
  } catch (error) {
    const { error: deleteError } = await supabase.from("empreendimentos").delete().eq("id", empreendimentoId);
    if (deleteError) {
      console.error("Falha ao reverter empreendimento após erro na importação NBR:", deleteError);
    }
    throw error;
  }
}
async function updateEmpreendimentoBasico(input) {
  const patch = {
    ...input.nome !== void 0 ? { nome: input.nome } : {},
    ...input.cidade !== void 0 ? { cidade: input.cidade } : {},
    ...input.uf !== void 0 ? { uf: input.uf } : {},
    ...input.endereco !== void 0 ? { endereco: input.endereco } : {},
    ...input.lote !== void 0 ? { lote: input.lote } : {},
    ...input.quadra !== void 0 ? { quadra: input.quadra } : {},
    ...input.matricula !== void 0 ? { matricula: input.matricula } : {}
  };
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from("empreendimentos").update(patch).eq("id", input.empreendimentoId);
  if (error) throw error;
  if (input.matricula !== void 0) {
    const matriculaNumero = input.matricula.trim();
    const matriculaExtenso = matriculaNumero ? matriculaPorExtenso(matriculaNumero) : null;
    const { error: imovelError } = await supabase.from("imoveis").update({
      matricula_numero: matriculaNumero || null,
      matricula_extenso: matriculaExtenso || null
    }).eq("empreendimento_id", input.empreendimentoId);
    if (imovelError) throw imovelError;
  }
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "edicao",
    `Empreendimento #${input.empreendimentoId} atualizado.`
  );
}
async function deleteEmpreendimento(input) {
  await logAudit(
    input.organizationId,
    input.empreendimentoId,
    "exclusao",
    `Empreendimento "${input.nome}" excluído.`
  );
  const { error } = await supabase.from("empreendimentos").delete().eq("id", input.empreendimentoId);
  if (error) throw error;
}
const $$splitComponentImporter = () => import("../_app.empreendimentos._id-BB2PHyRY.mjs");
const Route = createFileRoute("/_app/empreendimentos/$id")({
  loader: async ({
    params
  }) => {
    if (!/^\d+$/.test(params.id)) throw notFound();
    const emp = await fetchEmpreendimentoDetail(Number(params.id));
    if (!emp) throw notFound();
    return {
      emp
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$a.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$b
});
const EsqueciSenhaRoute = Route$9.update({
  id: "/esqueci-senha",
  path: "/esqueci-senha",
  getParentRoute: () => Route$b
});
const AppRoute = Route$8.update({
  id: "/_app",
  getParentRoute: () => Route$b
});
const AppIndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppModelosRoute = Route$6.update({
  id: "/modelos",
  path: "/modelos",
  getParentRoute: () => AppRoute
});
const AppHistoricoRoute = Route$5.update({
  id: "/historico",
  path: "/historico",
  getParentRoute: () => AppRoute
});
const AppConfiguracoesRoute = Route$4.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => AppRoute
});
const AppClausulasRoute = Route$3.update({
  id: "/clausulas",
  path: "/clausulas",
  getParentRoute: () => AppRoute
});
const AppEmpreendimentosIndexRoute = Route$2.update({
  id: "/empreendimentos/",
  path: "/empreendimentos/",
  getParentRoute: () => AppRoute
});
const AppEmpreendimentosNovoRoute = Route$1.update({
  id: "/empreendimentos/novo",
  path: "/empreendimentos/novo",
  getParentRoute: () => AppRoute
});
const AppEmpreendimentosIdRoute = Route.update({
  id: "/empreendimentos/$id",
  path: "/empreendimentos/$id",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppClausulasRoute,
  AppConfiguracoesRoute,
  AppHistoricoRoute,
  AppModelosRoute,
  AppIndexRoute,
  AppEmpreendimentosIdRoute,
  AppEmpreendimentosNovoRoute,
  AppEmpreendimentosIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  AppRoute: AppRouteWithChildren,
  EsqueciSenhaRoute,
  LoginRoute
};
const routeTree = Route$b._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = createQueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  deleteEmpreendimento as $,
  ACCEPTED_QUADRO_EXTENSIONS as A,
  getQuadroById as B,
  cellNum as C,
  designacaoParaExibicao as D,
  isUnidadeDesignacaoValida as E,
  QUADRO_TITULOS as F,
  QUADRO_III_SECOES_ORDEM as G,
  QUADRO_V_SECOES_ORDEM as H,
  QUADRO_III_FIELD_DEFS as I,
  fmtNumWithDecimals as J,
  fetchEmpreendimentoDetail as K,
  areaMetrosQuadradosPorExtenso as L,
  integerToPortuguese as M,
  QUADROS_TECNICOS_BUCKET as N,
  buildQivbVagaLookupFromObservacoesCampos as O,
  mergeVagaLookups as P,
  QUADROS_WIZARD_STEPS as Q,
  Route$a as R,
  STATUS_FILTER_OPTIONS as S,
  buildQivbVagaLookup as T,
  buildUnidadeVagaLookupKeys as U,
  lookupVagaInfo as V,
  extractVaga as W,
  DB_EMPREENDIMENTO_STATUS as X,
  fetchEmpreendimentosList as Y,
  createEmpreendimentoFromNbr as Z,
  updateEmpreendimentoBasico as _,
  sendPasswordReset as a,
  router as a0,
  signOut as b,
  supabase as c,
  statusLabelToDb as d,
  updateQuadroInDocumento as e,
  fmtNum as f,
  parseBrDate as g,
  parseBrNumeric as h,
  mapDocumentoToDadosExtraidos as i,
  mapDocumentoToUnidades as j,
  mapDocumentoToCondominioPavimentos as k,
  mapDocumentoToEspacosComuns as l,
  mapDocumentoToWizardInput as m,
  persistCondominioComposicao as n,
  QUADROS_DETAIL_STEPS as o,
  parseQuadroNbrFile as p,
  formatFileSize as q,
  resolveQuadroContentType as r,
  signInWithPassword as s,
  formatUploadedAt as t,
  useAuthContext as u,
  matriculaPorExtenso as v,
  fmtArea as w,
  formatEstadoUf as x,
  Route as y,
  resolveStatusLabel as z
};
