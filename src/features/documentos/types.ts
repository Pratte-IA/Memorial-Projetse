export interface ModeloRecord {
  id: number;
  organizationId: number;
  nome: string;
  tipo: string;
  status: string;
  statusLabel: string;
  atualizadoEm: string;
}

export interface ClausulaRecord {
  id: number;
  organizationId: number;
  modeloId: number | null;
  titulo: string;
  categoria: string;
  resumo: string;
  template: string;
  variaveis: string[];
  status: string;
  statusLabel: string;
  ordem: number;
  atualizadoEm: string;
}
