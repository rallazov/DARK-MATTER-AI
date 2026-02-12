import { io } from 'socket.io-client';

let socket;

export function connectSocket() {
  const token = localStorage.getItem('pvai_access_token');
  if (!token) return null;

  if (!socket) {
    socket = io(import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:8080', {
      auth: { token }
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
