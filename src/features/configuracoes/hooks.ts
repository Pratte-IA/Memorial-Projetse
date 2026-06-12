import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchOrganizationMembers,
  fetchOrganizationSettings,
  saveOrganizationSettings,
  updateMemberRole,
} from "./api";
import type { SaveSettingsInput, UpdateMemberRoleInput } from "./types";

export function settingsQueryKey(organizationId: number) {
  return ["org-settings", organizationId] as const;
}

export function membersQueryKey(organizationId: number) {
  return ["org-members", organizationId] as const;
}

export function useOrganizationSettings(organizationId: number | null) {
  return useQuery({
    queryKey: organizationId ? settingsQueryKey(organizationId) : ["org-settings", "disabled"],
    queryFn: () => fetchOrganizationSettings(organizationId!),
    enabled: organizationId !== null && organizationId > 0,
  });
}

export function useOrganizationMembers(organizationId: number | null) {
  return useQuery({
    queryKey: organizationId ? membersQueryKey(organizationId) : ["org-members", "disabled"],
    queryFn: () => fetchOrganizationMembers(organizationId!),
    enabled: organizationId !== null && organizationId > 0,
  });
}

export function useSaveOrganizationSettings(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveSettingsInput) => saveOrganizationSettings(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: settingsQueryKey(organizationId) });
      }
    },
  });
}

export function useUpdateMemberRole(organizationId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMemberRoleInput) => updateMemberRole(input),
    onSuccess: () => {
      if (organizationId) {
        void queryClient.invalidateQueries({ queryKey: membersQueryKey(organizationId) });
      }
    },
  });
}
