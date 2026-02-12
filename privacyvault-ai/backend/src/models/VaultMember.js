const mongoose = require('mongoose');

const vaultMemberSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
    encryptedAccessToken: { type: String },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    revokedAt: { type: Date }
  },
  { timestamps: true }
);

vaultMemberSchema.index({ vaultId: 1, userId: 1 }, { unique: true });

const VaultMember = mongoose.model('VaultMember', vaultMemberSchema);
module.exports = { VaultMember };
