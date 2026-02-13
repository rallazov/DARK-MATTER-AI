const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { IntegrationCredential } = require('../../models/IntegrationCredential');
const { assertVaultAccess } = require('../common/vaultAccess');
const { encryptValue } = require('../../utils/crypto');
const { createIntegrationValidation, providerValidation } = require('./integrations.validation');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const query = { userId: req.user.id, isActive: true };
    if (req.query.vaultId) query.vaultId = req.query.vaultId;

    const items = await IntegrationCredential.find(query).lean();
    res.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        vaultId: item.vaultId?.toString(),
        provider: item.provider,
        scopes: item.scopes,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, createIntegrationValidation, validate, async (req, res, next) => {
  try {
    const { vaultId, provider, apiKey, scopes = [] } = req.body;
    const access = await assertVaultAccess({ userId: req.user.id, vaultId, minRole: 'editor' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const encrypted = encryptValue(apiKey);
    const integration = await IntegrationCredential.findOneAndUpdate(
      { vaultId, userId: req.user.id, provider },
      {
        vaultId,
        userId: req.user.id,
        provider,
        encrypted,
        scopes,
        isActive: true
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      id: integration._id,
      vaultId: integration.vaultId,
      provider: integration.provider,
      scopes: integration.scopes,
      createdAt: integration.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/id/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await IntegrationCredential.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false }
    );
    if (!result) return res.status(404).json({ error: 'Integration not found' });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:provider', requireAuth, providerValidation, validate, async (req, res, next) => {
  try {
    const provider = req.params.provider;
    await IntegrationCredential.updateMany(
      { userId: req.user.id, provider },
      { isActive: false }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/proxy/google-calendar', requireAuth, async (req, res) => {
  const { vaultId } = req.body;
  if (!vaultId) return res.status(400).json({ error: 'vaultId is required' });

  const access = await assertVaultAccess({ userId: req.user.id, vaultId, minRole: 'viewer' });
  if (!access) return res.status(404).json({ error: 'Vault not found' });

  return res.json({
    events: [
      {
        id: 'stub_evt_1',
        title: 'Deep Work Block',
        start: new Date(Date.now() + 3600000),
        end: new Date(Date.now() + 7200000)
      }
    ],
    note: 'Calendar responses are proxied through vault isolation in production adapters.'
  });
});

module.exports = { integrationsRouter: router };
