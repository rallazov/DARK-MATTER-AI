const { body } = require('express-validator');

const edgeSyncValidation = [
  body('vaultId').isMongoId(),
  body('deviceId').isString().isLength({ min: 2, max: 200 }),
  body('payload').isObject()
];

module.exports = { edgeSyncValidation };
