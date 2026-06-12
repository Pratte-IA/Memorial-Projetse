#!/usr/bin/env bash
# Validação pré-lançamento: typecheck, lint e build de produção.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Memorial Projetse — check de release"
echo ""

echo "→ Verificando .env.example..."
if [ ! -f ".env.example" ]; then
  echo "✗ .env.example ausente."
  exit 1
fi

if [ -f ".env.local" ]; then
  if grep -q "seu-projeto.supabase.co" .env.local 2>/dev/null; then
    echo "⚠ .env.local ainda usa URL placeholder."
  else
    echo "✓ .env.local presente"
  fi
else
  echo "⚠ .env.local não encontrado (ok em CI; necessário para dev local)"
fi

echo ""
echo "→ pnpm typecheck"
pnpm typecheck

echo ""
echo "→ pnpm lint"
pnpm lint

echo ""
echo "→ pnpm build"
pnpm build

echo ""
echo "→ wrangler deploy --dry-run"
pnpm exec wrangler deploy --dry-run

echo ""
echo "✓ Release check concluído com sucesso."
