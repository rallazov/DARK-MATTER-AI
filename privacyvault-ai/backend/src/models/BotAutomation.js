const mongoose = require('mongoose');

const botAutomationSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    triggerType: { type: String, enum: ['cron', 'webhook'], required: true },
    cronExpression: { type: String },
    webhookSecret: { type: String },
    enabled: { type: Boolean, default: true },
    workflowType: { type: String, enum: ['reminder', 'invoice-payment', 'custom'], default: 'custom' },
    lastRunAt: { type: Date },
    lastRunStatus: { type: String, enum: ['success', 'failed', 'none'], default: 'none' }
  },
  { timestamps: true }
);

botAutomationSchema.index({ vaultId: 1, enabled: 1 });

const BotAutomation = mongoose.model('BotAutomation', botAutomationSchema);
module.exports = { BotAutomation };
