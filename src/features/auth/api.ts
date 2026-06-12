import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

import type { AuthUserContext, OrganizationMembership, UserProfile } from "./types";

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function fetchUserContext(userId: string): Promise<{
  profile: UserProfile | null;
  membership: OrganizationMembership | null;
}> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, avatar_url, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return { profile: null, membership: null };

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select(
      `
        id,
        role,
        status,
        organization_id,
        organizations (
          id,
          name,
          slug,
          created_at,
          updated_at
        )
      `,
    )
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;

  return {
    profile,
    membership: membership as OrganizationMembership | null,
  };
}

export async function loadAuthUserContext(): Promise<AuthUserContext> {
  const session = await getSession();

  if (!session?.user) {
    return {
      session: null,
      user: null,
      profile: null,
      membership: null,
    };
  }

  const { profile, membership } = await fetchUserContext(session.user.id);

  return {
    session,
    user: session.user,
    profile,
    membership,
  };
}
