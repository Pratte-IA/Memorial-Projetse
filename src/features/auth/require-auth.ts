import { redirect } from "@tanstack/react-router";

import { getSession } from "./api";

export async function requireAuth(redirectPath: string) {
  if (typeof window === "undefined") return;

  const session = await getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { redirect: redirectPath },
    });
  }
}

export async function redirectIfAuthenticated(redirectTo = "/") {
  if (typeof window === "undefined") return;

  const session = await getSession();
  if (session) {
    throw redirect({ to: redirectTo });
  }
}
