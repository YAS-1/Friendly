/* eslint-disable no-unused-vars */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { addMessage, setOnlineUsers, setTyping } from '../store/slices/messageSlice';
import { addNotification } from '../store/slices/notificationSlice';
import socketService from '../services/socket';

export const useSocket = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (currentUser?._id) {
      // Initialize socket connection
      const socket = socketService.initializeSocket(currentUser._id);

      // Clean up on unmount
      return () => {
        socketService.disconnectSocket();
      };
    }
  }, [currentUser]);

  const sendMessage = useCallback((recipientId, content) => {
    socketService.sendMessage(recipientId, content);
  }, []);

  const handleTyping = useCallback((recipientId, isTyping) => {
    socketService.emitTyping(recipientId, isTyping);
  }, []);

  // Event handlers that can be used in components
  const socketHandlers = {
    onMessageReceived: (callback) => {
      if (currentUser?._id) {
        const socket = socketService.initializeSocket(currentUser._id);
        socket.on('receive-message', (message) => {
          dispatch(addMessage(message));
          callback?.(message);
        });
      }
    },
    onNotificationReceived: (callback) => {
      if (currentUser?._id) {
        const socket = socketService.initializeSocket(currentUser._id);
        socket.on('notification', (notification) => {
          dispatch(addNotification(notification));
          callback?.(notification);
        });
      }
    },
    onOnlineUsersUpdate: (callback) => {
      if (currentUser?._id) {
        const socket = socketService.initializeSocket(currentUser._id);
        socket.on('online-users', (users) => {
          dispatch(setOnlineUsers(users));
          callback?.(users);
        });
      }
    },
    onTypingStatus: (callback) => {
      if (currentUser?._id) {
        const socket = socketService.initializeSocket(currentUser._id);
        socket.on('typing', ({ senderId, typing }) => {
          dispatch(setTyping({ userId: senderId, isTyping: typing }));
          callback?.({ senderId, typing });
        });
      }
    },
  };

  return {
    sendMessage,
    handleTyping,
    socketHandlers,
  };
};

export default useSocket;