FROM node:24-bookworm-slim AS base

WORKDIR /app

# Install system dependencies required by Prisma.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

################################################################################
# Build
################################################################################

FROM base AS build

# Copy workspace manifests first to maximize Docker layer caching.
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json

# Install all workspace dependencies, including development dependencies.
RUN npm ci

# Copy application source code.
COPY backend backend
COPY shared shared

# Build the shared package first, then generate the Prisma client and build
# the backend application.
RUN npm run build -w @ticket-system/shared \
 && npm exec -w @ticket-system/backend prisma generate \
 && npm run build -w @ticket-system/backend

# Remove development dependencies to prepare the runtime image.
RUN npm prune --omit=dev

################################################################################
# Runtime
################################################################################

FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy workspace metadata.
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/shared/package.json ./shared/package.json

# Copy production dependencies.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Copy compiled application.
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/shared/dist ./shared/dist

# Copy Prisma schema, migrations and generated client.
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=build /app/backend/generated ./backend/generated

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
CMD node -e "fetch('http://127.0.0.1:3000/health').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply pending database migrations before starting the application.
CMD ["sh", "-c", "npm exec -w @ticket-system/backend prisma migrate deploy && exec node backend/dist/src/index.js"]