import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { z as resolveStatusLabel } from "./router-B3TCsBUu.mjs";
import { r as resolveSecaoStatusLabel, a as resolveUnidadeStatusLabel } from "./status-BduXORC_.mjs";
import { c as cn } from "./button-DjOZMqFS.mjs";
const map = {
  // Empreendimento
  Rascunho: "bg-muted text-muted-foreground border-border",
  "Quadro enviado": "bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] border-[var(--color-ceu)]/30",
  "Dados extraídos": "bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] border-[var(--color-ceu)]/30",
  "Em validação": "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)] border-[var(--color-atencao)]/40",
  "Pronto para gerar": "bg-[var(--color-verde-claro)]/15 text-[var(--color-verde)] border-[var(--color-verde-claro)]/40",
  "Memorial gerado": "bg-[var(--color-verde-claro)]/15 text-[var(--color-verde)] border-[var(--color-verde-claro)]/40",
  "Em revisão": "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)] border-[var(--color-atencao)]/40",
  Aprovado: "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] border-[var(--color-verde)]/40",
  Exportado: "bg-[var(--color-verde-escuro)]/10 text-[var(--color-verde-escuro)] border-[var(--color-verde-escuro)]/30",
  // Unidade
  Validado: "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] border-[var(--color-verde)]/40",
  Pendente: "bg-[var(--color-atencao)]/15 text-[oklch(0.45_0.13_85)] border-[var(--color-atencao)]/40",
  Inconsistência: "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)] border-[var(--color-alerta)]/40",
  "Não revisado": "bg-muted text-muted-foreground border-border",
  // Seção
  "Não gerada": "bg-muted text-muted-foreground border-border",
  Gerada: "bg-[var(--color-ceu)]/10 text-[var(--color-ceu)] border-[var(--color-ceu)]/30",
  "Com pendência": "bg-[var(--color-alerta)]/12 text-[var(--color-alerta)] border-[var(--color-alerta)]/40",
  Aprovada: "bg-[var(--color-verde)]/15 text-[var(--color-verde-escuro)] border-[var(--color-verde)]/40"
};
function StatusBadge({ status, className }) {
  const label = resolveSecaoStatusLabel(resolveUnidadeStatusLabel(resolveStatusLabel(status)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        map[label] ?? map[status] ?? "bg-muted text-muted-foreground border-border",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current opacity-70" }),
        label
      ]
    }
  );
}
export {
  StatusBadge as S
};
