# Stage 1: Dependencies
FROM node:20.10-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Set Chrome environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files only
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (only .npmrc/.pnpm-workspace.yaml if needed)
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20.10-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy everything except node_modules
COPY . ./

# Bring in deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build application
RUN pnpm run build

# Stage 3: Runtime Image
FROM node:20.10-alpine AS runner

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules  
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]