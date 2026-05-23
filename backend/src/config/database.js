const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tripmate';

  mongoose.connection.on('connected', () => logger.info(`MongoDB connected: ${uri}`));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

const disconnect = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};

module.exports = { connect, disconnect };
