const { SOCKET_EVENTS } = require('@privacyvault/shared');

function emitTaskStream(io, vaultId, taskId, chunks) {
  if (!io) return;
  io.to(`vault:${vaultId}`).emit(SOCKET_EVENTS.TASK_STREAM_START, { taskId });
  chunks.forEach((chunk, index) => {
    io.to(`vault:${vaultId}`).emit(SOCKET_EVENTS.TASK_STREAM_CHUNK, {
      taskId,
      index,
      chunk
    });
  });
  io.to(`vault:${vaultId}`).emit(SOCKET_EVENTS.TASK_STREAM_END, { taskId });
}

function emitVaultUpdated(io, vaultId, payload) {
  if (!io) return;
  io.to(`vault:${vaultId}`).emit(SOCKET_EVENTS.VAULT_UPDATED, payload);
}

function emitNotification(io, vaultId, message) {
  if (!io) return;
  io.to(`vault:${vaultId}`).emit(SOCKET_EVENTS.NOTIFICATION, { message });
}

module.exports = { emitTaskStream, emitVaultUpdated, emitNotification };
