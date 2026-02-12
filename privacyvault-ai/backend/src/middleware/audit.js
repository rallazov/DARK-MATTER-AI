const { AuditEvent } = require('../models/AuditEvent');

async function recordAudit({ userId, action, vaultId, metadata, ip }) {
  await AuditEvent.create({
    userId,
    action,
    vaultId,
    metadata,
    ipAddress: ip
  });
}

module.exports = { recordAudit };
