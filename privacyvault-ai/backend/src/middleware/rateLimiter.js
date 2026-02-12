const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Rate limit exceeded. Please retry shortly.'
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please wait a few minutes.'
});

module.exports = { apiLimiter, authLimiter };
