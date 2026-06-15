import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card } from "./card-BtiUI6Md.mjs";
import { u } from "../_libs/hookform__resolvers.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { a as sendPasswordReset } from "./router-B3TCsBUu.mjs";
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
const forgotSchema = objectType({
  email: stringType().email("Informe um e-mail válido")
});
function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const form = useForm({
    resolver: u(forgotSchema),
    defaultValues: { email: "" }
  });
  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(values.email);
      setSent(true);
      toast.success("Se o e-mail existir, enviaremos instruções de recuperação.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar o e-mail de recuperação.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Verifique sua caixa de entrada e siga o link para redefinir a senha." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Voltar ao login" }) })
    ] });
  }
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Enviando..." : "Enviar link de recuperação" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Voltar ao login" }) })
  ] });
}
function EsqueciSenhaPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Recuperar senha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Informe seu e-mail para receber um link de redefinição de senha." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPasswordForm, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
      "Lembrou a senha?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-foreground underline-offset-4 hover:underline", children: "Voltar ao login" })
    ] })
  ] }) });
}
export {
  EsqueciSenhaPage as component
};
