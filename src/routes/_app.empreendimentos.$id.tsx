import { createFileRoute, notFound } from "@tanstack/react-router";
import { fetchEmpreendimentoDetail } from "@/features/empreendimentos/api";
import { EmpreendimentoDetailPage } from "@/features/empreendimentos/components/empreendimento-detail-page";

export const Route = createFileRoute("/_app/empreendimentos/$id")({
  loader: async ({ params }) => {
    if (!/^\d+$/.test(params.id)) throw notFound();

    const emp = await fetchEmpreendimentoDetail(Number(params.id));
    if (!emp) throw notFound();
    return { emp };
  },
  component: DetalheEmpreendimento,
});

function DetalheEmpreendimento() {
  const { emp } = Route.useLoaderData();
  return <EmpreendimentoDetailPage emp={emp} />;
}
