import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as fetchModelos, a as fetchClausulas } from "./api-DHVf6FlI.mjs";
function modelosQueryKey(organizationId) {
  return ["modelos", organizationId];
}
function clausulasQueryKey(organizationId) {
  return ["clausulas", organizationId];
}
function useModelos(organizationId) {
  return useQuery({
    queryKey: organizationId ? modelosQueryKey(organizationId) : ["modelos", "disabled"],
    queryFn: () => fetchModelos(organizationId),
    enabled: organizationId !== null && organizationId > 0
  });
}
function useClausulas(organizationId) {
  return useQuery({
    queryKey: organizationId ? clausulasQueryKey(organizationId) : ["clausulas", "disabled"],
    queryFn: () => fetchClausulas(organizationId),
    enabled: organizationId !== null && organizationId > 0
  });
}
export {
  useClausulas as a,
  useModelos as u
};
