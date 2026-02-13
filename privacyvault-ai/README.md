# PrivacyVault AI

Privacy-first multimodal SaaS monolith designed for fast shipping now and clean microservice extraction later.

## Highlights

- OAuth + magic-link authentication with optional premium MFA.
- Isolated vault model for private multimodal tasks (text/image/voice/video).
- Dedicated product pages: `/app`, `/vaults`, `/tasks`, `/bots`, `/integrations`, `/settings`, `/upgrade`.
- Dynamic dashboard metrics, activity feed, privacy score meter, streak gamification, and milestone confetti.
- Stripe checkout stub + signed Stripe webhook that upgrades users to premium.
- Modular backend domains under `/backend/src/modules/*` with extraction notes.

## Stack

- Frontend: React 18, Vite, Tailwind CSS, Redux Toolkit, Socket.io client
- Backend: Node.js, Express, MongoDB/Mongoose, Passport OAuth, JWT, otplib MFA
- Shared: Contracts/constants in `/shared`
- DevOps: Docker, docker-compose, Kubernetes manifests, GitHub Actions CI

## Repository Layout

```text
privacyvault-ai/
  backend/
  frontend/
  shared/
  docs/
  k8s/
  docker-compose.yml
  Dockerfile
```

## Screenshots

Add your latest screenshots to `docs/screenshots/` and reference them here.

- `docs/screenshots/dashboard-home.png`
- `docs/screenshots/tasks-page.png`
- `docs/screenshots/bots-page.png`
- `docs/screenshots/settings-page.png`
- `docs/screenshots/upgrade-page.png`

## Quick Start (Local)

1. Install dependencies

```bash
npm ci
```

2. Configure environment

```bash
cp .env.example .env
```

3. Start MongoDB

```bash
docker compose up -d mongo
```

4. Seed demo data

```bash
npm run seed
```

5. Run frontend + backend

```bash
npm run dev
```

6. Open the app

- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8080/api/docs`
- API docs alias: `http://localhost:8080/api-docs`

## Environment Variables

Required highlights:

- Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Security: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MAGIC_LINK_JWT_SECRET`, `ENCRYPTION_KEY`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Frontend pricing override: `VITE_TEAM_PRICE` (default `29`)

## Product Routes

- `/app` Dashboard home
- `/vaults` Vault management
- `/tasks` Global task history + response panel
- `/bots` Bot builder and recurring automations
- `/integrations` Vault-scoped encrypted integrations
- `/settings` Export/reset/MFA/audit/privacy score
- `/upgrade` Free/Pro/Team pricing and checkout entry

## Backend API Domains

- `/api/auth/*`
- `/api/users/*` (includes `/privacy-score`, `/security-status`, `/activity`)
- `/api/vaults/*`
- `/api/tasks/*`
- `/api/bots/*`
- `/api/integrations/*`
- `/api/privacy/*`
- `/api/audit/*`
- `/api/billing/*`
- `/api/webhooks/stripe`

## Running with Docker Compose

This compose file runs `mongo + backend + frontend` as separate services:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Deployment Starters

- Railway (full stack or backend): `https://railway.app/new`
- Render (backend): `https://render.com/deploy`
- Vercel (frontend): `https://vercel.com/new`

## Tests and Quality

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

## Kubernetes

```bash
kubectl apply -f k8s/monolith-configmap.yaml
kubectl apply -f k8s/monolith-deployment.yaml
kubectl apply -f k8s/monolith-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

## Security and Privacy Notes

- No user vault data is used for training.
- Vault-scoped access checks enforced server-side.
- Export + irreversible reset flows available in settings.
- Stripe webhook signature verification enforced.

## Known Limitations

- AI providers and advanced media generation remain stubbed.
- Collaboration cryptography is a pragmatic encrypted-link approach, not full ZK.
- Confetti is lightweight UI-only and not persisted as events.

## Next Hardening Steps

1. Add Redis-backed distributed cache/rate limiting/session helpers.
2. Add SAST/DAST and dependency policies to CI.
3. Add key management via cloud KMS/HSM.
4. Add full observability pipeline (logs/metrics/traces/alerts).
