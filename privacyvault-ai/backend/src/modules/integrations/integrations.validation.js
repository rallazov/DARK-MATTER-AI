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

const deleteIntegrationByIdValidation = [
  param('id').isMongoId().withMessage('Integration id must be a valid MongoId')
];

module.exports = { createIntegrationValidation, providerValidation, deleteIntegrationByIdValidation };
