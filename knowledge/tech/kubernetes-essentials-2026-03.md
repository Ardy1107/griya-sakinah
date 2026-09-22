# Kubernetes — Essentials 2025

## Summary
K8s = container orchestration. Pods→Deployments→Services→Ingress. Key: declarative YAML, resource limits, health probes, RBAC, Network Policies.

## Core Concepts
```
Pod         → Smallest unit (1+ containers)
Deployment  → Manages pod replicas + rolling updates
Service     → Stable endpoint for pods (load balancing)
Ingress     → External HTTP routing to services
ConfigMap   → Non-sensitive config
Secret      → Sensitive data (base64 encoded)
Namespace   → Logical isolation
```

## Deployment Example
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: myapp:1.2.3    # ✅ Pin version, never :latest
        ports:
        - containerPort: 3000
        resources:              # ✅ Always set limits
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:          # ✅ Health checks
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
        securityContext:        # ✅ Security
          runAsNonRoot: true
          readOnlyRootFilesystem: true
```

## Service + Ingress
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-svc
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 3000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
  - hosts: ["app.example.com"]
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-svc
            port:
              number: 80
```

## Key Best Practices
- ✅ GitOps (ArgoCD/Flux) for deployments
- ✅ Resource requests AND limits on all pods
- ✅ Liveness + Readiness probes
- ✅ Non-root containers
- ✅ Network Policies (default deny)
- ✅ RBAC with least privilege
- ✅ Namespaces for environment isolation
- ✅ Pin image versions
- ❌ Never `kubectl apply` manually in prod
- ❌ Never use `:latest` tag

## kubectl Cheat Sheet
```bash
kubectl get pods -n myapp                # List pods
kubectl logs pod-name -f                 # Follow logs
kubectl describe pod pod-name            # Debug
kubectl rollout status deploy/web-app    # Check rollout
kubectl rollout undo deploy/web-app      # Rollback
kubectl top pods                         # Resource usage
```

## Date: 2026-03-17 | Sources: kubernetes.io, kodekloud.com
