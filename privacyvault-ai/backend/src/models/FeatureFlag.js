const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    description: { type: String },
    enabled: { type: Boolean, default: false },
    rolloutPercentage: { type: Number, default: 0 },
    variant: { type: String, default: 'control' }
  },
  { timestamps: true }
);

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
module.exports = { FeatureFlag };
