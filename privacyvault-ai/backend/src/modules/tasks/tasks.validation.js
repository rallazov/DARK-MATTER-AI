const { body, param, query } = require('express-validator');

const createTaskValidation = [
  body('vaultId').isMongoId(),
  body('type').optional().isIn(['text', 'image', 'voice', 'video', 'automation']),
  body('prompt').optional().isString().isLength({ max: 10000 })
];

const updateTaskValidation = [
  param('taskId').isMongoId(),
  body('prompt').optional().isString().isLength({ max: 10000 }),
  body('status').optional().isIn(['queued', 'processing', 'completed', 'failed'])
];

const taskIdValidation = [param('taskId').isMongoId()];

const listTaskValidation = [
  query('vaultId').optional().isMongoId(),
  query('status').optional().isIn(['queued', 'processing', 'completed', 'failed']),
  query('search').optional().isString().isLength({ max: 200 })
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  listTaskValidation
};
