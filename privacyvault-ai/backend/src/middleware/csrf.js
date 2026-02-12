const crypto = require('crypto');

function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('pvai_csrf', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ csrfToken: token });
}

function verifyCsrf(req, res, next) {
  const method = req.method.toUpperCase();
  const safe = ['GET', 'HEAD', 'OPTIONS'];
  if (safe.includes(method)) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies.pvai_csrf;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }
  return next();
}

module.exports = { issueCsrfToken, verifyCsrf };
