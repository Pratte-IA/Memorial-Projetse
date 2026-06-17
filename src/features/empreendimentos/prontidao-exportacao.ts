import { ensureDadosExtraidosSeeded, fetchDadosExtraidos } from "@/features/dados-extraidos/api";
import { fetchMemorial } from "@/features/memorial/api";
import { fetchLatestQuadroTecnico } from "@/features/quadros-tecnicos/api";
import { fetchUnidadesResumo } from "@/features/unidades/api";

import { fetchEmpreendimentoDetail } from "./api";
import {
  buildQuadrosIntegridade,
  countQuadrosValidados,
  enrichMemorialDescQuadrosFromDocumento,
} from "./integridade-quadros";
import { loadLatestQuadroDocumento } from "./load-quadro-documento";
import { ensureValidacaoPosImportacao } from "./sync-pos-importacao";
import type {
  ProntidaoExportacaoView,
  ProntidaoItem,
  ProntidaoItemStatus,
} from "./types/prontidao-types";

function item(
  partial: Omit<ProntidaoItem, "status"> & { status: ProntidaoItemStatus },
): ProntidaoItem {
  return partial;
}

export async function fetchProntidaoExportacao(
  empreendimentoId: number,
): Promise<ProntidaoExportacaoView> {
  await ensureValidacaoPosImportacao(empreendimentoId);
  await ensureDadosExtraidosSeeded(empreendimentoId);

  const [emp, dadosExtraidos, unidadesResumo, memorial, quadro] = await Promise.all([
    fetchEmpreendimentoDetail(empreendimentoId),
    fetchDadosExtraidos(empreendimentoId),
    fetchUnidadesResumo(empreendimentoId),
    fetchMemorial(empreendimentoId),
    fetchLatestQuadroTecnico(empreendimentoId),
  ]);

  const quadrosBase = buildQuadrosIntegridade({
    blocos: dadosExtraidos.blocos,
    unidadesTotal: unidadesResumo.total,
    unidadesValidadas: unidadesResumo.validado,
  });

  const memorialDescAusentes = quadrosBase
    .filter((q) => ["qvi", "qvii", "qviii"].includes(q.bloco))
    .every((q) => q.status === "ausente");

  const documentoMemorial = memorialDescAusentes
    ? await loadLatestQuadroDocumento(empreendimentoId)
    : null;

  const quadros = enrichMemorialDescQuadrosFromDocumento(quadrosBase, documentoMemorial);

  const { validados: quadrosValidados, total: quadrosTotal } = countQuadrosValidados(quadros);

  const itens: ProntidaoItem[] = [];

  const cnpjOk = Boolean(emp?.incorporadoraEndereco.cnpj?.trim());
  const repOk =
    (emp?.representantes.length ?? 0) > 0 &&
    emp!.representantes.every((r) => r.cpf?.trim() && r.nome?.trim());

  itens.push(
    item({
      id: "qualificacao",
      grupo: "cadastro",
      clausula: "Preâmbulo",
      titulo: "Qualificação da incorporadora",
      descricao: "CNPJ, representante legal e dados societários para o preâmbulo do instrumento.",
      status: cnpjOk && repOk ? "ok" : cnpjOk || repOk ? "atencao" : "bloqueante",
      detalhe:
        !cnpjOk && !repOk
          ? "CNPJ e representante incompletos"
          : !cnpjOk
            ? "CNPJ da incorporadora pendente"
            : !repOk
              ? "Representante legal incompleto"
              : undefined,
    }),
  );

  const imovel = emp?.imovel;
  const confrontacoesCompletas =
    imovel?.confrontacoes.filter(
      (c) =>
        c.confrontante !== "—" &&
        c.medida !== "—" &&
        c.azimute !== "—" &&
        c.direcao !== "—" &&
        c.confrontante.trim() &&
        c.medida.trim() &&
        c.azimute.trim(),
    ).length ?? 0;

  const imovelOk =
    imovel &&
    imovel.matriculaNumero !== "—" &&
    confrontacoesCompletas > 0 &&
    imovel.areaNumero !== "—";

  itens.push(
    item({
      id: "imovel",
      grupo: "cadastro",
      clausula: "Cláusula Primeira",
      titulo: "Propriedade e localização do imóvel",
      descricao: "Matrícula, área do terreno e confrontações do lote matriculado.",
      status: imovelOk ? "ok" : imovel?.matriculaNumero !== "—" ? "atencao" : "bloqueante",
      detalhe: imovelOk
        ? `${confrontacoesCompletas} confrontação${confrontacoesCompletas > 1 ? "ões" : ""} cadastrada${confrontacoesCompletas > 1 ? "s" : ""}`
        : confrontacoesCompletas > 0
          ? `${confrontacoesCompletas} confrontação${confrontacoesCompletas > 1 ? "ões" : ""} — complete matrícula e demais campos`
          : "Imóvel ou confrontações não cadastrados",
    }),
  );

  const qi = quadros.find((q) => q.bloco === "qi" || q.bloco === "qcomp");
  const qiStatus = qi?.status ?? "ausente";
  itens.push(
    item({
      id: "composicao",
      grupo: "quadros",
      clausula: "Cláusula Terceira",
      titulo: "Composição do condomínio",
      descricao: "Torres, pavimentos, áreas comuns e privativas (Quadro I).",
      status:
        qiStatus === "validado"
          ? "ok"
          : qiStatus === "ausente"
            ? "bloqueante"
            : qiStatus === "pendente"
              ? "bloqueante"
              : "atencao",
      detalhe: qi ? getQuadroStatusDetalhe(qi) : "Quadro I não encontrado",
    }),
  );

  const preliminares = quadros.find((q) => q.bloco === "preliminares");
  const alvaraOk = Boolean(emp?.alvara && emp.alvara !== "—");
  itens.push(
    item({
      id: "aprovacao",
      grupo: "quadros",
      clausula: "Cláusula Quarta",
      titulo: "Aprovação do projeto arquitetônico",
      descricao: "Alvará, data, responsável técnico, CREA e ART (Informações Preliminares).",
      status:
        preliminares?.status === "validado" && alvaraOk
          ? "ok"
          : preliminares?.status === "validado" || alvaraOk
            ? "atencao"
            : "bloqueante",
      detalhe: alvaraOk ? `Alvará ${emp?.alvara}` : "Alvará não informado",
    }),
  );

  const unidadesOk =
    unidadesResumo.total > 0 && unidadesResumo.validado === unidadesResumo.total;
  const unidadesParcial = unidadesResumo.validado > 0 && !unidadesOk;

  itens.push(
    item({
      id: "unidades",
      grupo: "unidades",
      clausula: "Cláusula Quinta",
      titulo: "Descrição das unidades autônomas",
      descricao:
        "Unidades validadas na importação do quadro (Quadro II / IV B). Edite individualmente se necessário.",
      status: unidadesOk
        ? "ok"
        : unidadesResumo.total === 0
          ? "bloqueante"
          : unidadesParcial
            ? "atencao"
            : "bloqueante",
      detalhe: `${unidadesResumo.validado}/${unidadesResumo.total} unidades validadas`,
    }),
  );

  const memorialDesc = quadros.filter((q) =>
    ["qvi", "qvii", "qviii"].includes(q.bloco),
  );
  const memorialDescOk = memorialDesc.every(
    (q) => q.status === "validado" || q.status === "extraido",
  );
  const memorialDescValidado = memorialDesc.every((q) => q.status === "validado");

  itens.push(
    item({
      id: "memorial-descritivo",
      grupo: "quadros",
      clausula: "Memorial Descritivo",
      titulo: "Equipamentos e acabamentos",
      descricao: "Quadros VI, VII e VIII para o memorial descritivo do empreendimento.",
      status: memorialDescValidado
        ? "ok"
        : memorialDescOk
          ? "atencao"
          : memorialDesc.some((q) => q.status === "ausente")
            ? "bloqueante"
            : "atencao",
      detalhe: memorialDesc
        .map((q) => `${q.titulo.replace(/^Quadro \w+ — /, "")}: ${q.status}`)
        .join(" · "),
    }),
  );

  const secoes = memorial?.secoes ?? [];
  const secoesGeradas = secoes.filter((s) => s.status !== "nao_gerada").length;
  const secoesAprovadas = secoes.filter((s) => s.status === "aprovada").length;
  const memorialExiste = secoes.length > 0;

  itens.push(
    item({
      id: "memorial-secoes",
      grupo: "memorial",
      titulo: "Seções do memorial geradas",
      descricao: "Texto jurídico montado a partir dos dados validados e modelos de cláusulas.",
      status: !memorialExiste
        ? "bloqueante"
        : secoesGeradas === secoes.length
          ? "ok"
          : secoesGeradas > 0
            ? "atencao"
            : "bloqueante",
      detalhe: memorialExiste
        ? `${secoesGeradas}/${secoes.length} seções geradas`
        : "Gere o memorial antes de exportar",
    }),
  );

  itens.push(
    item({
      id: "memorial-aprovacao",
      grupo: "memorial",
      titulo: "Seções aprovadas para versão final",
      descricao: "Todas as seções revisadas e aprovadas pela equipe técnica.",
      status:
        !memorialExiste
          ? "nao_aplicavel"
          : secoesAprovadas === secoes.length
            ? "ok"
            : secoesAprovadas > 0
              ? "atencao"
              : "bloqueante",
      detalhe: memorialExiste
        ? `${secoesAprovadas}/${secoes.length} seções aprovadas`
        : undefined,
    }),
  );

  const quadroProcessado = quadro?.status === "processado";
  itens.push(
    item({
      id: "anexo-quadros",
      grupo: "anexo",
      titulo: "Anexo — Quadros NBR 12.721",
      descricao:
        "Arquivo técnico validado anexado ao instrumento (conforme referência na Cláusula Quinta).",
      status: quadroProcessado ? "ok" : quadro ? "atencao" : "bloqueante",
      detalhe: quadro
        ? quadroProcessado
          ? quadro.fileName
          : `Arquivo enviado — status: ${quadro.status}`
        : "Nenhum quadro técnico vinculado",
    }),
  );

  const anexoIntegridade = quadros.filter(
    (q) =>
      !["preliminares", "qcomp"].includes(q.bloco) &&
      q.status !== "ausente" &&
      q.status !== "validado",
  );

  itens.push(
    item({
      id: "integridade-quadros",
      grupo: "anexo",
      titulo: "Integridade dos quadros validados",
      descricao: "Snapshots confirmados de cada bloco NBR alimentam o memorial e o anexo.",
      status:
        quadrosValidados === quadrosTotal
          ? "ok"
          : anexoIntegridade.length === 0
            ? "ok"
            : "atencao",
      detalhe: `${quadrosValidados}/${quadrosTotal} blocos validados`,
    }),
  );

  const bloqueantes = itens.filter((i) => i.status === "bloqueante").length;
  const ok = itens.filter((i) => i.status === "ok").length;
  const aplicaveis = itens.filter((i) => i.status !== "nao_aplicavel").length;
  const progressoGeral = aplicaveis > 0 ? Math.round((ok / aplicaveis) * 100) : 0;

  return {
    quadros,
    itens,
    progressoGeral,
    quadrosValidados,
    quadrosTotal,
    prontoExportacaoFinal: bloqueantes === 0 && secoesAprovadas === secoes.length && secoes.length > 0,
  };
}

function getQuadroStatusDetalhe(q: {
  status: string;
  camposConfirmados: number;
  totalCampos: number;
  detalhe?: string;
}): string {
  if (q.detalhe) return q.detalhe;
  if (q.totalCampos === 0) return "Sem campos extraídos";
  return `${q.camposConfirmados}/${q.totalCampos} campos confirmados`;
}
