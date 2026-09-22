# Node.js Backend Security — Best Practices 2025

## Summary
Node.js security in 2025 focuses on input validation, secure auth, dependency auditing, secret management, and rate limiting.

## Critical Security Practices

### 1. Input Validation (P0)
- **ALWAYS** validate ALL input: query params, body, headers, URL params
- Use **Zod**, Joi, or Yup for schema validation
- Use **parameterized queries** or ORM (never concatenate SQL)
- Sanitize to prevent XSS, SQLi, Command Injection

### 2. Authentication (P0)
- Hash passwords with **Bcrypt** (auto-salts, adjustable work factor)
- JWT: short-lived access tokens (15min-1hr), long-lived refresh tokens
- Store JWT secret in env vars, NEVER hardcode
- Validate signature + expiration on EVERY request
- Implement RBAC (Role-Based Access Control)
- Add MFA for sensitive operations

### 3. Dependency Security (P0)
- Run `npm audit` regularly
- Pin versions with `package-lock.json`
- Vet new packages (popularity, maintenance, issues)
- Watch for CVE-2025-55130 (file system permission bypass)

### 4. Secrets Management (P0)
- **NEVER** hardcode secrets or commit to git
- Use env variables or secret managers (Vault, AWS Secrets Manager)
- Implement automated key rotation

### 5. Rate Limiting (P1)
- Use `express-rate-limit` on ALL endpoints
- Account lockout for login/password-reset
- DDoS protection via reverse proxy

### 6. HTTPS & Headers (P1)
- Enforce HTTPS in production
- Use **Helmet.js** for security headers: CSP, HSTS, X-Content-Type-Options
- Set X-XSS-Protection

### 7. Error Handling (P1)
- Global error handlers for unhandled exceptions
- **NEVER** leak stack traces in production
- Use Winston/Pino for structured logging
- Log: failed logins, auth failures, validation errors

### 8. Async Best Practices (P2)
- Use `async/await` over callbacks
- **Never block the event loop** — use worker threads for CPU tasks
- Avoid `eval()` with untrusted input
- Set request size limits

## Quick Checklist
- [ ] Input validation with Zod/Joi on all endpoints
- [ ] Bcrypt for password hashing
- [ ] JWT with short expiry + refresh tokens
- [ ] npm audit clean
- [ ] Secrets in env vars, not code
- [ ] Rate limiting active
- [ ] Helmet.js configured
- [ ] No console.log of sensitive data
- [ ] Error handler doesn't leak internals

## Date Researched: 2026-03-17
## Sources: nodejs.org, owasp.org, dev.to, medium.com
