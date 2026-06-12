import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchUnidades, updateUnidade, updateUnidadeStatus, validarUnidadesEmMassa } from "./api";
import type { UnidadeDbStatus, UpdateUnidadeInput } from "./types";

export function unidadesQueryKey(empreendimentoId: number) {
  return ["unidades", empreendimentoId] as const;
}

export function useUnidades(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId ? unidadesQueryKey(empreendimentoId) : ["unidades", "disabled"],
    queryFn: () => fetchUnidades(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useUpdateUnidade(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUnidadeInput) => updateUnidade(input),
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: unidadesQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useUpdateUnidadeStatus(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUnidadeStatus,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: unidadesQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useValidarUnidadesEmMassa(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validarUnidadesEmMassa,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: unidadesQueryKey(empreendimentoId) });
      }
    },
  });
}

export type { UnidadeDbStatus };
