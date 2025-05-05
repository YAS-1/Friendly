import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {
    getMessages,
    sendMessage,
    getUnreadCount,
    getRecentChats,
    deleteMessage
} from '../controllers/message.controller.js';

const messageRoute = express.Router();

// Apply protectRoute middleware to all message routes
messageRoute.use(protectRoute);

// Get messages between users
messageRoute.get('/:recipientId', getMessages);

// Send a new message
messageRoute.post('/send', sendMessage);

// Get unread messages count
messageRoute.get('/unread/count', getUnreadCount);

// Get recent chat list
messageRoute.get('/chats/recent', getRecentChats);

// Delete a message
messageRoute.delete('/:messageId', deleteMessage);

export default messageRoute;