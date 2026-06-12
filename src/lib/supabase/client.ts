import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";

import type { Database } from "./types";

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "projetse",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
