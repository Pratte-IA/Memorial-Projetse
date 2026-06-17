import type { MemberStatus } from "./types";

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Ativo",
  invited: "Convidado",
  disabled: "Inativo",
};
