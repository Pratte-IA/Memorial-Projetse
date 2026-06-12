import { createFileRoute } from "@tanstack/react-router";
import { NovoEmpreendimentoWizard } from "@/features/quadro-nbr/components/novo-empreendimento-wizard";

export const Route = createFileRoute("/_app/empreendimentos/novo")({
  component: NovoEmpreendimentoWizard,
});
