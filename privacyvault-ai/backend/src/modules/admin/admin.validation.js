const { body, param } = require('express-validator');

const userActionValidation = [
  param('userId').isMongoId(),
  body('action').isIn(['suspend', 'activate', 'ban'])
];

const featureFlagValidation = [
  body('key').isString().isLength({ min: 2, max: 80 }),
  body('description').optional().isString(),
  body('enabled').isBoolean(),
  body('rolloutPercentage').optional().isInt({ min: 0, max: 100 }),
  body('variant').optional().isString().isLength({ max: 50 })
];

module.exports = { userActionValidation, featureFlagValidation };
