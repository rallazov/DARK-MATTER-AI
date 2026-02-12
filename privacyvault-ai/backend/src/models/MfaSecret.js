const mongoose = require('mongoose');

const mfaSecretSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    secret: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    backupCodes: [{ type: String }]
  },
  { timestamps: true }
);

const MfaSecret = mongoose.model('MfaSecret', mfaSecretSchema);
module.exports = { MfaSecret };
