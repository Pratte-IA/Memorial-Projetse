import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { C as Card } from "./card-BtiUI6Md.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u } from "../_libs/hookform__resolvers.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { R as Route$a, u as useAuthContext, s as signInWithPassword } from "./router-B3TCsBUu.mjs";
import "./index.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/xlsx.mjs";
import "../_libs/date-fns.mjs";
const loginSchema = objectType({
  email: stringType().email("Informe um e-mail válido"),
  password: stringType().min(6, "A senha deve ter pelo menos 6 caracteres")
});
function LoginForm({ redirectTo = "/" }) {
  const navigate = useNavigate();
  const { refresh } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const form = useForm({
    resolver: u(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await signInWithPassword(values.email, values.password);
      await refresh();
      toast.success("Login realizado com sucesso");
      await navigate({ href: redirectTo });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível entrar. Verifique suas credenciais.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "email",
          type: "email",
          autoComplete: "email",
          placeholder: "seu@email.com",
          ...form.register("email")
        }
      ),
      form.formState.errors.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: form.formState.errors.email.message }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/esqueci-senha", className: "text-xs text-muted-foreground hover:text-foreground", children: "Esqueci minha senha" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "password",
          type: "password",
          autoComplete: "current-password",
          placeholder: "••••••••",
          ...form.register("password")
        }
      ),
      form.formState.errors.password ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: form.formState.errors.password.message }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Entrando..." : "Entrar" })
  ] });
}
function LoginPage() {
  const {
    redirect
  } = Route$a.useSearch();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 rounded-md bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xl font-semibold", children: "π" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Projetse Memorial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Acesse com sua conta para continuar a gestão dos memoriais de incorporação." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoginForm, { redirectTo: redirect ?? "/" }) })
  ] }) });
}
export {
  LoginPage as component
};
