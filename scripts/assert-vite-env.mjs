import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

function loadEnvFile(relativePath) {
  const path = resolve(process.cwd(), relativePath);
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error(
    [
      "[build] Variáveis obrigatórias ausentes:",
      ...missing.map((key) => `  - ${key}`),
      "",
      "Netlify: Site configuration → Environment variables → Add a variable",
      "  (escopo: All scopes ou Build + Functions)",
      "",
      "Local: copie .env.example para .env.local e preencha os valores reais.",
    ].join("\n"),
  );
  process.exit(1);
}
