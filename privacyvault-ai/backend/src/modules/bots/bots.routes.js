const crypto = require('crypto');
const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { recordAudit } = require('../../middleware/audit');
const { BotAutomation } = require('../../models/BotAutomation');
const { assertVaultAccess } = require('../common/vaultAccess');
const { scheduleBot, unscheduleBot, runBot } = require('../../services/botScheduler');
const { createBotValidation, updateBotValidation, botIdValidation } = require('./bots.validation');

// TODO: extract to microservice (bot-service boundary)
const router = express.Router();

function deriveCronExpression({ triggerType, schedulePreset, cronExpression }) {
  if (triggerType !== 'cron') return undefined;
  if (schedulePreset === 'daily') return '0 9 * * *';
  if (schedulePreset === 'weekly') return '0 9 * * 1';
  if (schedulePreset === 'custom') return cronExpression;
  return cronExpression;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.vaultId) query.vaultId = req.query.vaultId;
    const items = await BotAutomation.find(query).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, createBotValidation, validate, async (req, res, next) => {
  try {
    const access = await assertVaultAccess({ userId: req.user.id, vaultId: req.body.vaultId, minRole: 'editor' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const derivedCron = deriveCronExpression({
      triggerType: req.body.triggerType,
      schedulePreset: req.body.schedulePreset || 'none',
      cronExpression: req.body.cronExpression
    });

    const bot = await BotAutomation.create({
      vaultId: req.body.vaultId,
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      triggerType: req.body.triggerType,
      schedulePreset: req.body.schedulePreset || (req.body.triggerType === 'cron' ? 'custom' : 'none'),
      cronExpression: derivedCron,
      webhookSecret: req.body.triggerType === 'webhook' ? crypto.randomBytes(24).toString('hex') : undefined,
      workflowType: req.body.workflowType || 'custom',
      defaultTaskType: req.body.defaultTaskType || 'text',
      defaultPromptTemplate: req.body.defaultPromptTemplate || ''
    });

    scheduleBot(bot, req.app.get('io'));

    await recordAudit({
      userId: req.user.id,
      vaultId: req.body.vaultId,
      action: 'bot.created',
      metadata: { botId: bot._id, triggerType: bot.triggerType },
      ip: req.ip
    });

    res.status(201).json(bot);
  } catch (error) {
    next(error);
  }
});

router.patch('/:botId', requireAuth, updateBotValidation, validate, async (req, res, next) => {
  try {
    const bot = await BotAutomation.findOne({ _id: req.params.botId, userId: req.user.id });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const derivedCron = deriveCronExpression({
      triggerType: bot.triggerType,
      schedulePreset: req.body.schedulePreset || bot.schedulePreset,
      cronExpression: req.body.cronExpression || bot.cronExpression
    });

    Object.assign(bot, {
      ...(req.body.name ? { name: req.body.name } : {}),
      ...(req.body.description ? { description: req.body.description } : {}),
      ...(req.body.schedulePreset ? { schedulePreset: req.body.schedulePreset } : {}),
      ...(derivedCron ? { cronExpression: derivedCron } : {}),
      ...(req.body.enabled !== undefined ? { enabled: req.body.enabled } : {}),
      ...(req.body.defaultTaskType ? { defaultTaskType: req.body.defaultTaskType } : {}),
      ...(req.body.defaultPromptTemplate !== undefined ? { defaultPromptTemplate: req.body.defaultPromptTemplate } : {})
    });

    await bot.save();
    unscheduleBot(bot._id);
    scheduleBot(bot, req.app.get('io'));

    res.json(bot);
  } catch (error) {
    next(error);
  }
});

router.post('/:botId/run', requireAuth, botIdValidation, validate, async (req, res, next) => {
  try {
    const bot = await BotAutomation.findOne({ _id: req.params.botId, userId: req.user.id });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const task = await runBot(bot, req.app.get('io'));
    res.json({ success: true, taskId: task._id });
  } catch (error) {
    next(error);
  }
});

router.delete('/:botId', requireAuth, botIdValidation, validate, async (req, res, next) => {
  try {
    const bot = await BotAutomation.findOneAndDelete({ _id: req.params.botId, userId: req.user.id });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    unscheduleBot(bot._id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = { botsRouter: router };
