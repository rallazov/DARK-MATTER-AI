const mongoose = require('mongoose');
const { env } = require('../config/env');
const { logger } = require('../config/logger');

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    dbName: 'privacyvault_ai'
  });
  logger.info('MongoDB connected');
}

async function disconnectDb() {
  await mongoose.disconnect();
}

module.exports = { connectDb, disconnectDb };
