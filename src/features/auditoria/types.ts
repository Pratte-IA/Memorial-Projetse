export interface AuditEventRecord {
  id: number;
  eventType: string;
  eventTypeLabel: string;
  description: string;
  createdAt: string;
  userName: string;
  empreendimentoId: number | null;
  empreendimentoNome: string | null;
}
