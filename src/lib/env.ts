const PLACEHOLDER_URL = "seu-projeto.supabase.co";
const PLACEHOLDER_KEY = "sua-chave-anon-publica";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function readViteEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string | undefined {
  const fromImportMeta = import.meta.env[name]?.trim();
  if (fromImportMeta) {
    return fromImportMeta;
  }

  // Netlify Functions / Node SSR: site env vars are available at runtime via process.env.
  if (typeof process !== "undefined") {
    const fromProcess = process.env[name]?.trim();
    if (fromProcess) {
      return fromProcess;
    }

    const legacyName =
      name === "VITE_SUPABASE_URL" ? "SUPABASE_URL" : "SUPABASE_ANON_KEY";
    const fromLegacy = process.env[legacyName]?.trim();
    if (fromLegacy) {
      return fromLegacy;
    }
  }

  return undefined;
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = readViteEnv("VITE_SUPABASE_URL");
  const anonKey = readViteEnv("VITE_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error(
      "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. " +
        "Configure-as em .env.local (dev) ou no painel do Netlify (Site configuration → Environment variables).",
    );
  }

  if (url.includes(PLACEHOLDER_URL) || anonKey === PLACEHOLDER_KEY) {
    throw new Error(
      "Configure as variáveis Supabase com os valores reais do projeto antes de iniciar o app.",
    );
  }

  return { url, anonKey };
}
