import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  confirmarBlocoDados,
  ensureDadosExtraidosSeeded,
  fetchDadosExtraidos,
  updateDadoExtraido,
} from "./api";

export function dadosExtraidosQueryKey(empreendimentoId: number) {
  return ["dados-extraidos", empreendimentoId] as const;
}

export function useDadosExtraidos(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? dadosExtraidosQueryKey(empreendimentoId)
      : ["dados-extraidos", "disabled"],
    queryFn: async () => {
      await ensureDadosExtraidosSeeded(empreendimentoId!);
      return fetchDadosExtraidos(empreendimentoId!);
    },
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useUpdateDadoExtraido(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDadoExtraido,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: dadosExtraidosQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useConfirmarBlocoDados(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmarBlocoDados,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: dadosExtraidosQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({
          queryKey: ["empreendimentos", "detail", empreendimentoId],
        });
      }
    },
  });
}
