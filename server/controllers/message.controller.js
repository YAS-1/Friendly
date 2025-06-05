import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        })
        .populate('sender', 'username profilePhoto')
        .populate('recipient', 'username profilePhoto')
        .sort('createdAt');

        // Mark messages as read
        await Message.updateMany(
            { sender: recipientId, recipient: senderId, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        // Validate recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        // Create message
        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content
        });

        // Populate sender and recipient details
        await message.populate([
            { path: 'sender', select: 'username profilePhoto' },
            { path: 'recipient', select: 'username profilePhoto' }
        ]);

        // Create notification for new message
        await Notification.create({
            sender: senderId,
            recipient: recipientId,
            type: 'message',
            message: message._id
        });

        // Get socket.io instance
        const io = req.app.get('io');
        
        // Emit to recipient if online
        io.to(recipientId).emit('new-message', message);

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Message.countDocuments({
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

// Get recent chat list
export const getRecentChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get latest message with each user
        const recentMessages = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', userId] },
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    user: {
                        _id: 1,
                        username: 1,
                        profilePhoto: 1
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: recentMessages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recent chats',
            error: error.message
        });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is sender
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.remove();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
};