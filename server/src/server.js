const http = require('http');
const { Server } = require('socket.io');

const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');
const registerNotificationSocket = require('./sockets/notification.socket');

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });
  registerNotificationSocket(io);
  app.set('io', io); // controllers/services can access via req.app.get('io')

  const PORT = env.PORT;
  server.listen(PORT, () => {
    logger.info(`🚀 AISSMS Placement Portal API running on port ${PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

start();
