import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateOrganizationUser,
  createOrganizationUser,
  deactivateOrganizationUser,
  deleteOrganizationUser,
  fetchOrganizationMembers,
  fetchOrganizationSettings,
  saveOrganizationSettings,
  updateMemberRole,
  updateMemberStatus,
  updateOrganizationUserPassword,
  updateOrganizationUserProfile,
} from "./api";
import type {
  CreateUserInput,
  SaveSettingsInput,
  UpdateMemberRoleInput,
  UpdateMemberStatusInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
  UserActionInput,
} from "./types";

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

function useInvalidateMembers(organizationId: number | null) {
  const queryClient = useQueryClient();

  return () => {
    if (organizationId) {
      void queryClient.invalidateQueries({ queryKey: membersQueryKey(organizationId) });
    }
  };
}

export function useUpdateMemberRole(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UpdateMemberRoleInput) => updateMemberRole(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMemberStatus(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UpdateMemberStatusInput) => updateMemberStatus(input),
    onSuccess: invalidate,
  });
}

export function useCreateOrganizationUser(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: CreateUserInput) => createOrganizationUser(input),
    onSuccess: invalidate,
  });
}

export function useUpdateOrganizationUserProfile(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateOrganizationUserProfile(input),
    onSuccess: invalidate,
  });
}

export function useUpdateOrganizationUserPassword(organizationId: number | null) {
  return useMutation({
    mutationFn: (input: UpdateUserPasswordInput) => updateOrganizationUserPassword(input),
  });
}

export function useDeactivateOrganizationUser(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UserActionInput) => deactivateOrganizationUser(input),
    onSuccess: invalidate,
  });
}

export function useActivateOrganizationUser(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UserActionInput) => activateOrganizationUser(input),
    onSuccess: invalidate,
  });
}

export function useDeleteOrganizationUser(organizationId: number | null) {
  const invalidate = useInvalidateMembers(organizationId);

  return useMutation({
    mutationFn: (input: UserActionInput) => deleteOrganizationUser(input),
    onSuccess: invalidate,
  });
}
