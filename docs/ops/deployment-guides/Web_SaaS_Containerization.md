# Web SaaS Containerization Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Platform Engineering Team  

---

## 1. Overview

This guide covers containerizing and deploying FerroUI UI as a web SaaS application using Docker and Kubernetes.

---

## 2. Dockerfile

### 2.1 Multi-Stage Build

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# Copy source
COPY . .

# Build
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 ferroui

# Copy built application
COPY --from=builder --chown=ferroui:nodejs /app/apps/web/dist ./dist
COPY --from=builder --chown=ferroui:nodejs /app/apps/web/package.json ./
COPY --from=builder --chown=ferroui:nodejs /app/node_modules ./node_modules

USER ferroui

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/server.js"]
```

### 2.2 Build Image

```bash
# Build
docker build -t ferroui-ui:latest .

# Tag
docker tag ferroui-ui:latest registry.example.com/ferroui-ui:v1.0.0

# Push
docker push registry.example.com/ferroui-ui:v1.0.0
```

---

## 3. Kubernetes Deployment

### 3.1 Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ferroui-ui
  labels:
    app: ferroui-ui
```

### 3.2 ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ferroui-ui-config
  namespace: ferroui-ui
data:
  FERROUI_PROMPT_VERSION: "1.0"
  FERROUI_DEFAULT_PROVIDER: "openai"
  FERROUI_LOG_LEVEL: "info"
  FERROUI_CACHE_ENABLED: "true"
  FERROUI_TELEMETRY_ENABLED: "true"
  REDIS_URL: "redis://redis:6379"
```

### 3.3 Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ferroui-ui-secrets
  namespace: ferroui-ui
type: Opaque
stringData:
  OPENAI_API_KEY: "sk-..."
  ANTHROPIC_API_KEY: "sk-ant-..."
  DATABASE_URL: "postgresql://..."
  SESSION_SECRET: "..."
```

### 3.4 Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ferroui-ui
  namespace: ferroui-ui
  labels:
    app: ferroui-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ferroui-ui
  template:
    metadata:
      labels:
        app: ferroui-ui
    spec:
      containers:
        - name: ferroui-ui
          image: registry.example.com/ferroui-ui:v1.0.0
          ports:
            - containerPort: 3000
              name: http
          envFrom:
            - configMapRef:
                name: ferroui-ui-config
            - secretRef:
                name: ferroui-ui-secrets
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /health/ready
              port: 3000
            failureThreshold: 30
            periodSeconds: 10
```

### 3.5 Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ferroui-ui
  namespace: ferroui-ui
spec:
  selector:
    app: ferroui-ui
  ports:
    - port: 80
      targetPort: 3000
      name: http
  type: ClusterIP
```

### 3.6 Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ferroui-ui
  namespace: ferroui-ui
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
    - hosts:
        - app.ferroui.dev
      secretName: ferroui-ui-tls
  rules:
    - host: app.ferroui.dev
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ferroui-ui
                port:
                  number: 80
```

### 3.7 Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ferroui-ui
  namespace: ferroui-ui
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ferroui-ui
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

---

## 4. Redis for Caching

```yaml
# k8s/redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ferroui-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          resources:
            requests:
              memory: "256Mi"
            limits:
              memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ferroui-ui
spec:
  selector:
    app: redis
  ports:
    - port: 6379
```

---

## 5. Deployment Commands

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verify
kubectl get pods -n ferroui-ui
kubectl get svc -n ferroui-ui
kubectl get ingress -n ferroui-ui
```

---

## 6. Monitoring

### 6.1 Prometheus ServiceMonitor

```yaml
# k8s/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ferroui-ui
  namespace: ferroui-ui
spec:
  selector:
    matchLabels:
      app: ferroui-ui
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

---

## 7. Troubleshooting

| Issue | Command |
|-------|---------|
| Pod not starting | `kubectl logs -n ferroui-ui deployment/ferroui-ui` |
| High memory usage | `kubectl top pod -n ferroui-ui` |
| Slow responses | `kubectl describe hpa -n ferroui-ui` |
| Ingress issues | `kubectl describe ingress -n ferroui-ui` |

---

## 8. Related Documents

- [Edge Workers Provisioning](./Edge_Workers_Provisioning.md)
- [Tauri Desktop Packaging](./Tauri_Desktop_Packaging.md)
- [Observability & Telemetry Dictionary](../Observability_Telemetry_Dictionary.md)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Platform Team | Initial release |
