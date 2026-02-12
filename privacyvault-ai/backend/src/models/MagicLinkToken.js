const mongoose = require('mongoose');

const magicLinkTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

magicLinkTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MagicLinkToken = mongoose.model('MagicLinkToken', magicLinkTokenSchema);
module.exports = { MagicLinkToken };
