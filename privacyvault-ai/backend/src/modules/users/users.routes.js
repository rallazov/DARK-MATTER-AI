const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { User } = require('../../models/User');
const { UserProgress } = require('../../models/UserProgress');
const { MfaSecret } = require('../../models/MfaSecret');
const { IntegrationCredential } = require('../../models/IntegrationCredential');
const { AuditEvent } = require('../../models/AuditEvent');
const { Vault } = require('../../models/Vault');

const router = express.Router();

router.get('/privacy-score', requireAuth, async (req, res, next) => {
  try {
    const [mfa, integrations, vaults] = await Promise.all([
      MfaSecret.findOne({ userId: req.user.id, enabled: true }).lean(),
      IntegrationCredential.find({ userId: req.user.id, isActive: true }).lean(),
      Vault.find({ ownerId: req.user.id, isDeleted: false }).lean()
    ]);

    let score = 70;
    const factors = [{ label: 'Base secure posture', impact: '+70' }];

    if (mfa?.enabled) {
      score += 10;
      factors.push({ label: 'MFA enabled', impact: '+10' });
    } else {
      factors.push({ label: 'Enable MFA', impact: '+10' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hasMonthlyKeyRotation = integrations.length > 0 && integrations.every((i) => new Date(i.updatedAt) >= thirtyDaysAgo);
    if (hasMonthlyKeyRotation) {
      score += 5;
      factors.push({ label: 'Monthly key rotation', impact: '+5' });
    } else {
      factors.push({ label: 'Rotate integration keys monthly', impact: '+5' });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const hasStaleVault = vaults.some((vault) => {
      const marker = vault.lastResetAt || vault.createdAt;
      return new Date(marker) < ninetyDaysAgo;
    });
    if (hasStaleVault) {
      score -= 15;
      factors.push({ label: 'Vault not reset in 90 days', impact: '-15' });
    }

    score = Math.max(0, Math.min(100, score));

    res.json({ score, factors });
  } catch (error) {
    next(error);
  }
});

router.get('/security-status', requireAuth, async (req, res, next) => {
  try {
    const [mfa, integrations] = await Promise.all([
      MfaSecret.findOne({ userId: req.user.id }).lean(),
      IntegrationCredential.find({ userId: req.user.id, isActive: true }).lean()
    ]);

    res.json({
      plan: req.user.plan,
      mfaConfigured: Boolean(mfa),
      mfaEnabled: Boolean(mfa?.enabled),
      integrationsCount: integrations.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);
    const events = await AuditEvent.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(limit).lean();

    const items = events.map((event) => ({
      id: event._id.toString(),
      title: event.action.replaceAll('.', ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      description: event.metadata?.taskId
        ? `Task ${event.metadata.taskId}`
        : event.metadata?.name
          ? `${event.metadata.name}`
          : event.vaultId
            ? `Vault ${event.vaultId}`
            : 'Private account event',
      createdAt: event.createdAt
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [user, progress] = await Promise.all([
      User.findById(req.user.id).lean(),
      UserProgress.findOne({ userId: req.user.id }).lean()
    ]);

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences,
      progress: progress || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { usersRouter: router };
