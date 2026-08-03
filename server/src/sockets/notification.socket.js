const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../config/logger');

/**
 * Registers the /notifications namespace. Clients connect with:
 *   io('/notifications', { auth: { token: accessToken } })
 * and join a room named after their own userId. Services emit to `io.to(userId)`
 * to push real-time notifications (see notification.service.js).
 */
function registerNotificationSocket(io) {
  const nsp = io.of('/notifications');

  nsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  nsp.on('connection', (socket) => {
    socket.join(socket.userId);
    logger.debug(`Socket connected for user ${socket.userId}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected for user ${socket.userId}`);
    });
  });

  return nsp;
}

module.exports = registerNotificationSocket;
