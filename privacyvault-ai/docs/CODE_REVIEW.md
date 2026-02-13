# Code Review: Medium-Priority Changes (feat/medium-priority)

**Scope:** Bots, Integrations, Privacy Score, Upgrade, Vault Share, Vault UX, Stripe premium flow
**Status Date:** February 13, 2026

---

## 1. Current State Snapshot

| Area | Status | Notes |
|------|--------|-------|
| Bots | Implemented | Create/run/update/delete, loading and error feedback in UI |
| Integrations | Implemented (minor gap) | Delete-by-id validation added; POST response shape still mixed ObjectId/string |
| Privacy Score | Implemented | Formula now matches product rule: base 70, MFA +10, rotation +5, stale vault -15 |
| Upgrade | Implemented | Stripe checkout + "coming soon" fallback with waitlist link |
| Stripe Webhook | Implemented | Signature-verified webhook upgrades user to premium on checkout completion |
| Vault Share UX | Implemented | Premium-gated share links, copy success/error feedback shown |
| Security Controls | Good baseline | Auth/premium guards + encrypted integration key storage in place |

---

## 2. Backend Review

### Billing (`billing.routes.js`)

- `POST /api/billing/checkout` is protected by `requireAuth`.
- Returns `503` with waitlist contact if Stripe is not configured.
- Stripe SDK is required inside the handler, keeping startup resilient in non-Stripe environments.

### Stripe webhook (`webhooks/stripe.routes.js`)

- `POST /api/webhooks/stripe` exists and is mounted before JSON parsing.
- Uses `express.raw({ type: 'application/json' })` and verifies `stripe-signature`.
- On `checkout.session.completed`, resolves the user and sets `user.plan = 'premium'`.
- Audit event is recorded for billing completion.

### Privacy score (`users.routes.js`)

- Current logic is clear and consistent:
  - Base: `70`
  - `+10` if MFA enabled
  - `+5` if integration keys rotated in last 30 days
  - `-15` if any active vault is stale beyond 90 days (`lastResetAt` or `createdAt`)
- `mfa?.enabled` check is slightly redundant after filtering by `enabled: true`, but harmless.

### Integrations (`integrations.routes.js`)

- `DELETE /id/:id` is now validated with `isMongoId()`.
- Route order prevents `/id/:id` from being shadowed by `/:provider`.
- Remaining cleanup: POST response returns raw `ObjectId` fields while GET normalizes to strings.

---

## 3. Frontend Review

### BotsPanel

- Create flow has loading and error display.
- Run flow has per-bot loading/error state and success feedback text.
- Empty vault state is handled.

### IntegrationsPanel

- Create/remove operations have mutate loading/error handling.
- Vault display logic is acceptable and tolerant if vault name is unavailable.

### VaultCards (Share)

- Share action has loading and fallback error state.
- Copy action now gives visible success (`Copied`) and failure feedback.
- Remaining UX gap: share creation errors still collapse to a generic message.

### UpgradePanel

- Premium users are gated from redundant checkout UI.
- Non-configured Stripe path shows "coming soon" behavior and waitlist `mailto`.

### Progress/Privacy UI

- Privacy meter fallback is robust.
- Minor state-management gap: `fetchPrivacyScore` does not update a dedicated loading/error status.

---

## 4. Security and Robustness

- Auth guards are applied across billing/privacy/integrations/share endpoints.
- Premium-only checks are enforced server-side for share links.
- Integration secrets are encrypted before persistence.
- Stripe webhook signature verification is implemented correctly for baseline integrity.

---

## 5. Summary Assessment

| Area | Assessment |
|------|------------|
| Functionality | Strong - medium-priority scope is largely complete |
| Security | Strong baseline - auth/premium/encryption/signature checks present |
| Error handling | Good - significantly improved in bots/integrations/copy flows |
| Consistency | Mixed - integrations POST response format should match GET |
| UX polish | Good - notable improvements, a few message-quality upgrades left |

---

## 6. Remaining Non-Blocking Follow-ups

1. **Integrations POST response normalization:** return `id` and `vaultId` as strings for parity with GET.
2. **Vault share error detail:** surface sanitized backend error text instead of generic "Failed to create link".
3. **Privacy score request state:** add pending/rejected handling for `fetchPrivacyScore` to support loading/error UI.
4. **Webhook hardening:** add explicit idempotency handling for replayed Stripe events (event ID store/check).
5. **Test coverage extension:** add integration tests for `/api/integrations/id/:id` invalid-id path and share-link copy/share failure UX.

---

## 7. Completed Follow-ups (Previously Open)

1. Bots create/run loading and error feedback.
2. MongoId validation for `DELETE /api/integrations/id/:id`.
3. Copy feedback in vault share card (`Copied` + error fallback).
4. Stripe webhook implementation for premium upgrade on checkout completion.
5. Stripe-not-configured fallback messaging with waitlist contact.
