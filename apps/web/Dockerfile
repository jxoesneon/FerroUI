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

# Build all packages and the web app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built static files to Nginx public directory
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
