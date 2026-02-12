const { body } = require('express-validator');

const resetValidation = [
  body('vaultId').optional().isMongoId(),
  body('confirmText').equals('DELETE').withMessage('confirmText must be DELETE')
];

module.exports = { resetValidation };
