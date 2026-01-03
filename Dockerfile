# ============================================
# FACTORY V2 - Production Dockerfile (CORRIGÉ)
# ============================================

# STAGE 1: Base Alpine
FROM node:20-alpine AS base

# STAGE 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# STAGE 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# ### CORRECTION 1 : Réception des arguments du Build ###
# Sans ces lignes, les valeurs passées dans docker-compose sont ignorées !
ARG NEXT_PUBLIC_SITE_URL
ARG BASEROW_API_URL
ARG BASEROW_API_TOKEN
ARG BASEROW_FACTORY_GLOBAL_ID
ARG BASEROW_FACTORY_SECTIONS_ID

# On les transforme en variables d'environnement pour la commande 'npm run build'
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV BASEROW_API_URL=${BASEROW_API_URL}
ENV BASEROW_API_TOKEN=${BASEROW_API_TOKEN}
ENV BASEROW_FACTORY_GLOBAL_ID=${BASEROW_FACTORY_GLOBAL_ID}
ENV BASEROW_FACTORY_SECTIONS_ID=${BASEROW_FACTORY_SECTIONS_ID}

RUN npm run build

# STAGE 4: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# ### CORRECTION 2 : Permissions pour les uploads ###
# On s'assure que le dossier public existe et appartient à l'utilisateur nextjs
COPY --from=builder /app/public ./public
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public

# Setup .next directory
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
