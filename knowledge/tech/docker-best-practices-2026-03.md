# Docker — Best Practices 2025

## Summary
Containers for consistent dev/prod environments. Key: multi-stage builds, minimal base images, non-root user, BuildKit cache, .dockerignore.

## Optimized Dockerfile (Node.js/React)
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Stage 2: Production (minimal image)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost/ || exit 1
USER nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Key Rules

### Image Size
```dockerfile
# ✅ Alpine base (5MB vs 900MB)
FROM node:22-alpine
# ✅ Multi-stage build (only copy artifacts)
COPY --from=builder /app/dist ./dist
# ✅ Combine RUN commands
RUN apk add --no-cache curl && rm -rf /var/cache/apk/*
# ✅ .dockerignore
# node_modules .git .env *.md
```

### Security
```dockerfile
# ✅ Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
# ✅ Read-only filesystem
# docker run --read-only myapp
# ✅ No hardcoded secrets
# Use --secret flag or env vars
# ❌ NEVER: ENV API_KEY=sk-12345
```

### Build Optimization
```dockerfile
# ✅ Layer caching — copy package.json FIRST
COPY package*.json ./
RUN npm ci
COPY . .  # This changes often, layers above are cached

# ✅ Pin versions
FROM node:22.3.0-alpine  # not :latest
```

## Docker Compose
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
```

## Cheat Sheet
```bash
docker build -t myapp .                   # Build
docker run -d -p 3000:3000 myapp          # Run
docker compose up -d                      # Compose
docker system prune -af                   # Clean all
docker scout cves myapp                   # Scan vulnerabilities
```

## Date: 2026-03-17 | Sources: docs.docker.com, dev.to
