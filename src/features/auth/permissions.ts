import type { OrgRole } from "./types";

const MANAGE_ORG_ROLES: OrgRole[] = ["admin", "gestora"];
const EDIT_TECHNICAL_ROLES: OrgRole[] = ["admin", "gestora", "responsavel_tecnica"];
const REVIEW_ROLES: OrgRole[] = ["admin", "gestora", "responsavel_tecnica", "revisora"];

function hasRole(role: OrgRole | null | undefined, allowed: OrgRole[]) {
  return role != null && allowed.includes(role);
}

export function canManageOrg(role: OrgRole | null | undefined) {
  return hasRole(role, MANAGE_ORG_ROLES);
}

export function canEditTechnical(role: OrgRole | null | undefined) {
  return hasRole(role, EDIT_TECHNICAL_ROLES);
}

export function canReview(role: OrgRole | null | undefined) {
  return hasRole(role, REVIEW_ROLES);
}

export function canAccessSettings(role: OrgRole | null | undefined) {
  return canManageOrg(role);
}

export function canManageMembers(role: OrgRole | null | undefined) {
  return role === "admin";
}
