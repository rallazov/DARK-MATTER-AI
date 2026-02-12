const http = require('http');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { connectDb } = require('./db/connection');
const { createApp } = require('./app');
const { setupSocket } = require('./realtime/socket');
const { configurePassport } = require('./config/passport');
const { bootstrapScheduledBots } = require('./services/botScheduler');

async function bootstrap() {
  await connectDb();
  configurePassport();

  const app = createApp();
  const server = http.createServer(app);
  const io = setupSocket(server, env.frontendUrl);
  app.set('io', io);

  await bootstrapScheduledBots(io);

  server.listen(env.port, () => {
    logger.info(`PrivacyVault backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Bootstrap failure', error);
  process.exit(1);
});
