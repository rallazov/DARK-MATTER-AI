const express = require('express');
const { stringify } = require('csv-stringify/sync');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { recordAudit } = require('../../middleware/audit');
const { Vault } = require('../../models/Vault');
const { Task } = require('../../models/Task');
const { AuditEvent } = require('../../models/AuditEvent');
const { BotAutomation } = require('../../models/BotAutomation');
const { IntegrationCredential } = require('../../models/IntegrationCredential');
const { resetValidation } = require('./privacy.validation');

const router = express.Router();

router.get('/export', requireAuth, async (req, res, next) => {
  try {
    const [vaults, tasks, audit] = await Promise.all([
      Vault.find({ ownerId: req.user.id }).lean(),
      Task.find({ userId: req.user.id }).lean(),
      AuditEvent.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(500).lean()
    ]);

    const format = (req.query.format || 'json').toLowerCase();
    const payload = {
      userId: req.user.id,
      exportedAt: new Date().toISOString(),
      vaults,
      tasks,
      audit
    };

    if (format === 'csv') {
      const csv = stringify(
        tasks.map((task) => ({
          taskId: task._id.toString(),
          vaultId: task.vaultId.toString(),
          type: task.type,
          status: task.status,
          createdAt: task.createdAt
        })),
        { header: true }
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="privacy-export.csv"');
      return res.send(csv);
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/reset', requireAuth, resetValidation, validate, async (req, res, next) => {
  try {
    const { vaultId } = req.body;

    if (vaultId) {
      await Promise.all([
        Task.deleteMany({ vaultId }),
        BotAutomation.deleteMany({ vaultId }),
        IntegrationCredential.deleteMany({ vaultId }),
        Vault.findByIdAndUpdate(vaultId, { isDeleted: true, deletedAt: new Date() })
      ]);
    } else {
      const vaults = await Vault.find({ ownerId: req.user.id }).lean();
      const vaultIds = vaults.map((v) => v._id);
      await Promise.all([
        Task.deleteMany({ userId: req.user.id }),
        BotAutomation.deleteMany({ userId: req.user.id }),
        IntegrationCredential.deleteMany({ userId: req.user.id }),
        Vault.updateMany({ ownerId: req.user.id }, { isDeleted: true, deletedAt: new Date() })
      ]);

      await AuditEvent.deleteMany({ userId: req.user.id, vaultId: { $in: vaultIds } });
    }

    await recordAudit({
      userId: req.user.id,
      vaultId: vaultId || null,
      action: 'privacy.reset_executed',
      metadata: { irreversible: true },
      ip: req.ip
    });

    res.json({ success: true, message: 'Reset completed and audited.' });
  } catch (error) {
    next(error);
  }
});

module.exports = { privacyRouter: router };
