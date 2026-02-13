const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { User } = require('../../models/User');
const { env } = require('../../config/env');

const router = express.Router();

router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (user?.plan === 'premium') {
      return res.status(400).json({ error: 'Already on premium' });
    }

    const stripeSecretKey = env.stripeSecretKey;
    const stripePriceId = env.stripePriceId;

    if (!stripeSecretKey || !stripePriceId) {
      return res.status(503).json({
        error: 'Premium upgrade coming soon',
        message: 'Configure STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable payments.'
      });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || env.frontendUrl}/?premium=success`,
      cancel_url: `${process.env.FRONTEND_URL || env.frontendUrl}/?premium=cancelled`,
      client_reference_id: req.user.id,
      customer_email: req.user.email
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

module.exports = { billingRouter: router };
