const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { User } = require('../../models/User');
const { UserProgress } = require('../../models/UserProgress');
const { MfaSecret } = require('../../models/MfaSecret');
const { IntegrationCredential } = require('../../models/IntegrationCredential');

const router = express.Router();

router.get('/privacy-score', requireAuth, async (req, res, next) => {
  try {
    const [mfa, integrations] = await Promise.all([
      MfaSecret.findOne({ userId: req.user.id, enabled: true }).lean(),
      IntegrationCredential.find({ userId: req.user.id, isActive: true }).lean()
    ]);

    let score = 70;
    const factors = [];

    if (req.user.plan === 'premium') {
      score += 10;
      factors.push({ label: 'Premium plan', impact: '+10' });
    }

    if (mfa?.enabled) {
      score += 15;
      factors.push({ label: 'MFA enabled', impact: '+15' });
    } else if (req.user.plan === 'premium') {
      factors.push({ label: 'Enable MFA', impact: '+15' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const staleIntegrations = integrations.filter((i) => new Date(i.createdAt) < thirtyDaysAgo);
    if (integrations.length > 0) {
      score += Math.min(integrations.length * 3, 10);
      factors.push({ label: `${integrations.length} integration(s)`, impact: `+${Math.min(integrations.length * 3, 10)}` });
    }
    if (staleIntegrations.length > 0) {
      score -= Math.min(staleIntegrations.length * 5, 15);
      factors.push({ label: 'Rotate keys (30+ days old)', impact: `-${Math.min(staleIntegrations.length * 5, 15)}` });
    }

    score = Math.max(0, Math.min(100, score));

    res.json({ score, factors });
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
