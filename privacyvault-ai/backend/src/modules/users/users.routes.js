const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { User } = require('../../models/User');
const { UserProgress } = require('../../models/UserProgress');

const router = express.Router();

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
