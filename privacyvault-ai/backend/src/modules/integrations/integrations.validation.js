const { body, param } = require('express-validator');

const createIntegrationValidation = [
  body('vaultId').isMongoId(),
  body('provider').isString().isLength({ min: 2, max: 80 }),
  body('apiKey').isString().isLength({ min: 8, max: 4096 }),
  body('scopes').optional().isArray()
];

const providerValidation = [
  param('provider').isString().isLength({ min: 2, max: 80 })
];

module.exports = { createIntegrationValidation, providerValidation };
