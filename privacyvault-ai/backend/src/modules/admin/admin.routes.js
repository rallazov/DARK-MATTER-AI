const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requireFounder } = require('../common/adminGuard');
const { validate } = require('../../middleware/validate');
const { User } = require('../../models/User');
const { Task } = require('../../models/Task');
const { FeatureFlag } = require('../../models/FeatureFlag');
const { AdminActionLog } = require('../../models/AdminActionLog');
const { userActionValidation, featureFlagValidation } = require('./admin.validation');

const router = express.Router();

router.use(requireAuth, requireFounder);

router.get('/metrics', async (req, res, next) => {
  try {
    const [usersTotal, premiumUsers, suspendedUsers, tasksTotal] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ plan: 'premium', deletedAt: null }),
      User.countDocuments({ status: 'suspended' }),
      Task.countDocuments({ isDeleted: false })
    ]);

    const churnRate = usersTotal === 0 ? 0 : Number(((suspendedUsers / usersTotal) * 100).toFixed(2));

    res.json({
      anonymizedMetrics: {
        usersTotal,
        premiumUsers,
        tasksTotal,
        churnRate,
        mauEstimate: Math.round(usersTotal * 0.62)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const items = await User.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({
      items: items.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        plan: u.plan,
        status: u.status,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/action', userActionValidation, validate, async (req, res, next) => {
  try {
    const { action } = req.body;
    const statusMap = { suspend: 'suspended', activate: 'active', ban: 'suspended' };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: statusMap[action] || 'active' },
      { new: true }
    );

    await AdminActionLog.create({
      adminUserId: req.user.id,
      targetUserId: req.params.userId,
      action: `user.${action}`,
      details: { previous: user?.status }
    });

    res.json({ success: true, user: { id: user._id, status: user.status } });
  } catch (error) {
    next(error);
  }
});

router.get('/feature-flags', async (req, res, next) => {
  try {
    const items = await FeatureFlag.find({}).sort({ key: 1 }).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/feature-flags', featureFlagValidation, validate, async (req, res, next) => {
  try {
    const payload = {
      key: req.body.key,
      description: req.body.description,
      enabled: req.body.enabled,
      rolloutPercentage: req.body.rolloutPercentage ?? 100,
      variant: req.body.variant || 'control'
    };

    const flag = await FeatureFlag.findOneAndUpdate({ key: payload.key }, payload, {
      upsert: true,
      new: true
    });

    await AdminActionLog.create({
      adminUserId: req.user.id,
      action: 'feature_flag.updated',
      details: payload
    });

    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
});

router.get('/action-logs', async (req, res, next) => {
  try {
    const items = await AdminActionLog.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminRouter: router };
