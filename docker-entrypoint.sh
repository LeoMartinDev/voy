#!/bin/sh
set -e

# If running as root, fix permissions and drop privileges
if [ "$(id -u)" = "0" ]; then
    echo "[INFO] Fixing permissions for /data..."
    chown -R nodejs:nodejs /data
    
    echo "[INFO] Running database migrations..."
    su-exec nodejs:nodejs bun run db:migrate

    echo "[INFO] Starting server..."
    exec su-exec nodejs:nodejs "$@"
else
    # If already running as non-root (e.g. dev mode), just run normally
    echo "[INFO] Running database migrations..."
    bun run db:migrate

    echo "[INFO] Starting server..."
    exec "$@"
fi
