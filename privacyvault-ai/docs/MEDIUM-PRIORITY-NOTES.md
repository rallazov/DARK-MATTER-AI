# Medium Priority Changes (feat/medium-priority)

## What was built

### Bots
- New **Bots** section in the sidebar. You can create bots that run workflows on a schedule (cron) or via webhook.
- Each bot is tied to a vault. You can run a bot manually, enable/disable it, or delete it.

### Integrations
- New **Integrations** section. Connect Google, Notion, or Slack to a vault by adding an API key.
- Keys are encrypted per vault. You can remove an integration from a specific vault.

### Privacy Score
- The score is now computed from real data instead of a fixed number.
- It considers: premium plan (+10), MFA enabled (+15), integrations count, and whether you should rotate keys (30+ days old).
- The meter shows which factors affect your score.

### Upgrade to Premium
- **Start Premium** button now works. When Stripe is configured, it redirects to Stripe Checkout.
- If Stripe is not set up, it shows a “coming soon” message.
- Add `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` to `.env` to enable payments.

### Vault Share Link
- Premium users see a **Share** button on each vault card.
- Clicking it creates an encrypted share link and shows it with a copy button.

### Vault UX (from earlier work)
- First vault is auto-selected when you load the dashboard.
- Creating a vault selects it. Deleting the selected vault selects another one.
