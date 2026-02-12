const crypto = require('crypto');
const { authenticator } = require('otplib');
const { User } = require('../../models/User');
const { UserProgress } = require('../../models/UserProgress');
const { MagicLinkToken } = require('../../models/MagicLinkToken');
const { MfaSecret } = require('../../models/MfaSecret');
const { RevokedToken } = require('../../models/RevokedToken');
const {
  signAccessToken,
  signRefreshToken,
  signMagicLinkToken,
  verifyMagicLinkToken,
  verifyRefreshToken
} = require('../../utils/jwt');
const { sendEmail } = require('../../providers/emailProvider');
const { env } = require('../../config/env');
const { recordAudit } = require('../../middleware/audit');

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  };
}

async function ensureUserBootstrap(user) {
  await UserProgress.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id } },
    { upsert: true, new: true }
  );
}

async function issueSession(user, res, context = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie(env.refreshCookieName, refreshToken, refreshCookieOptions());

  await recordAudit({
    userId: user._id,
    action: 'auth.session_issued',
    metadata: { method: context.method || 'unknown' },
    ip: context.ip
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted
    }
  };
}

async function requestMagicLink(email) {
  const normalized = email.toLowerCase();
  const token = signMagicLinkToken(normalized);
  const expiresAt = new Date(Date.now() + env.magicLinkTtlMinutes * 60 * 1000);

  await MagicLinkToken.create({ email: normalized, token, expiresAt });

  const link = `${env.frontendUrl}/auth/magic?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: normalized,
    subject: 'Your secure PrivacyVault AI magic link',
    html: `<p>Click to sign in:</p><p><a href="${link}">${link}</a></p><p>This link expires in ${env.magicLinkTtlMinutes} minutes.</p>`
  });

  // In development, include link in response when SMTP may not be running (e.g. no Mailpit)
  if (env.nodeEnv === 'development') {
    return { message: 'Magic link sent.', devMagicLink: link };
  }
  return { message: 'Magic link sent.' };
}

async function consumeMagicLink(token, ip) {
  verifyMagicLinkToken(token);

  const magic = await MagicLinkToken.findOne({ token, consumedAt: null });
  if (!magic || magic.expiresAt < new Date()) {
    throw new Error('Magic link expired or invalid');
  }

  const payload = verifyMagicLinkToken(token);
  const email = payload.email.toLowerCase();

  const user = await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
        displayName: email.split('@')[0],
        role: email === env.founderEmail ? 'admin' : 'user',
        plan: 'free'
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  magic.consumedAt = new Date();
  await magic.save();

  await ensureUserBootstrap(user);
  await sendEmail({
    to: email,
    subject: 'Welcome to PrivacyVault AI',
    html: '<p>Welcome! Your private vault is ready.</p>'
  });

  await recordAudit({
    userId: user._id,
    action: 'auth.magic_link_consumed',
    metadata: { email },
    ip
  });

  return user;
}

async function rotateRefreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const revoked = await RevokedToken.findOne({ jti: payload.jti });
  if (revoked) {
    throw new Error('Refresh token already revoked');
  }

  await RevokedToken.create({
    jti: payload.jti,
    userId: payload.sub,
    expiresAt: new Date(payload.exp * 1000)
  });

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active') {
    throw new Error('User not active');
  }

  return user;
}

async function revokeRefreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  await RevokedToken.findOneAndUpdate(
    { jti: payload.jti },
    { jti: payload.jti, userId: payload.sub, expiresAt: new Date(payload.exp * 1000) },
    { upsert: true }
  );
}

async function setupMfa({ userId, email, label }) {
  const issuer = 'PrivacyVaultAI';
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, issuer, secret);

  await MfaSecret.findOneAndUpdate(
    { userId },
    {
      secret,
      enabled: false,
      backupCodes: Array.from({ length: 6 }, () => crypto.randomBytes(4).toString('hex'))
    },
    { upsert: true, new: true }
  );

  return {
    otpauth,
    secret,
    label: label || issuer
  };
}

async function verifyMfa({ userId, code, enable }) {
  const mfa = await MfaSecret.findOne({ userId });
  if (!mfa) throw new Error('MFA setup not found');

  const isValid = authenticator.verify({ token: code, secret: mfa.secret });
  if (!isValid) {
    throw new Error('Invalid TOTP code');
  }

  if (enable) {
    mfa.enabled = true;
    await mfa.save();
  }

  return { valid: true, enabled: mfa.enabled };
}

async function disableMfa({ userId }) {
  await MfaSecret.findOneAndDelete({ userId });
  return { disabled: true };
}

module.exports = {
  issueSession,
  requestMagicLink,
  consumeMagicLink,
  rotateRefreshToken,
  revokeRefreshToken,
  setupMfa,
  verifyMfa,
  disableMfa,
  refreshCookieOptions,
  ensureUserBootstrap
};
