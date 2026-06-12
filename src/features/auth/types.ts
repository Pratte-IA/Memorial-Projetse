import type { Session, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export type OrgRole = Database["projetse"]["Tables"]["organization_members"]["Row"]["role"];

export type UserProfile = Database["projetse"]["Tables"]["profiles"]["Row"];

export type Organization = Database["projetse"]["Tables"]["organizations"]["Row"];

export interface OrganizationMembership {
  id: number;
  role: OrgRole;
  status: string;
  organization_id: number;
  organizations: Organization | null;
}

export interface AuthUserContext {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  membership: OrganizationMembership | null;
}
