import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEmpreendimentoFromWizard,
  fetchEmpreendimentoDetail,
  fetchEmpreendimentosList,
  updateEmpreendimentoBasico,
} from "./api";
import type { CreateEmpreendimentoInput, UpdateEmpreendimentoInput } from "./types";

export const empreendimentosQueryKey = ["empreendimentos", "list"] as const;

export function useEmpreendimentosList() {
  return useQuery({
    queryKey: empreendimentosQueryKey,
    queryFn: fetchEmpreendimentosList,
  });
}

export function useEmpreendimentoDetail(id: number) {
  return useQuery({
    queryKey: ["empreendimentos", "detail", id],
    queryFn: () => fetchEmpreendimentoDetail(id),
    enabled: id > 0,
  });
}

export function useCreateEmpreendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmpreendimentoInput) => createEmpreendimentoFromWizard(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "indicators"] });
    },
  });
}

export function useUpdateEmpreendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEmpreendimentoInput) => updateEmpreendimentoBasico(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
    },
  });
}
