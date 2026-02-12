const crypto = require('crypto');
const express = require('express');
const { requireAuth, requirePremium } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { recordAudit } = require('../../middleware/audit');
const { Vault } = require('../../models/Vault');
const { VaultMember } = require('../../models/VaultMember');
const { Task } = require('../../models/Task');
const { assertVaultAccess } = require('../common/vaultAccess');
const {
  createVaultValidation,
  updateVaultValidation,
  vaultIdValidation
} = require('./vaults.validation');
const { encryptValue } = require('../../utils/crypto');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const ownerVaults = await Vault.find({ ownerId: req.user.id, isDeleted: false }).sort({ createdAt: -1 }).lean();
    const memberVaults = await VaultMember.find({ userId: req.user.id, revokedAt: null }).lean();

    const memberVaultIds = memberVaults.map((m) => m.vaultId);
    const sharedVaults = await Vault.find({ _id: { $in: memberVaultIds }, isDeleted: false }).lean();

    const vaults = [...ownerVaults, ...sharedVaults];
    res.json({ items: vaults });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, createVaultValidation, validate, async (req, res, next) => {
  try {
    const vault = await Vault.create({
      ownerId: req.user.id,
      name: req.body.name,
      theme: req.body.theme || 'slate',
      avatar: req.body.avatar || 'shield'
    });

    await VaultMember.create({
      vaultId: vault._id,
      userId: req.user.id,
      role: 'owner',
      acceptedAt: new Date()
    });

    await recordAudit({
      userId: req.user.id,
      vaultId: vault._id,
      action: 'vault.created',
      metadata: { name: vault.name },
      ip: req.ip
    });

    res.status(201).json(vault);
  } catch (error) {
    next(error);
  }
});

router.get('/:vaultId', requireAuth, vaultIdValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.params.vaultId });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const taskCount = await Task.countDocuments({ vaultId: req.params.vaultId, isDeleted: false });
    res.json({ ...access.vault, taskCount });
  } catch (error) {
    next(error);
  }
});

router.patch('/:vaultId', requireAuth, updateVaultValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.params.vaultId, minRole: 'editor' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const vault = await Vault.findByIdAndUpdate(
      req.params.vaultId,
      {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.theme ? { theme: req.body.theme } : {}),
        ...(req.body.avatar ? { avatar: req.body.avatar } : {})
      },
      { new: true }
    );

    await recordAudit({
      userId: req.user.id,
      vaultId: req.params.vaultId,
      action: 'vault.updated',
      metadata: req.body,
      ip: req.ip
    });

    res.json(vault);
  } catch (error) {
    next(error);
  }
});

router.post('/:vaultId/reset', requireAuth, vaultIdValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.params.vaultId, minRole: 'owner' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    await Task.updateMany(
      { vaultId: req.params.vaultId, isDeleted: false },
      { isDeleted: true, status: 'completed', output: { reset: true }, metadata: { resetAt: new Date() } }
    );

    await recordAudit({
      userId: req.user.id,
      vaultId: req.params.vaultId,
      action: 'vault.reset',
      metadata: { irreversible: true },
      ip: req.ip
    });

    res.json({ success: true, message: 'Vault data reset complete.' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:vaultId', requireAuth, vaultIdValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.params.vaultId, minRole: 'owner' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    await Vault.findByIdAndUpdate(req.params.vaultId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    await recordAudit({
      userId: req.user.id,
      vaultId: req.params.vaultId,
      action: 'vault.deleted',
      metadata: { softDelete: true },
      ip: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/:vaultId/share-link', requireAuth, requirePremium, vaultIdValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.params.vaultId, minRole: 'owner' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const plainToken = crypto.randomBytes(24).toString('hex');
    const encrypted = encryptValue(plainToken);

    await Vault.findByIdAndUpdate(req.params.vaultId, {
      'collaboration.enabled': true,
      'collaboration.encryptedShareToken': JSON.stringify(encrypted)
    });

    await recordAudit({
      userId: req.user.id,
      vaultId: req.params.vaultId,
      action: 'vault.share_link_created',
      metadata: { zeroKnowledgeApproximation: true },
      ip: req.ip
    });

    res.json({ shareToken: plainToken, link: `${process.env.FRONTEND_URL}/vault/share/${plainToken}` });
  } catch (error) {
    next(error);
  }
});

module.exports = { vaultsRouter: router };
