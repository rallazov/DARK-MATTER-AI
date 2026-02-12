# Security

## Baseline Controls

- Helmet + CSP enabled.
- CORS restricted to configured frontend origin.
- IP rate limiting on all API routes, tighter auth limits.
- JWT access + rotating refresh flow with revocation list.
- CSRF double-submit token for cookie-sensitive endpoints.
- Input validation with `express-validator`.
- Field-level encryption for integration secrets via AES-256-GCM.
- Founder-only admin guard plus role checks.

## Zero-Trust Trajectory

- Modules are isolated by domain and can become independently authenticated services.
- All privileged actions are audit logged.
- Integration calls are proxied via vault context, never direct from browser.

## Post-Quantum Readiness

- Crypto agility is preserved via centralized `utils/crypto.js`.
- Migration path: replace AES/JWT signing primitives with PQ-safe alternatives when standards mature and ecosystem support stabilizes.
