/* eslint-disable no-unused-vars */
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username profilePhoto')
            .populate('post', 'content media')
            .populate('message', 'content')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { recipient, type, post, message } = req.body;
        const sender = req.user._id;

        // Validate notification type
        if (!['like', 'comment', 'follow', 'message'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }

        // Don't create notification if sender is recipient
        if (sender.toString() === recipient.toString()) {
            return res.status(200).json({
                success: true,
                message: 'Self notification prevented'
            });
        }

        const notification = await Notification.create({
            sender,
            recipient,
            type,
            post: type === 'message' ? null : post,
            message: type === 'message' ? message : null,
            read: false
        });

        const populatedNotification = await notification.populate([
            { path: 'sender', select: 'username profilePhoto' },
            { path: 'post', select: 'content media' },
            { path: 'message', select: 'content' }
        ]);

        res.status(201).json({
            success: true,
            data: populatedNotification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating notification',
            error: error.message
        });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message
        });
    }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting unread count',
            error: error.message
        });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

// Delete all notifications
const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ recipient: userId });

        res.status(200).json({
            success: true,
            message: 'All notifications deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting all notifications',
            error: error.message
        });
    }
};

export {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    deleteAllNotifications
};