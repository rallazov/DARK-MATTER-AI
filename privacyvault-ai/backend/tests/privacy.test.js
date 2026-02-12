const request = require('supertest');
const { createApp } = require('../src/app');
const { User } = require('../src/models/User');
const { Vault } = require('../src/models/Vault');
const { Task } = require('../src/models/Task');
const { authHeaders } = require('./helpers');

describe('privacy reset', () => {
  test('executes reset with csrf token', async () => {
    const app = createApp();
    const agent = request.agent(app);

    const user = await User.create({ email: 'privacy@example.com', displayName: 'Privacy' });
    const vault = await Vault.create({ ownerId: user._id, name: 'Private Vault' });
    await Task.create({
      vaultId: vault._id,
      userId: user._id,
      type: 'text',
      prompt: 'hello',
      status: 'completed'
    });

    const csrfRes = await agent.get('/api/auth/csrf-token');
    const csrfToken = csrfRes.body.csrfToken;

    const resetRes = await agent
      .post('/api/privacy/reset')
      .set(authHeaders(user))
      .set('x-csrf-token', csrfToken)
      .send({ confirmText: 'DELETE' });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
  });
});
