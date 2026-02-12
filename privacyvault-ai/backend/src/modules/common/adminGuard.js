const { env } = require('../../config/env');

function requireFounder(req, res, next) {
  if (!req.user || req.user.email !== env.founderEmail) {
    return res.status(403).json({ error: 'Founder access required' });
  }
  return next();
}

module.exports = { requireFounder };
