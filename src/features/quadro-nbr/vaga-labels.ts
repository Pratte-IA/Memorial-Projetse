const ROTULOS_VAGAS_PADRAO: Record<string, string> = {
  projeto_vagas_total: "3.8 Quantidade de vagas de estacionamento para Veículos",
  projeto_vagas_ua: "3.8.1 Vagas de Estacionamento (Unidade Autônoma)",
  projeto_vagas_38_2: "3.8.2 Vagas de Estacionamento (acessório de Unidade Autônoma)",
  projeto_vagas_38_3: "3.8.3 Vagas de Estacionamento (áreas de uso comum)",
};

export const CHAVE_VAGAS_TOTAL = "projeto_vagas_total";

export const CHAVES_VAGAS_SUBITENS = [
  "projeto_vagas_ua",
  "projeto_vagas_38_2",
  "projeto_vagas_38_3",
] as const;

export function isChaveVagaSubitem(chave: string): chave is (typeof CHAVES_VAGAS_SUBITENS)[number] {
  return (CHAVES_VAGAS_SUBITENS as readonly string[]).includes(chave);
}

export function parseQuantidadeVaga(valor: string): number {
  const trimmed = valor.trim();
  if (!trimmed) return 0;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  return digitsOnly && Number(digitsOnly) > 0 ? Number(digitsOnly) : 0;
}

export function calcularTotalVagasSubitens(
  campos: Array<{ chave: string; valor: string }>,
): number {
  return CHAVES_VAGAS_SUBITENS.reduce((sum, chave) => {
    const campo = campos.find((c) => c.chave === chave);
    return sum + parseQuantidadeVaga(campo?.valor ?? "");
  }, 0);
}

export function rotuloVagaPadrao(chave: string): string | undefined {
  return ROTULOS_VAGAS_PADRAO[chave];
}

export function isRotuloVagaDescritivo(rotulo: string): boolean {
  if (/coberta|descoberta|acessóri|uso comum|unidade autônoma|garagem|estacionamento/i.test(rotulo)) {
    return true;
  }
  // Rótulos curtos como "3.8.2 Vagas" não trazem o contexto da planilha.
  return rotulo.replace(/\s+/g, " ").trim().length > 28;
}

/** Extrai tipo de vaga (coberta/descoberta etc.) a partir do rótulo da planilha. */
export function extractTipoVaga(rotulo: string, chave: string): string | null {
  const text = rotulo.toLowerCase();

  if (/descoberta/.test(text)) return "Descoberta";
  if (/\bcoberta\b/.test(text)) return "Coberta";
  if (/uso comum/.test(text)) return "Uso comum";
  if (/acess[oó]ri/.test(text)) return "Acessório de UA";
  if (/unidade aut[oô]noma/.test(text) && chave === "projeto_vagas_ua") {
    return "Unidade autônoma";
  }

  return null;
}

export function rotuloSecao38Preferido(parsed: string, fallback: string): string {
  const rotuloPlanilha = parsed.trim();
  if (!rotuloPlanilha) return fallback;
  if (isRotuloVagaDescritivo(rotuloPlanilha)) return rotuloPlanilha;
  if (rotuloPlanilha.length > fallback.length && /\b3\.8\.\d/i.test(rotuloPlanilha)) {
    return rotuloPlanilha;
  }
  return fallback;
}
