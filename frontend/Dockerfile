FROM node:24-bookworm-slim AS build

WORKDIR /app

# Copy workspace manifests first to maximize Docker layer caching.
COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY frontend/package.json frontend/package.json


# Install dependencies required for the frontend build.
RUN npm ci \
    --workspace @ticket-system/shared \
    --workspace @ticket-system/frontend
    
# Copy application source code.
COPY frontend frontend
COPY shared shared

# Build shared first, then build the frontend.
RUN npm run build -w @ticket-system/shared \
    && npm run build -w @ticket-system/frontend

################################################################################
# Runtime
################################################################################

FROM nginx:1.29-alpine AS runner

# Replace the default Nginx configuration.
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled frontend.
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]