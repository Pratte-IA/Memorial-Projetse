#!/usr/bin/env bash
# Sincroniza histórico remoto (projeto Supabase compartilhado) e aplica
# migrations do Memorial-Projetse via CLI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_MIGRATIONS="supabase/migrations-projetse"
WORK_MIGRATIONS="supabase/migrations"

if [ ! -d "$PROJECT_MIGRATIONS" ]; then
  echo "Diretório $PROJECT_MIGRATIONS não encontrado."
  exit 1
fi

mkdir -p "$WORK_MIGRATIONS"

echo "→ Buscando histórico de migrations do remoto..."
supabase migration fetch --linked --yes

echo "→ Mesclando migrations do Memorial-Projetse..."
cp "$PROJECT_MIGRATIONS"/*.sql "$WORK_MIGRATIONS"/

echo "→ Aplicando migrations pendentes no remoto..."
supabase db push --include-all --yes

echo "✓ Migrations aplicadas com sucesso."
