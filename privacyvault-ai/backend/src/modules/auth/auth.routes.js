const express = require('express');
const passport = require('passport');
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { requireAuth, requirePremium } = require('../../middleware/auth');
const { issueCsrfToken } = require('../../middleware/csrf');
const {
  requestMagicLinkValidation,
  verifyMagicLinkValidation,
  refreshValidation,
  mfaSetupValidation,
  mfaVerifyValidation
} = require('./auth.validation');
const {
  issueSession,
  requestMagicLink,
  consumeMagicLink,
  rotateRefreshToken,
  revokeRefreshToken,
  setupMfa,
  verifyMfa,
  disableMfa,
  ensureUserBootstrap
} = require('./auth.service');
const { env } = require('../../config/env');

// TODO: extract to microservice (auth-service boundary)
const router = express.Router();

function strategyAvailable(name) {
  return Boolean(passport._strategy(name));
}

router.get('/csrf-token', issueCsrfToken);

router.get('/oauth/google', authLimiter, (req, res, next) => {
  if (!strategyAvailable('google')) {
    return res.redirect(`${env.frontendUrl}/login?error=oauth_not_configured`);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/oauth/github', authLimiter, (req, res, next) => {
  if (!strategyAvailable('github')) {
    return res.redirect(`${env.frontendUrl}/login?error=oauth_not_configured`);
  }
  return passport.authenticate('github', { session: false })(req, res, next);
});

router.get('/oauth/google/callback', (req, res, next) => {
  if (!strategyAvailable('google')) {
    return res.redirect(`${env.frontendUrl}/login?error=oauth_not_configured`);
  }
  return passport.authenticate('google', { session: false }, async (error, user) => {
    if (error || !user) {
      return res.redirect(`${env.frontendUrl}/login?error=oauth_failed`);
    }
    await ensureUserBootstrap(user);
    const session = await issueSession(user, res, { method: 'oauth_google', ip: req.ip });
    return res.redirect(
      `${env.frontendUrl}/auth/callback?accessToken=${encodeURIComponent(session.accessToken)}`
    );
  })(req, res, next);
});

router.get('/oauth/github/callback', (req, res, next) => {
  if (!strategyAvailable('github')) {
    return res.redirect(`${env.frontendUrl}/login?error=oauth_not_configured`);
  }
  return passport.authenticate('github', { session: false }, async (error, user) => {
    if (error || !user) {
      return res.redirect(`${env.frontendUrl}/login?error=oauth_failed`);
    }
    await ensureUserBootstrap(user);
    const session = await issueSession(user, res, { method: 'oauth_github', ip: req.ip });
    return res.redirect(
      `${env.frontendUrl}/auth/callback?accessToken=${encodeURIComponent(session.accessToken)}`
    );
  })(req, res, next);
});

router.post('/magic-link/request', authLimiter, requestMagicLinkValidation, validate, async (req, res, next) => {
  try {
    const result = await requestMagicLink(req.body.email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/magic-link/verify', authLimiter, verifyMagicLinkValidation, validate, async (req, res, next) => {
  try {
    const user = await consumeMagicLink(req.body.token, req.ip);
    const session = await issueSession(user, res, { method: 'magic_link', ip: req.ip });
    res.json(session);
  } catch (error) {
    res.status(401).json({ error: `Oops, let's try that again. ${error.message}` });
  }
});

router.post('/refresh', refreshValidation, validate, async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies[env.refreshCookieName];
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const user = await rotateRefreshToken(token);
    const session = await issueSession(user, res, { method: 'refresh', ip: req.ip });
    return res.json({ accessToken: session.accessToken, user: session.user });
  } catch (error) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.body.refreshToken || req.cookies[env.refreshCookieName];
  if (token) {
    try {
      await revokeRefreshToken(token);
    } catch (error) {
      // ignore invalid token during logout
    }
  }

  res.clearCookie(env.refreshCookieName, {
    path: '/api/auth',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production'
  });

  return res.json({ success: true });
});

router.post('/mfa/setup', requireAuth, requirePremium, mfaSetupValidation, validate, async (req, res, next) => {
  try {
    const data = await setupMfa({
      userId: req.user.id,
      email: req.user.email,
      label: req.body.label
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/mfa/verify', requireAuth, requirePremium, mfaVerifyValidation, validate, async (req, res) => {
  try {
    const result = await verifyMfa({
      userId: req.user.id,
      code: req.body.code,
      enable: req.body.enable ?? true
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/mfa/disable', requireAuth, requirePremium, async (req, res, next) => {
  try {
    const result = await disableMfa({ userId: req.user.id });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = { authRouter: router };
