const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    avatarUrl: { type: String },
    oauthProviders: {
      googleId: { type: String, index: true, sparse: true },
      githubId: { type: String, index: true, sparse: true }
    },
    onboardingCompleted: { type: Boolean, default: false },
    preferences: {
      darkMode: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: true },
      imageEnabled: { type: Boolean, default: true },
      videoEnabled: { type: Boolean, default: false },
      nudgesEnabled: { type: Boolean, default: true }
    },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ plan: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);
module.exports = { User };
