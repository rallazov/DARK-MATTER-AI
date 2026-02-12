const request = require('supertest');
const { createApp } = require('../src/app');
const { User } = require('../src/models/User');
const { Vault } = require('../src/models/Vault');
const { authHeaders } = require('./helpers');

describe('vault isolation', () => {
  test('user only sees own vaults', async () => {
    const app = createApp();

    const [userA, userB] = await User.create([
      { email: 'a@example.com', displayName: 'A' },
      { email: 'b@example.com', displayName: 'B' }
    ]);

    await Vault.create({ ownerId: userA._id, name: 'A Vault' });
    await Vault.create({ ownerId: userB._id, name: 'B Vault' });

    const res = await request(app)
      .get('/api/vaults')
      .set(authHeaders(userA));

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('A Vault');
  });
});
