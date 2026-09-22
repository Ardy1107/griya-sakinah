# OWASP Top 10 — 2025 Edition

## Summary
OWASP Top 10 2025 released Nov 2025. New categories: Supply Chain Failures and Mishandling Exceptional Conditions. SSRF merged into Broken Access Control.

## The List

| # | Risk | Key Points |
|---|------|-----------|
| A01 | **Broken Access Control** | Now includes SSRF. Enforce least privilege, RBAC. |
| A02 | **Security Misconfiguration** | Moved UP. Disable defaults, remove unused features. |
| A03 | **Software Supply Chain Failures** | **NEW.** Dependencies, build systems, distribution. |
| A04 | **Cryptographic Failures** | Weak encryption, exposed data. Use modern TLS. |
| A05 | **Injection** | SQLi, XSS, Command. Parameterized queries mandatory. |
| A06 | **Insecure Design** | Architecture flaws. Threat modeling required. |
| A07 | **Authentication Failures** | Weak auth, session issues. MFA, strong passwords. |
| A08 | **Software/Data Integrity Failures** | Unverified updates, CI/CD risks. Sign packages. |
| A09 | **Logging & Alerting Failures** | Insufficient monitoring. Centralized logging needed. |
| A10 | **Mishandling Exceptional Conditions** | **NEW.** Improper error handling exposes vulnerabilities. |

## Changes from 2021
- SSRF → merged into A01 (Broken Access Control)
- Vulnerable Components → expanded to A03 (Supply Chain)
- Security Logging → renamed A09 (Logging & Alerting)
- **NEW** A10: Mishandling Exceptional Conditions

## Prevention Checklist

### Access Control
- [ ] Deny by default, allow by exception
- [ ] Enforce RBAC at server side
- [ ] Rate limit API access
- [ ] Validate SSRF: whitelist outbound URLs

### Supply Chain (NEW for 2025)
- [ ] `npm audit` on every build
- [ ] Pin dependency versions
- [ ] Verify package signatures
- [ ] Monitor for typosquatting attacks
- [ ] Secure CI/CD pipeline

### Error Handling (NEW for 2025)
- [ ] Never expose stack traces to users
- [ ] Handle ALL exception paths
- [ ] Log errors comprehensively
- [ ] Implement circuit breakers for external services

## Date Researched: 2026-03-17
## Sources: owasp.org, fastly.com, securelayer7.net
