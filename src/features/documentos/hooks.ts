import { useQuery } from "@tanstack/react-query";

import { fetchClausulas, fetchModelos } from "./api";

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

export function useClausulas(organizationId: number | null) {
  return useQuery({
    queryKey: organizationId ? clausulasQueryKey(organizationId) : ["clausulas", "disabled"],
    queryFn: () => fetchClausulas(organizationId!),
    enabled: organizationId !== null && organizationId > 0,
  });
}
