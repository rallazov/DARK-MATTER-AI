const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    theme: { type: String, default: 'slate' },
    avatar: { type: String, default: 'shield' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    lastResetAt: { type: Date, default: Date.now, index: true },
    privacyScore: { type: Number, default: 80 },
    storageUsedBytes: { type: Number, default: 0 },
    shardKey: {
      type: String,
      index: true,
      comment: 'Shard-friendly key for future horizontal partitioning by tenant.'
    },
    collaboration: {
      enabled: { type: Boolean, default: false },
      encryptedShareToken: { type: String }
    }
  },
  { timestamps: true }
);

vaultSchema.index({ ownerId: 1, createdAt: -1 });
vaultSchema.pre('save', function assignShardKey(next) {
  if (!this.shardKey) {
    this.shardKey = `${this.ownerId.toString().slice(-6)}:${Date.now()}`;
  }
  next();
});

const Vault = mongoose.model('Vault', vaultSchema);
module.exports = { Vault };
