import { DataRow } from "@/features/empreendimentos/components/detail-ui";
import type { UnidadeRecord } from "@/features/unidades/types";

import { tituloMatchesKeywords } from "./clausulas-estrutura";
import type { MemorialContextData } from "./types";

const SECAO_SLUG_ORDER = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c6b",
  "c7",
  "c8",
  "c9",
  "c10",
  "c11",
  "c12",
] as const;

function resolveSecaoSlug(titulo: string): (typeof SECAO_SLUG_ORDER)[number] | null {
  for (const slug of SECAO_SLUG_ORDER) {
    if (tituloMatchesKeywords(titulo, slug)) return slug;
  }
  return null;
}

function DataRowLong({ label, value }: { label: string; value: string }) {
  return (
    <li className="space-y-1 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="text-xs leading-relaxed text-foreground break-words">{value}</p>
    </li>
  );
}

function PainelSemVariaveis({ texto }: { texto: string }) {
  return <li className="text-xs text-muted-foreground">{texto}</li>;
}

interface SecaoPainelDadosProps {
  titulo: string;
  context: MemorialContextData | undefined;
  isExtra: boolean;
  isUnidades: boolean;
  unidadesLista: UnidadeRecord[];
}

export function SecaoPainelDados({
  titulo,
  context,
  isExtra,
  isUnidades,
  unidadesLista,
}: SecaoPainelDadosProps) {
  if (isUnidades) {
    return (
      <>
        <DataRow label="Unidades" value={`${unidadesLista.length}`} />
        <DataRow
          label="Validadas"
          value={`${unidadesLista.filter((u) => u.status === "validado").length}`}
        />
        <DataRow
          label="Pendentes"
          value={`${unidadesLista.filter((u) => u.status === "pendente").length}`}
        />
      </>
    );
  }

  if (isExtra) {
    return (
      <PainelSemVariaveis texto="Cláusula exclusiva deste memorial — edite manualmente o texto ao lado." />
    );
  }

  if (!context) {
    return <PainelSemVariaveis texto="Carregando contexto…" />;
  }

  const slug = resolveSecaoSlug(titulo);

  switch (slug) {
    case "c1":
      return (
        <>
          <DataRow label="Razão social" value={context.incorporadora.razaoSocial} />
          <DataRow label="CNPJ" value={context.incorporadora.cnpj} />
          <DataRow label="Endereço" value={context.incorporadora.endereco} />
          <DataRow
            label="Cidade/UF"
            value={`${context.incorporadora.cidade}/${context.incorporadora.uf}`}
          />
          <DataRow label="Representante" value={context.incorporadora.representante.nome} />
          <DataRow label="Empreendimento" value={context.empreendimento.nome} />
        </>
      );

    case "c2":
      return (
        <>
          <DataRow label="Lote" value={context.imovel.loteNumero} />
          <DataRow label="Quadra" value={context.imovel.quadraNumero} />
          <DataRow label="Loteamento" value={context.imovel.loteamento} />
          <DataRow label="Comarca" value={context.imovel.comarca} />
          <DataRow label="Área" value={context.imovel.area} />
          <DataRow label="Matrícula" value={context.imovel.matricula} />
          <DataRow label="Cartório" value={context.imovel.cartorio} />
        </>
      );

    case "c3":
      return <DataRow label="Empreendimento" value={context.empreendimento.nome} />;

    case "c4":
      return (
        <>
          <DataRow label="Área total edificada" value={context.empreendimento.areaTotalEdificada} />
          <DataRow label="Torres" value={context.empreendimento.qtdTorres} />
          <DataRow label="Pavimentos" value={context.empreendimento.qtdPavimentos} />
          <DataRow label="Unidades" value={context.empreendimento.qtdUnidades} />
          <DataRow label="Vagas" value={context.empreendimento.qtdVagas} />
          <DataRow label="Área privativa" value={context.empreendimento.areaPrivativa} />
          <DataRow label="Área comum" value={context.empreendimento.areaComum} />
          <DataRowLong label="Pavimentos (áreas)" value={context.areasPavimentos} />
          <DataRowLong label="Áreas comuns" value={context.empreendimento.areasComuns} />
        </>
      );

    case "c5":
      return (
        <>
          <DataRow label="Órgão" value={context.aprovacao.orgao} />
          <DataRow label="Alvará" value={context.aprovacao.alvara} />
          <DataRow label="Data" value={context.aprovacao.data} />
          <DataRow label="Prefeitura" value={context.aprovacao.prefeitura} />
          <DataRow label="Resp. projeto" value={context.responsavelProjeto.nome} />
          <DataRow label="CREA projeto" value={context.responsavelProjeto.crea} />
          <DataRow label="ART projeto" value={context.responsavelProjeto.art} />
          <DataRow label="Resp. obra" value={context.responsavelObra.nome} />
          <DataRow label="CREA obra" value={context.responsavelObra.crea} />
          <DataRow label="ART obra" value={context.responsavelObra.art} />
        </>
      );

    case "c6b":
      return (
        <>
          <DataRow label="Custo global" value={context.orcamento.valor} />
          <DataRow label="CUB" value={context.orcamento.cubDesignacao} />
          <DataRow label="Padrão" value={context.orcamento.padraoAcabamento} />
          <DataRow label="Mês referência" value={context.orcamento.mesReferenciaCub} />
          <DataRow label="Sindicato" value={context.orcamento.sindicatoCub} />
          <DataRow label="Custo/m²" value={context.orcamento.custoMetroQuadrado} />
          {context.listaOrcamentoUnidades ? (
            <DataRowLong label="Por unidade" value={context.listaOrcamentoUnidades} />
          ) : null}
        </>
      );

    case "c7":
      return <DataRow label="Empreendimento" value={context.empreendimento.nome} />;

    case "c8":
      return (
        <PainelSemVariaveis texto="Texto padrão da convenção — sem variáveis do cadastro." />
      );

    case "c9":
      return (
        <>
          <DataRow label="Empreendimento" value={context.empreendimento.nome} />
          <DataRow label="Etapas" value={context.empreendimento.qtdEtapas} />
        </>
      );

    case "c10":
    case "c11":
      return (
        <PainelSemVariaveis texto="Texto padrão fixo — sem variáveis do cadastro." />
      );

    case "c12":
      return <DataRow label="Comarca" value={context.empreendimento.comarca} />;

    default:
      return (
        <PainelSemVariaveis texto="Não foi possível identificar os dados desta seção." />
      );
  }
}
