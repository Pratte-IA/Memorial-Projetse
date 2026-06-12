import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  exportDocument,
  fetchExportacoes,
  fetchPendenciasBloqueantes,
  getExportDownloadUrl,
} from "./api";
import type { ExportDocumentInput } from "./types";

export function exportacoesQueryKey(empreendimentoId: number) {
  return ["exportacoes", empreendimentoId] as const;
}

export function pendenciasBloqueantesQueryKey(empreendimentoId: number) {
  return ["pendencias-bloqueantes", empreendimentoId] as const;
}

export function useExportacoes(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? exportacoesQueryKey(empreendimentoId)
      : ["exportacoes", "disabled"],
    queryFn: () => fetchExportacoes(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function usePendenciasBloqueantes(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? pendenciasBloqueantesQueryKey(empreendimentoId)
      : ["pendencias-bloqueantes", "disabled"],
    queryFn: () => fetchPendenciasBloqueantes(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useExportDocument(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExportDocumentInput) => exportDocument(input),
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: exportacoesQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useDownloadExportacao() {
  return useMutation({
    mutationFn: getExportDownloadUrl,
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}
