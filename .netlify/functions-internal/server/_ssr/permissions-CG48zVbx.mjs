const MANAGE_ORG_ROLES = ["admin", "gestora"];
function hasRole(role, allowed) {
  return role != null && allowed.includes(role);
}
function canManageOrg(role) {
  return hasRole(role, MANAGE_ORG_ROLES);
}
function canAccessSettings(role) {
  return canManageOrg(role);
}
function canManageMembers(role) {
  return role === "admin";
}
export {
  canManageMembers as a,
  canManageOrg as b,
  canAccessSettings as c
};
