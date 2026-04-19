#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-localhost}"
PORT="${2:-5432}"
DATABASE="${3:-secretaria_digital}"
USERNAME="${4:-postgres}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_ALL="$SCRIPT_DIR/000_run_all.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql não encontrado no PATH. Instale o PostgreSQL client antes de rodar este script." >&2
  exit 1
fi

if [ ! -f "$RUN_ALL" ]; then
  echo "Arquivo 000_run_all.sql não encontrado em $SCRIPT_DIR" >&2
  exit 1
fi

psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -v ON_ERROR_STOP=1 -f "$RUN_ALL"
