#!/bin/sh
set -e

echo "[INFO] Running database migrations..."
bun run db:migrate

echo "[INFO] Starting server..."
exec "$@"
