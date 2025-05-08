import { io } from 'socket.io-client';
import { addMessage } from '../store/slices/messageSlice';
import { addNotification } from '../store/slices/notificationSlice';
import store from '../store/store';

let socket;

export const initializeSocket = (userId) => {
  socket = io('http://localhost:5500', {
    withCredentials: true,
  });

  // Set up the user in the socket connection
  socket.emit('setup', userId);

  // Handle connection
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  // Handle incoming messages
  socket.on('receive-message', (message) => {
    store.dispatch(addMessage(message));
  });

  // Handle notifications
  socket.on('notification', (notification) => {
    store.dispatch(addNotification(notification));
  });

  // Handle online users
  socket.on('online-users', (users) => {
    // Update online users in your state management
    console.log('Online users:', users);
  });

  // Handle typing status
  socket.on('typing', ({ senderId, typing }) => {
    // Update typing status in your state management
    console.log('Typing status:', { senderId, typing });
  });

  // Handle errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const sendMessage = (recipientId, content) => {
  if (socket) {
    socket.emit('send-message', { recipientId, content });
  }
};

export const emitTyping = (recipientId, typing) => {
  if (socket) {
    socket.emit(typing ? 'typing' : 'stop-typing', { recipientId });
  }
};

export default {
  initializeSocket,
  disconnectSocket,
  sendMessage,
  emitTyping,
};