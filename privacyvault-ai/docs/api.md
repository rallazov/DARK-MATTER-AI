# API Guide

Base URL: `http://localhost:8080`

- Swagger UI: `/api/docs` (alias: `/api-docs`)
- Health: `/api/health`

## Main Domains

- Auth: `/api/auth/*`
- Users: `/api/users/me`
- Onboarding: `/api/onboarding/*`
- Vaults: `/api/vaults/*`
- Tasks: `/api/tasks/*`
- Bots: `/api/bots/*`
- Integrations: `/api/integrations/*`
- Analytics: `/api/analytics/*`
- Privacy: `/api/privacy/export`, `/api/privacy/reset`
- Audit: `/api/audit/*`
- Admin: `/api/admin/*`
- Edge/Webhooks: `/api/webhooks/*`

## Auth model

- Access token via Bearer JWT.
- Refresh token via HTTP-only cookie.
- CSRF token issued from `/api/auth/csrf-token`.

## Realtime events

- `task:stream:start`
- `task:stream:chunk`
- `task:stream:end`
- `vault:updated`
- `notification`
