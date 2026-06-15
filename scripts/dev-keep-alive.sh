#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=3000

while true; do
  echo "[dev] Iniciando Vite na porta ${PORT}..."
  if pnpm exec vite dev; then
    echo "[dev] Encerrado normalmente."
    exit 0
  fi

  code=$?
  echo "[dev] Servidor parou (código ${code}). Reiniciando em 2s..."
  sleep 2
done
