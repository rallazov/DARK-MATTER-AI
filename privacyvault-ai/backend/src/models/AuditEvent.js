const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', index: true },
    action: { type: String, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    anchored: {
      txId: { type: String },
      network: { type: String }
    }
  },
  { timestamps: true }
);

auditEventSchema.index({ vaultId: 1, createdAt: -1 });

const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
module.exports = { AuditEvent };
