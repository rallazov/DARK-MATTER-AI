const { body, param } = require('express-validator');

const createBotValidation = [
  body('vaultId').isMongoId(),
  body('name').isString().isLength({ min: 2, max: 80 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('triggerType').isIn(['cron', 'webhook']),
  body('cronExpression').optional().isString().isLength({ max: 100 }),
  body('workflowType').optional().isIn(['reminder', 'invoice-payment', 'custom'])
];

const updateBotValidation = [
  param('botId').isMongoId(),
  body('name').optional().isString().isLength({ min: 2, max: 80 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('cronExpression').optional().isString().isLength({ max: 100 }),
  body('enabled').optional().isBoolean()
];

const botIdValidation = [param('botId').isMongoId()];

module.exports = { createBotValidation, updateBotValidation, botIdValidation };
