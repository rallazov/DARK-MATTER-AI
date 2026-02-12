const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['text', 'image', 'voice', 'video', 'automation'], default: 'text' },
    prompt: { type: String, trim: true, maxlength: 10_000 },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued', index: true },
    metadata: {
      ocrText: { type: String },
      transcript: { type: String },
      estimatedTimeSavedMinutes: { type: Number, default: 0 }
    },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

taskSchema.index({ vaultId: 1, createdAt: -1 });
taskSchema.index({ vaultId: 1, status: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = { Task };
