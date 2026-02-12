const request = require('supertest');
const { createApp } = require('../src/app');
const { User } = require('../src/models/User');
const { Vault } = require('../src/models/Vault');
const { VaultMember } = require('../src/models/VaultMember');
const { authHeaders } = require('./helpers');

describe('tasks API', () => {
  test('creates a text task', async () => {
    const app = createApp();

    const user = await User.create({ email: 'tasker@example.com', displayName: 'Tasker' });
    const vault = await Vault.create({ ownerId: user._id, name: 'Task Vault' });
    await VaultMember.create({ vaultId: vault._id, userId: user._id, role: 'owner', acceptedAt: new Date() });

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeaders(user))
      .field('vaultId', vault._id.toString())
      .field('prompt', 'Generate tomorrow plan')
      .field('type', 'text');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('completed');
    expect(res.body.output).toHaveProperty('text');
  });
});
