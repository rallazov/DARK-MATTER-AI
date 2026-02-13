const request = require('supertest');
const Stripe = require('stripe');
const { createApp } = require('../src/app');
const { User } = require('../src/models/User');
const { env } = require('../src/config/env');

describe('stripe webhook', () => {
  const originalSecretKey = env.stripeSecretKey;
  const originalWebhookSecret = env.stripeWebhookSecret;

  beforeEach(() => {
    env.stripeSecretKey = 'sk_test_51Qystubsecret';
    env.stripeWebhookSecret = 'whsec_test_secret';
  });

  afterAll(() => {
    env.stripeSecretKey = originalSecretKey;
    env.stripeWebhookSecret = originalWebhookSecret;
  });

  test('sets user plan to premium on checkout.session.completed', async () => {
    const app = createApp();
    const user = await User.create({
      email: 'stripe-user@example.com',
      displayName: 'Stripe User',
      plan: 'free'
    });

    const eventPayload = JSON.stringify({
      id: 'evt_test_checkout_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: user._id.toString(),
          customer_email: user.email,
          amount_total: 999
        }
      }
    });

    const stripe = new Stripe(env.stripeSecretKey);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: eventPayload,
      secret: env.stripeWebhookSecret
    });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(eventPayload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const updated = await User.findById(user._id).lean();
    expect(updated.plan).toBe('premium');
  });

  test('rejects request when signature is missing', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'checkout.session.completed' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing stripe signature/i);
  });
});
