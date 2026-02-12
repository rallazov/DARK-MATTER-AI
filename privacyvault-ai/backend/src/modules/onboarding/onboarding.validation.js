const { body } = require('express-validator');

const completeOnboardingValidation = [
  body('vaultName').isString().isLength({ min: 2, max: 80 }),
  body('theme').optional().isString().isLength({ max: 50 }),
  body('avatar').optional().isString().isLength({ max: 50 }),
  body('preferences').optional().isObject()
];

module.exports = { completeOnboardingValidation };
