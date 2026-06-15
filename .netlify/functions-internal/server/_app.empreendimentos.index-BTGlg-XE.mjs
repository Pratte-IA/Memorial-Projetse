import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { L as Link } from "./_libs/tanstack__react-router.mjs";
import { P as PageHeader } from "./_ssr/page-header-DWf6CKHo.mjs";
import { S as StatusBadge } from "./_ssr/status-badge-BUUpRPwN.mjs";
import { C as Card } from "./_ssr/card-BtiUI6Md.mjs";
import { B as Button } from "./_ssr/button-DjOZMqFS.mjs";
import { I as Input } from "./_ssr/input-D_U8fI25.mjs";
import { S as Skeleton } from "./_ssr/skeleton-BIi6OkoP.mjs";
import { u as useAuthContext, d as statusLabelToDb, S as STATUS_FILTER_OPTIONS } from "./_ssr/router-B3TCsBUu.mjs";
import { b as canManageOrg } from "./_ssr/permissions-CG48zVbx.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./_ssr/dialog-DNrxlBog.mjs";
import { L as Label } from "./_ssr/label-C8WJLhmR.mjs";
import { u as useEmpreendimentosList, a as useUpdateEmpreendimento, b as useDeleteEmpreendimento } from "./_ssr/hooks-C-EOYi9T.mjs";
import "./_ssr/index.mjs";
import { P as Plus, k as Search, l as Pencil, T as Trash2, m as TriangleAlert } from "./_libs/lucide-react.mjs";
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
import "./_ssr/status-BduXORC_.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
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
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
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
import "./_libs/radix-ui__react-label.mjs";
import "./_ssr/api-DHVf6FlI.mjs";
function DeleteEmpreendimentoDialog({
  item,
  open,
  onOpenChange
}) {
  const { membership } = useAuthContext();
  const deleteMutation = useDeleteEmpreendimento();
  const [step, setStep] = reactExports.useState(1);
  const [confirmText, setConfirmText] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!open) {
      setStep(1);
      setConfirmText("");
    }
  }, [open]);
  const nomeMatches = item !== null && confirmText.trim() === item.nome.trim();
  const handleClose = () => {
    onOpenChange(false);
  };
  const handleDelete = async () => {
    if (!item || !membership || !nomeMatches) return;
    try {
      await deleteMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId: item.id,
        nome: item.nome
      });
      toast.success("Empreendimento excluído");
      handleClose();
    } catch {
      toast.error("Não foi possível excluir o empreendimento");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: step === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-[var(--color-alerta)]" }),
        "Excluir empreendimento?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Você está prestes a excluir",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: item?.nome }),
        ". Esta ação é irreversível e removerá todos os dados vinculados — quadros técnicos, unidades, dados extraídos e pendências."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "destructive",
          onClick: () => setStep(2),
          children: "Continuar"
        }
      )
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirme a exclusão" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Para confirmar, digite o nome do empreendimento exatamente como aparece abaixo." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground rounded-md bg-muted px-3 py-2", children: item?.nome }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "delete-confirm-nome", children: "Nome do empreendimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "delete-confirm-nome",
            value: confirmText,
            onChange: (e) => setConfirmText(e.target.value),
            placeholder: "Digite o nome para confirmar",
            autoComplete: "off"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setStep(1), children: "Voltar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "destructive",
          disabled: !nomeMatches || deleteMutation.isPending,
          onClick: () => void handleDelete(),
          children: deleteMutation.isPending ? "Excluindo..." : "Excluir definitivamente"
        }
      )
    ] })
  ] }) }) });
}
function EditEmpreendimentoDialog({
  item,
  open,
  onOpenChange
}) {
  const { membership } = useAuthContext();
  const updateMutation = useUpdateEmpreendimento();
  const [nome, setNome] = reactExports.useState("");
  const [cidade, setCidade] = reactExports.useState("");
  const [uf, setUf] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!item) return;
    setNome(item.nome);
    setCidade(item.cidade === "—" ? "" : item.cidade);
    setUf(item.uf === "—" ? "" : item.uf);
  }, [item]);
  const handleSave = async () => {
    if (!item || !membership) return;
    try {
      await updateMutation.mutateAsync({
        organizationId: membership.organization_id,
        empreendimentoId: item.id,
        nome: nome.trim(),
        cidade: cidade.trim() || void 0,
        uf: uf.trim() || void 0
      });
      toast.success("Empreendimento atualizado");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar as alterações");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Editar empreendimento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Atualize os dados básicos de identificação." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-nome", children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "edit-nome", value: nome, onChange: (e) => setNome(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-cidade", children: "Cidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "edit-cidade", value: cidade, onChange: (e) => setCidade(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-uf", children: "UF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "edit-uf",
              value: uf,
              onChange: (e) => setUf(e.target.value),
              maxLength: 2
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: handleSave,
          disabled: !nome.trim() || updateMutation.isPending,
          children: updateMutation.isPending ? "Salvando..." : "Salvar"
        }
      )
    ] })
  ] }) });
}
function Empreendimentos() {
  const [busca, setBusca] = reactExports.useState("");
  const [filtro, setFiltro] = reactExports.useState("Todos");
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteItem, setDeleteItem] = reactExports.useState(null);
  const {
    role
  } = useAuthContext();
  const canDelete = canManageOrg(role);
  const {
    data: empreendimentos,
    isLoading,
    isError
  } = useEmpreendimentosList();
  const dbStatusFiltro = statusLabelToDb(filtro);
  const lista = (empreendimentos ?? []).filter((e) => {
    const termo = busca.toLowerCase();
    const okBusca = !busca || e.nome.toLowerCase().includes(termo) || e.incorporadora.toLowerCase().includes(termo);
    const okStatus = !dbStatusFiltro || e.status === dbStatusFiltro;
    return okBusca && okStatus;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Empreendimentos", subtitle: "Todos os memoriais cadastrados na esteira da Projetse.", breadcrumb: [{
      label: "Empreendimentos"
    }], action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/empreendimentos/novo", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Novo empreendimento"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-5 max-w-[1600px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 border-border shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3 md:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar por empreendimento ou incorporadora...", value: busca, onChange: (e) => setBusca(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: STATUS_FILTER_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFiltro(s.label), className: `px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${filtro === s.label ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`, children: s.label }, s.label)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-none overflow-hidden p-0", children: isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-12 text-center text-sm text-[var(--color-alerta)]", children: "Não foi possível carregar os empreendimentos. Tente recarregar a página." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Empreendimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Incorporadora" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Cidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Unidades" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Progresso" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Pendências" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-5 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          isLoading && Array.from({
            length: 4
          }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", colSpan: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }) }, i)),
          !isLoading && lista.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/empreendimentos/$id", params: {
              id: e.idParam
            }, className: "font-medium text-foreground hover:text-primary", children: e.nome }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground", children: e.incorporadora }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5 text-muted-foreground", children: [
              e.cidade,
              "/",
              e.uf
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-mono-tabular", children: e.unidades }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 flex-1 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[var(--color-verde-claro)]", style: {
                width: `${e.progresso}%`
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground text-mono-tabular w-9 text-right", children: [
                e.progresso,
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: e.pendencias > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-[var(--color-alerta)]", children: [
              e.pendencias,
              " pendência",
              e.pendencias > 1 ? "s" : ""
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: e.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", type: "button", onClick: () => setEditItem(e), "aria-label": `Editar ${e.nome}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", type: "button", className: "text-[var(--color-alerta)] hover:text-[var(--color-alerta)] hover:bg-[var(--color-alerta)]/10", onClick: () => setDeleteItem(e), "aria-label": `Excluir ${e.nome}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/empreendimentos/$id", params: {
                id: e.idParam
              }, children: "Abrir" }) })
            ] }) })
          ] }, e.id)),
          !isLoading && lista.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-5 py-12 text-center text-sm text-muted-foreground", children: "Nenhum empreendimento encontrado." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditEmpreendimentoDialog, { item: editItem, open: editItem !== null, onOpenChange: (open) => {
      if (!open) setEditItem(null);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteEmpreendimentoDialog, { item: deleteItem, open: deleteItem !== null, onOpenChange: (open) => {
      if (!open) setDeleteItem(null);
    } })
  ] });
}
export {
  Empreendimentos as component
};
