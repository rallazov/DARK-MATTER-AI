const request = require('supertest');
const { createApp } = require('../src/app');
const { MagicLinkToken } = require('../src/models/MagicLinkToken');
const { User } = require('../src/models/User');

describe('auth module', () => {
  test('requests and verifies magic link', async () => {
    const app = createApp();

    const requestRes = await request(app)
      .post('/api/auth/magic-link/request')
      .send({ email: 'user@example.com' });

    expect(requestRes.status).toBe(200);

    const tokenDoc = await MagicLinkToken.findOne({ email: 'user@example.com' });
    expect(tokenDoc).toBeTruthy();

    const verifyRes = await request(app)
      .post('/api/auth/magic-link/verify')
      .send({ token: tokenDoc.token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toHaveProperty('accessToken');

    const user = await User.findOne({ email: 'user@example.com' });
    expect(user).toBeTruthy();
  });
});
