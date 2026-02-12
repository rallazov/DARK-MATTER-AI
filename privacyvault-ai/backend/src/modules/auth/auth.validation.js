const { body } = require('express-validator');

const requestMagicLinkValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const verifyMagicLinkValidation = [
  body('token').isString().isLength({ min: 10 }).withMessage('Token is required')
];

const refreshValidation = [
  body('refreshToken').optional().isString()
];

const mfaSetupValidation = [
  body('label').optional().isString().isLength({ max: 100 })
];

const mfaVerifyValidation = [
  body('code').isString().isLength({ min: 6, max: 8 }),
  body('enable').optional().isBoolean()
];

module.exports = {
  requestMagicLinkValidation,
  verifyMagicLinkValidation,
  refreshValidation,
  mfaSetupValidation,
  mfaVerifyValidation
};
