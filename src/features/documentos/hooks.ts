import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createModeloTimbrado,
  deleteModelo,
  duplicateClausula,
  fetchClausulas,
  fetchModelos,
  updateClausula,
} from "./api";
import type {
  CreateModeloTimbradoInput,
  DuplicateClausulaInput,
  ModeloRecord,
  UpdateClausulaInput,
} from "./types";

export function modelosQueryKey(organizationId: number) {
  return ["modelos", organizationId] as const;
}

export function clausulasQueryKey(organizationId: number) {
  return ["clausulas", organizationId] as const;
}

export function useModelos(organizationId: number | null) {
  return useQuery({
    queryKey: organizationId ? modelosQueryKey(organizationId) : ["modelos", "disabled"],
    queryFn: () => fetchModelos(organizationId!),
    enabled: organizationId !== null && organizationId > 0,
  });
}

export function useCreateModeloTimbrado(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateModeloTimbradoInput) => createModeloTimbrado(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: modelosQueryKey(organizationId) });
      }
    },
  });
}

export function useDeleteModelo(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelo: ModeloRecord) => deleteModelo(modelo),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: modelosQueryKey(organizationId) });
      }
    },
  });
}

export function useClausulas(organizationId: number | null) {
  return useQuery({
    queryKey: organizationId ? clausulasQueryKey(organizationId) : ["clausulas", "disabled"],
    queryFn: () => fetchClausulas(organizationId!),
    enabled: organizationId !== null && organizationId > 0,
  });
}

export function useUpdateClausula(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClausulaInput) => updateClausula(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: clausulasQueryKey(organizationId) });
      }
    },
  });
}

export function useDuplicateClausula(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DuplicateClausulaInput) => duplicateClausula(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: clausulasQueryKey(organizationId) });
      }
    },
  });
}
