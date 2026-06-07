# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifests primero para aprovechar cache de capas
COPY package*.json ./
RUN npm ci

# Copiar fuente y construir
COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Solo los artefactos necesarios para producción
COPY --from=builder /app/dist ./dist
COPY server.js package*.json ./
RUN npm ci --omit=dev

# Health check básico
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-4000}/health || exit 1

EXPOSE 4000
ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "server.js"]
