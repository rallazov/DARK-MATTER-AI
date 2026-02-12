const cron = require('node-cron');
const { BotAutomation } = require('../models/BotAutomation');
const { Task } = require('../models/Task');
const { mockPayInvoice } = require('../providers/paymentProvider');

const jobs = new Map();

async function runBot(bot, io) {
  let output = { message: 'Automation executed.' };

  if (bot.workflowType === 'invoice-payment') {
    output = await mockPayInvoice({ amount: 42.5, accountId: bot.vaultId.toString() });
  }

  const task = await Task.create({
    vaultId: bot.vaultId,
    userId: bot.userId,
    type: 'automation',
    prompt: bot.description || 'Automation run',
    output,
    status: 'completed',
    metadata: { estimatedTimeSavedMinutes: 15 }
  });

  await BotAutomation.findByIdAndUpdate(bot._id, {
    lastRunAt: new Date(),
    lastRunStatus: 'success'
  });

  if (io) {
    io.to(`vault:${bot.vaultId}`).emit('notification', {
      message: `Bot \"${bot.name}\" executed.`,
      taskId: task._id.toString()
    });
  }

  return task;
}

function scheduleBot(bot, io) {
  if (bot.triggerType !== 'cron' || !bot.cronExpression || !bot.enabled) return;

  if (!cron.validate(bot.cronExpression)) return;

  const task = cron.schedule(bot.cronExpression, async () => {
    try {
      await runBot(bot, io);
    } catch (error) {
      await BotAutomation.findByIdAndUpdate(bot._id, { lastRunStatus: 'failed' });
    }
  });

  jobs.set(bot._id.toString(), task);
}

function unscheduleBot(botId) {
  const task = jobs.get(botId.toString());
  if (task) {
    task.stop();
    jobs.delete(botId.toString());
  }
}

async function bootstrapScheduledBots(io) {
  const bots = await BotAutomation.find({ enabled: true, triggerType: 'cron' }).lean();
  bots.forEach((bot) => scheduleBot(bot, io));
}

module.exports = { scheduleBot, unscheduleBot, bootstrapScheduledBots, runBot };
