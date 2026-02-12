const { Server } = require('socket.io');
const { SOCKET_EVENTS } = require('@privacyvault/shared');
const { verifyAccessToken } = require('../utils/jwt');

function setupSocket(server, corsOrigin) {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.sub, email: payload.email };
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit(SOCKET_EVENTS.CONNECTION_READY, { userId: socket.user.id });

    socket.on('vault:join', ({ vaultId }) => {
      socket.join(`vault:${vaultId}`);
    });

    socket.on('disconnect', () => {
      socket.removeAllListeners();
    });
  });

  return io;
}

module.exports = { setupSocket };
