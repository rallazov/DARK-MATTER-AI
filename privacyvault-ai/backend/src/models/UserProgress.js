const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    badges: [{ type: String }],
    weeklyGoalMinutes: { type: Number, default: 120 },
    weeklyCompletedMinutes: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastActiveDate: { type: Date, default: null }
  },
  { timestamps: true }
);

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
module.exports = { UserProgress };
