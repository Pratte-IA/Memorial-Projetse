import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchMemorialContext } from "./context";
import {
  ensureMemorial,
  fetchMemorial,
  generateMemorialCompleto,
  regenerateSecao,
  saveSecaoConteudo,
  updateSecaoStatus,
} from "./api";
import type { SecaoDbStatus } from "./types";

export function memorialQueryKey(empreendimentoId: number) {
  return ["memorial", empreendimentoId] as const;
}

export function memorialContextQueryKey(empreendimentoId: number) {
  return ["memorial-context", empreendimentoId] as const;
}

export function useMemorial(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId ? memorialQueryKey(empreendimentoId) : ["memorial", "disabled"],
    queryFn: () => fetchMemorial(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useMemorialContext(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? memorialContextQueryKey(empreendimentoId)
      : ["memorial-context", "disabled"],
    queryFn: () => fetchMemorialContext(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useEnsureMemorial(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ensureMemorial,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useRegenerateSecao(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateSecao,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useSaveSecao(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSecaoConteudo,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useUpdateSecaoStatus(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSecaoStatus,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useGenerateMemorialCompleto(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateMemorialCompleto,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: memorialQueryKey(empreendimentoId) });
      }
    },
  });
}

export type { SecaoDbStatus };
