# =========================
# Stage 1 — Base deps
# =========================
FROM oven/bun:1-alpine AS base

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./
RUN bun install --frozen-lockfile

# =========================
# Stage 2 — Development
# =========================
FROM oven/bun:1-alpine AS dev

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./
RUN bun install
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["bun", "run", "dev"]

# =========================
# Stage 3 — Builder
# =========================
FROM base AS builder

WORKDIR /app
COPY . .

RUN bun run db:generate
RUN bun run build

# =========================
# Stage 4 — Production
# =========================
FROM oven/bun:1-alpine AS runner

WORKDIR /app
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nodejs && \
  mkdir -p /data && \
  chown -R nodejs:nodejs /data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/server/infrastructure/persistence/drizzle/migrations ./src/server/infrastructure/persistence/drizzle/migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chown -R nodejs:nodejs /app && \
  chmod +x /docker-entrypoint.sh

VOLUME ["/data"]

USER nodejs

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:$PORT/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["bun", "run", "server.ts"]
