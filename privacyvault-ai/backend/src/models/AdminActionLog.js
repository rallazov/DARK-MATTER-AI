const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema(
  {
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);
module.exports = { AdminActionLog };
