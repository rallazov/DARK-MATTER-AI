const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: user.plan
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requirePremium(req, res, next) {
  if (req.user?.plan !== 'premium') {
    return res.status(403).json({ error: 'Premium plan required' });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  return next();
}

module.exports = { requireAuth, requirePremium, requireAdmin };
