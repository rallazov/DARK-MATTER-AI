const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { completeOnboardingValidation } = require('./onboarding.validation');
const { User } = require('../../models/User');
const { Vault } = require('../../models/Vault');
const { VaultMember } = require('../../models/VaultMember');

const router = express.Router();

router.get('/state', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({
      onboardingCompleted: user?.onboardingCompleted || false,
      preferences: user?.preferences || {}
    });
  } catch (error) {
    next(error);
  }
});

router.post('/complete', requireAuth, completeOnboardingValidation, validate, async (req, res, next) => {
  try {
    const { vaultName, theme, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboardingCompleted: true,
        ...(preferences ? { preferences } : {})
      },
      { new: true }
    );

    const existingVault = await Vault.findOne({ ownerId: req.user.id, isDeleted: false });
    let vault = existingVault;
    if (!vault) {
      vault = await Vault.create({
        ownerId: req.user.id,
        name: vaultName,
        theme: theme || 'slate',
        avatar: avatar || 'shield'
      });
      await VaultMember.create({
        vaultId: vault._id,
        userId: req.user.id,
        role: 'owner',
        acceptedAt: new Date()
      });
    }

    res.json({
      onboardingCompleted: user.onboardingCompleted,
      vaultId: vault._id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { onboardingRouter: router };
