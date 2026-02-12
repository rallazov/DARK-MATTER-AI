const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { Task } = require('../../models/Task');
const { UserProgress } = require('../../models/UserProgress');

const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [tasks, progress] = await Promise.all([
      Task.find({ userId: req.user.id, isDeleted: false }).lean(),
      UserProgress.findOne({ userId: req.user.id }).lean()
    ]);

    const timeSavedMinutes = tasks.reduce((sum, task) => sum + (task.metadata?.estimatedTimeSavedMinutes || 0), 0);
    const multimodalCount = tasks.filter((t) => ['image', 'voice', 'video'].includes(t.type)).length;

    res.json({
      privateInsights: {
        tasksCompleted: tasks.length,
        timeSavedHours: Number((timeSavedMinutes / 60).toFixed(1)),
        multimodalTasks: multimodalCount,
        currentStreak: progress?.currentStreak || 0,
        productivityScore: progress?.productivityScore || 0
      },
      dataSharing: {
        enabled: false,
        note: 'PrivacyVault AI does not share analytics without explicit opt-in.'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { analyticsRouter: router };
