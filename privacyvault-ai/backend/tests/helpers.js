const { signAccessToken, signRefreshToken } = require('../src/utils/jwt');
const { env } = require('../src/config/env');

function authHeaders(user) {
  return {
    Authorization: `Bearer ${signAccessToken(user)}`
  };
}

function refreshCookie(user) {
  const refreshToken = signRefreshToken(user);
  return `${env.refreshCookieName}=${refreshToken}`;
}

module.exports = { authHeaders, refreshCookie };
