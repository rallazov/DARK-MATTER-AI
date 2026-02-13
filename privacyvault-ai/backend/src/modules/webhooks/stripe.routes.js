const express = require('express');
const mongoose = require('mongoose');
const Stripe = require('stripe');
const { env } = require('../../config/env');
const { User } = require('../../models/User');
const { recordAudit } = require('../../middleware/audit');

const router = express.Router();

async function resolveUserFromSession(session) {
  const referenceId = session.client_reference_id || session.metadata?.userId;
  if (referenceId && mongoose.Types.ObjectId.isValid(referenceId)) {
    const byId = await User.findById(referenceId);
    if (byId) return byId;
  }

  const email = session.customer_email || session.customer_details?.email;
  if (email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  return null;
}

async function handleCheckoutCompleted(session, ipAddress) {
  const user = await resolveUserFromSession(session);
  if (!user) return;

  if (user.plan !== 'premium') {
    user.plan = 'premium';
    await user.save();
  }

  await recordAudit({
    userId: user._id,
    action: 'billing.checkout_session_completed',
    metadata: {
      stripeSessionId: session.id,
      stripeCustomerId: session.customer || null,
      amountTotal: session.amount_total || null
    },
    ip: ipAddress
  });
}

router.post('/', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
      return res.status(503).json({
        error: 'Stripe webhook not configured',
        message: 'Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET'
      });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature header' });
    }

    const stripe = new Stripe(env.stripeSecretKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
    } catch (error) {
      return res.status(400).json({ error: `Invalid Stripe signature: ${error.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object, req.ip);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = { stripeWebhookRouter: router };
