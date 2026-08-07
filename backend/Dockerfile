FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps-build

# Copy only workspace manifests first for better layer caching.
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json

# Install only the workspaces required by the backend build.
RUN npm ci --workspace @ticket-system/backend --workspace @ticket-system/shared --include-workspace-root=false


FROM deps-build AS build

COPY backend backend
COPY shared shared

# Build shared first, then generate Prisma client and compile backend.
RUN npm run build -w @ticket-system/shared \
    && npm exec -w @ticket-system/backend prisma generate \
    && npm run build -w @ticket-system/backend


FROM base AS deps-prod

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json

# Install production dependencies only for backend + shared workspaces.
RUN npm ci --omit=dev \
    --workspace @ticket-system/backend \
    --workspace @ticket-system/shared \
    --include-workspace-root=false

    
FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

# Keep workspace metadata so npm exec -w works at runtime.
COPY --from=deps-prod /app/package.json /app/package-lock.json ./
COPY --from=deps-prod /app/backend/package.json ./backend/package.json
COPY --from=deps-prod /app/shared/package.json ./shared/package.json
COPY --from=deps-prod /app/node_modules ./node_modules

# Runtime artifacts.
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply pending migrations before starting the Hono server.
CMD ["sh", "-c", "npm exec -w @ticket-system/backend prisma migrate deploy && exec node backend/dist/src/index.js"]