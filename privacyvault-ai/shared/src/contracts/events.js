const SOCKET_EVENTS = {
  CONNECTION_READY: 'connection:ready',
  TASK_STREAM_START: 'task:stream:start',
  TASK_STREAM_CHUNK: 'task:stream:chunk',
  TASK_STREAM_END: 'task:stream:end',
  VAULT_UPDATED: 'vault:updated',
  NOTIFICATION: 'notification'
};

module.exports = { SOCKET_EVENTS };
