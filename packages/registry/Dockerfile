# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace package.json files
COPY package.json package-lock.json* ./
COPY packages/engine/package.json ./packages/engine/
COPY packages/schema/package.json ./packages/schema/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/tools/package.json ./packages/tools/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/registry/package.json ./packages/registry/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy the rest of the source
COPY . .

# Build all packages
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy built files and dependencies from builder
COPY --from=builder /app ./

EXPOSE 3002

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Start the registry inspector
CMD ["npm", "run", "start:inspector", "-w", "@alloy/registry"]
