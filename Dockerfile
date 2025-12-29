# ============================================
# FACTORY V2 - Production Dockerfile
# ============================================
# Multi-stage build optimisé pour Next.js standalone
# Image finale: ~150MB (vs ~1GB sans standalone)
#
# Build: docker build -t factory-v2:latest .
# Run:   docker run -p 3000:3000 --env-file .env factory-v2:latest

# ============================================
# STAGE 1: Base Alpine
# ============================================
FROM node:20-alpine AS base

# ============================================
# STAGE 2: Dependencies
# ============================================
FROM base AS deps

# Requis pour certains packages natifs
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# ============================================
# STAGE 3: Builder
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
# Note: Build-time ENV vars (NEXT_PUBLIC_*) can be passed here
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

RUN npm run build

# ============================================
# STAGE 4: Production Runner
# ============================================
FROM base AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Setup .next directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Runtime configuration
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
