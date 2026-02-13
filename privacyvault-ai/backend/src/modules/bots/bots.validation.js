const { body, param } = require('express-validator');

const createBotValidation = [
  body('vaultId').isMongoId(),
  body('name').isString().isLength({ min: 2, max: 80 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('triggerType').isIn(['cron', 'webhook', 'manual']),
  body('schedulePreset').optional().isIn(['daily', 'weekly', 'custom', 'none']),
  body('cronExpression').optional().isString().isLength({ max: 100 }),
  body('workflowType').optional().isIn(['reminder', 'invoice-payment', 'custom']),
  body('defaultTaskType').optional().isIn(['text', 'image', 'voice', 'video']),
  body('defaultPromptTemplate').optional().isString().isLength({ max: 2000 })
];

const updateBotValidation = [
  param('botId').isMongoId(),
  body('name').optional().isString().isLength({ min: 2, max: 80 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('schedulePreset').optional().isIn(['daily', 'weekly', 'custom', 'none']),
  body('cronExpression').optional().isString().isLength({ max: 100 }),
  body('enabled').optional().isBoolean(),
  body('defaultTaskType').optional().isIn(['text', 'image', 'voice', 'video']),
  body('defaultPromptTemplate').optional().isString().isLength({ max: 2000 })
];

const botIdValidation = [param('botId').isMongoId()];

module.exports = { createBotValidation, updateBotValidation, botIdValidation };
