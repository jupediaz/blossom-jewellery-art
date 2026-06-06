# Build context = monorepo ROOT (see docker-compose.prod.yml: context: ../..)
FROM node:22-alpine AS deps
WORKDIR /app
# Root manifest + lockfile + the app manifest drive the workspace install
COPY package.json package-lock.json ./
COPY apps/blossom/package.json ./apps/blossom/package.json
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
# Build-time placeholders for the Payload config (real values injected at runtime
# via the compose env_file). The config fails closed if these are unset.
ENV PAYLOAD_SECRET=placeholder-build-secret
ENV R2_BUCKET_NAME=placeholder
ENV R2_ACCOUNT_ID=placeholder
ENV R2_ACCESS_KEY_ID=placeholder
ENV R2_SECRET_ACCESS_KEY=placeholder
WORKDIR /app/apps/blossom
RUN npx prisma generate
RUN npm run build

# One-shot migration image: reuses the builder (has prisma CLI, schema,
# migrations and prisma.config.ts). Run before starting the app on deploy.
FROM builder AS migrator
WORKDIR /app/apps/blossom
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next standalone in a monorepo mirrors the workspace tree under standalone/.
# server.js lives at apps/blossom/server.js; hoisted node_modules at the root.
COPY --from=builder /app/apps/blossom/public ./apps/blossom/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/blossom/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/blossom/.next/static ./apps/blossom/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/blossom/server.js"]
