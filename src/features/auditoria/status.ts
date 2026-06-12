const EVENT_LABELS: Record<string, string> = {
  criacao: "Criação",
  upload: "Upload",
  extracao: "Extração",
  validacao: "Validação",
  edicao: "Edição",
  geracao: "Geração",
  aprovacao: "Aprovação",
  exportacao: "Exportação",
  configuracao: "Configuração",
};

export function getEventTypeLabel(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType;
}
