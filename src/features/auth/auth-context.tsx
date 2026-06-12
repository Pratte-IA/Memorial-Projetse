import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { logError } from "@/lib/log-error";
import { supabase } from "@/lib/supabase/client";

import { fetchUserContext, loadAuthUserContext } from "./api";
import type { OrganizationMembership, UserProfile } from "./types";

interface AuthContextValue {
  isLoading: boolean;
  isRefreshing: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  membership: OrganizationMembership | null;
  role: OrganizationMembership["role"] | null;
  organization: OrganizationMembership["organizations"] | null;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);

  const applyContext = useCallback(
    (next: {
      session: Session | null;
      user: User | null;
      profile: UserProfile | null;
      membership: OrganizationMembership | null;
    }) => {
      setSession(next.session);
      setUser(next.user);
      setProfile(next.profile);
      setMembership(next.membership);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const context = await loadAuthUserContext();
      applyContext(context);
    } finally {
      setIsRefreshing(false);
    }
  }, [applyContext]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const context = await loadAuthUserContext();
        if (mounted) applyContext(context);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      if (!nextSession?.user) {
        applyContext({
          session: null,
          user: null,
          profile: null,
          membership: null,
        });
        return;
      }

      try {
        const { profile: nextProfile, membership: nextMembership } = await fetchUserContext(
          nextSession.user.id,
        );
        applyContext({
          session: nextSession,
          user: nextSession.user,
          profile: nextProfile,
          membership: nextMembership,
        });
      } catch (error) {
        logError(error, { scope: "auth-context" });
        applyContext({
          session: nextSession,
          user: nextSession.user,
          profile: null,
          membership: null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyContext]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isRefreshing,
      session,
      user,
      profile,
      membership,
      role: membership?.role ?? null,
      organization: membership?.organizations ?? null,
      refresh,
    }),
    [isLoading, isRefreshing, session, user, profile, membership, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }
  return context;
}
