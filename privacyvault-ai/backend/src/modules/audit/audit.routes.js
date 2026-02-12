const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { AuditEvent } = require('../../models/AuditEvent');
const { getPagination } = require('../../utils/pagination');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const query = { userId: req.user.id };
    if (req.query.vaultId) query.vaultId = req.query.vaultId;

    const [items, total] = await Promise.all([
      AuditEvent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditEvent.countDocuments(query)
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
});

module.exports = { auditRouter: router };
