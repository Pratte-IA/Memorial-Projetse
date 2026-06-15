import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEmpreendimentoFromNbr,
  createEmpreendimentoFromWizard,
  deleteEmpreendimento,
  fetchEmpreendimentoDetail,
  fetchEmpreendimentosList,
  updateEmpreendimentoBasico,
} from "./api";
import {
  deleteRepresentanteLegal,
  saveRepresentanteLegal,
  updateCadastroImovel,
  updateResponsabilidadeObra,
} from "./persist-cadastro-complementar";
import { fetchProntidaoExportacao } from "./prontidao-exportacao";
import { quadroTecnicoQueryKey } from "@/features/quadros-tecnicos/hooks";
import type {
  CreateEmpreendimentoFromNbrInput,
  CreateEmpreendimentoInput,
  DeleteEmpreendimentoInput,
  UpdateEmpreendimentoInput,
} from "./types";
import type { Representante, ResponsabilidadeObraForm } from "./types/detail-types";
import type { CadastroImovelInput } from "./persist-cadastro-complementar";

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

export function useCreateEmpreendimentoFromNbr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmpreendimentoFromNbrInput) => createEmpreendimentoFromNbr(input),
    onSuccess: (empreendimentoId) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "indicators"] });
      void queryClient.invalidateQueries({
        queryKey: quadroTecnicoQueryKey(empreendimentoId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", empreendimentoId],
      });
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

export function prontidaoExportacaoQueryKey(empreendimentoId: number) {
  return ["prontidao-exportacao", empreendimentoId] as const;
}

export function useProntidaoExportacao(empreendimentoId: number | null) {
  return useQuery({
    queryKey: empreendimentoId
      ? prontidaoExportacaoQueryKey(empreendimentoId)
      : ["prontidao-exportacao", "disabled"],
    queryFn: () => fetchProntidaoExportacao(empreendimentoId!),
    enabled: empreendimentoId !== null && empreendimentoId > 0,
  });
}

export function useDeleteEmpreendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteEmpreendimentoInput) => deleteEmpreendimento(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: empreendimentosQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "indicators"] });
      void queryClient.removeQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
    },
  });
}

export function useUpdateCadastroImovel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CadastroImovelInput) => updateCadastroImovel(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
      void queryClient.invalidateQueries({
        queryKey: prontidaoExportacaoQueryKey(variables.empreendimentoId),
      });
    },
  });
}

export function useUpdateResponsabilidadeObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      organizationId: number;
      empreendimentoId: number;
      responsabilidade: ResponsabilidadeObraForm;
    }) => updateResponsabilidadeObra(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
      void queryClient.invalidateQueries({
        queryKey: prontidaoExportacaoQueryKey(variables.empreendimentoId),
      });
    },
  });
}

export function useSaveRepresentanteLegal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      organizationId: number;
      empreendimentoId: number;
      incorporadoraId: number;
      representante: Representante;
    }) => saveRepresentanteLegal(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
      void queryClient.invalidateQueries({
        queryKey: prontidaoExportacaoQueryKey(variables.empreendimentoId),
      });
    },
  });
}

export function useDeleteRepresentanteLegal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      organizationId: number;
      empreendimentoId: number;
      representanteId: string;
      nome: string;
    }) => deleteRepresentanteLegal(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["empreendimentos", "detail", variables.empreendimentoId],
      });
      void queryClient.invalidateQueries({
        queryKey: prontidaoExportacaoQueryKey(variables.empreendimentoId),
      });
    },
  });
}
