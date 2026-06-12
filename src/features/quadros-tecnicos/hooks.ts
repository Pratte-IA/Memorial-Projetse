import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchLatestQuadroTecnico,
  processarQuadroTecnico,
  removeQuadroTecnico,
  uploadQuadroTecnico,
} from "./api";
import type { UploadQuadroInput } from "./types";

export function quadroTecnicoQueryKey(empreendimentoId: number) {
  return ["quadros-tecnicos", "latest", empreendimentoId] as const;
}

export function useLatestQuadroTecnico(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? quadroTecnicoQueryKey(empreendimentoId)
      : ["quadros-tecnicos", "disabled"],
    queryFn: () => fetchLatestQuadroTecnico(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useUploadQuadroTecnico(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadQuadroInput) => uploadQuadroTecnico(input),
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: quadroTecnicoQueryKey(empreendimentoId) });
      }
    },
  });
}

export function useProcessarQuadroTecnico(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processarQuadroTecnico,
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: quadroTecnicoQueryKey(empreendimentoId) });
        void queryClient.invalidateQueries({ queryKey: ["dados-extraidos", empreendimentoId] });
        void queryClient.invalidateQueries({
          queryKey: ["empreendimentos", "detail", empreendimentoId],
        });
      }
    },
  });
}

export function useRemoveQuadroTecnico(empreendimentoId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quadro,
      organizationId,
    }: {
      quadro: Parameters<typeof removeQuadroTecnico>[0];
      organizationId: number;
    }) => removeQuadroTecnico(quadro, organizationId),
    onSuccess: () => {
      if (empreendimentoId) {
        void queryClient.invalidateQueries({ queryKey: quadroTecnicoQueryKey(empreendimentoId) });
      }
    },
  });
}
