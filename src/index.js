const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Socket = require('./services/socket.service');

const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { createSocketServer } = require('./config/socket');

let server;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3033', 'https://dev-admin.restoap.com', 'https://admin.restoap.com'],
  },
});
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  httpServer.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

createSocketServer(io);

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
