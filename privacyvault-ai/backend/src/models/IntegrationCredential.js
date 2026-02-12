const mongoose = require('mongoose');

const integrationCredentialSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, required: true, index: true },
    encrypted: {
      iv: { type: String, required: true },
      content: { type: String, required: true },
      tag: { type: String, required: true }
    },
    scopes: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

integrationCredentialSchema.index({ vaultId: 1, provider: 1 }, { unique: true });

const IntegrationCredential = mongoose.model('IntegrationCredential', integrationCredentialSchema);
module.exports = { IntegrationCredential };
