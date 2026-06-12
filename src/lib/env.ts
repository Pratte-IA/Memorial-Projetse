const PLACEHOLDER_URL = "seu-projeto.supabase.co";
const PLACEHOLDER_KEY = "sua-chave-anon-publica";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Copie .env.example para .env.local.",
    );
  }

  if (url.includes(PLACEHOLDER_URL) || anonKey === PLACEHOLDER_KEY) {
    throw new Error(
      "Configure as variáveis Supabase com os valores reais do projeto antes de iniciar o app.",
    );
  }

  return { url, anonKey };
}
