import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    deleteAllNotifications
} from '../controllers/notifications.controller.js';

const notificationRoute = express.Router();

// Apply protectRoute middleware to all notification routes
notificationRoute.use(protectRoute);

// Get all notifications and unread count
notificationRoute.get('/', getNotifications);
notificationRoute.get('/unread/count', getUnreadCount);

// Create a new notification
notificationRoute.post('/', createNotification);

// Mark notifications as read
notificationRoute.patch('/read/:notificationId', markAsRead);
notificationRoute.patch('/read-all', markAllAsRead);

// Delete notifications
notificationRoute.delete('/:notificationId', deleteNotification);
notificationRoute.delete('/', deleteAllNotifications);

export default notificationRoute;