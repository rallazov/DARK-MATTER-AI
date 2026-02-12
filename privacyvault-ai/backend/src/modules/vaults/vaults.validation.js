const { body, param } = require('express-validator');

const createVaultValidation = [
  body('name').isString().isLength({ min: 2, max: 80 }),
  body('theme').optional().isString().isLength({ max: 50 }),
  body('avatar').optional().isString().isLength({ max: 50 })
];

const updateVaultValidation = [
  param('vaultId').isMongoId(),
  body('name').optional().isString().isLength({ min: 2, max: 80 }),
  body('theme').optional().isString().isLength({ max: 50 }),
  body('avatar').optional().isString().isLength({ max: 50 })
];

const vaultIdValidation = [param('vaultId').isMongoId()];

module.exports = {
  createVaultValidation,
  updateVaultValidation,
  vaultIdValidation
};
