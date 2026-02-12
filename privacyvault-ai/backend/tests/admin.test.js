const request = require('supertest');
const { createApp } = require('../src/app');
const { User } = require('../src/models/User');
const { authHeaders } = require('./helpers');

const founderEmail = process.env.FOUNDER_EMAIL || 'founder@example.com';

describe('admin guard', () => {
  test('allows founder and blocks regular user', async () => {
    const app = createApp();

    const founder = await User.create({ email: founderEmail, displayName: 'Founder', role: 'admin' });
    const user = await User.create({ email: 'normal@example.com', displayName: 'Normal' });

    const founderRes = await request(app).get('/api/admin/metrics').set(authHeaders(founder));
    expect(founderRes.status).toBe(200);

    const userRes = await request(app).get('/api/admin/metrics').set(authHeaders(user));
    expect(userRes.status).toBe(403);
  });
});
