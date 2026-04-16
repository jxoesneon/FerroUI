# Build stage
FROM node:25-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy root configurations
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./

# Copy all package.json files for workspace-aware install
COPY packages/engine/package.json ./packages/engine/
COPY packages/schema/package.json ./packages/schema/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/tools/package.json ./packages/tools/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/registry/package.json ./packages/registry/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build all packages
RUN pnpm -r run build --filter=@ferroui/registry...

# Runtime stage
FROM node:25-alpine AS runner

WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy built files and production dependencies from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/registry/package.json ./packages/registry/
COPY --from=builder /app/packages/registry/dist ./packages/registry/dist
COPY --from=builder /app/packages/registry/node_modules ./packages/registry/node_modules
COPY --from=builder /app/node_modules ./node_modules

# Also copy dependent packages if not bundled
COPY --from=builder /app/packages/schema/dist ./packages/schema/dist
COPY --from=builder /app/packages/telemetry/dist ./packages/telemetry/dist

EXPOSE 3002

ENV PORT=3002

# Start the registry inspector
CMD ["node", "packages/registry/dist/index.js"]
