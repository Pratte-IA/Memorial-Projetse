import { buildUnidadeVagaLookupKeys } from "@/features/quadro-nbr/extract-vaga";
import type { DocumentoNbrExtraido, QuadroExtraido } from "@/features/quadro-nbr/types";
import { parseBrNumeric } from "@/lib/format";

export interface DadoExtraidoOverlay {
  bloco: string;
  campo: string;
  valor: string | null;
}

function overlayKey(bloco: string, campo: string): string {
  return `${bloco}::${campo}`;
}

function buildOverlayMap(dados: DadoExtraidoOverlay[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const d of dados) {
    if (d.valor === null) continue;
    map.set(overlayKey(d.bloco, d.campo), d.valor);
  }
  return map;
}

function applyCamposQuadro(
  quadro: QuadroExtraido,
  overlay: Map<string, string>,
): QuadroExtraido {
  if (!("campos" in quadro) || !quadro.campos) return quadro;

  const existingKeys = new Set(quadro.campos.map((c) => c.chave));
  const campos = quadro.campos.map((campo) => {
    const valor = overlay.get(overlayKey(quadro.id, campo.chave));
    return valor !== undefined ? { ...campo, valor } : campo;
  });

  for (const [key, valor] of overlay) {
    const [bloco, campo] = key.split("::");
    if (bloco !== quadro.id || existingKeys.has(campo)) continue;
    campos.push({ chave: campo, rotulo: campo, valor });
  }

  return { ...quadro, campos };
}

function applyTotaisQuadro(
  quadro: QuadroExtraido,
  overlay: Map<string, string>,
): QuadroExtraido {
  if ((quadro.id !== "qi" && quadro.id !== "qcomp") || !("totais" in quadro)) return quadro;

  const areaRealStr = overlay.get(overlayKey(quadro.id, "area_real_global"));
  const areaEquivStr = overlay.get(overlayKey(quadro.id, "area_equiv_global"));

  if (areaRealStr === undefined && areaEquivStr === undefined) return quadro;

  return {
    ...quadro,
    totais: {
      areaRealGlobal:
        areaRealStr !== undefined ? parseBrNumeric(areaRealStr) : quadro.totais.areaRealGlobal,
      areaEquivalenteGlobal:
        areaEquivStr !== undefined
          ? parseBrNumeric(areaEquivStr)
          : quadro.totais.areaEquivalenteGlobal,
    },
  };
}

function applyQivbObservacoes(
  quadro: QuadroExtraido,
  overlay: Map<string, string>,
): QuadroExtraido {
  if (quadro.id !== "qivb" || !("linhas" in quadro)) return quadro;

  const linhas = quadro.linhas.map((linha) => {
    for (const key of buildUnidadeVagaLookupKeys(linha.designacao, linha.bloco || undefined)) {
      const valor = overlay.get(overlayKey("qivb", `observacoes__${key}`));
      if (valor !== undefined) {
        return { ...linha, observacoes: valor };
      }
    }
    return linha;
  });

  return { ...quadro, linhas };
}

/** Sobrepõe valores persistidos em dados_extraidos sobre o documento parseado do arquivo. */
export function applyDadosExtraidosToDocumento(
  documento: DocumentoNbrExtraido,
  dados: DadoExtraidoOverlay[],
): DocumentoNbrExtraido {
  if (!dados.length) return documento;

  const overlay = buildOverlayMap(dados);

  const preliminaresCampos = documento.preliminares.campos.map((campo) => {
    const valor = overlay.get(overlayKey("preliminares", campo.chave));
    return valor !== undefined ? { ...campo, valor } : campo;
  });

  const quadros = documento.quadros.map((quadro) => {
    let next = applyCamposQuadro(quadro, overlay);
    next = applyTotaisQuadro(next, overlay);
    next = applyQivbObservacoes(next, overlay);
    return next;
  });

  return {
    ...documento,
    preliminares: { ...documento.preliminares, campos: preliminaresCampos },
    quadros,
  };
}
