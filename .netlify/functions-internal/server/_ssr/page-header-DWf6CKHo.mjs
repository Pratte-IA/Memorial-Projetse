import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { V as Bell } from "../_libs/lucide-react.mjs";
function PageHeader({ title, subtitle, breadcrumb, action }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-5 flex items-start justify-between gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      breadcrumb && breadcrumb.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5", children: breadcrumb.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: i === breadcrumb.length - 1 ? "text-foreground" : "", children: b.label })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight text-foreground", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
      action,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "icon", className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-atencao)] text-[10px] font-semibold text-preto flex items-center justify-center", children: "3" })
      ] })
    ] })
  ] }) });
}
export {
  PageHeader as P
};
