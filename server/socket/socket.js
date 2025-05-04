
import { Server } from 'socket.io';
import Message from '../models/message.model.js';
import Notification from '../models/notification.model.js';

let onlineUsers = new Map();

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        },
        pingTimeout: 60000
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Setup user's online status
        socket.on('setup', (userId) => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            io.emit('online-users', Array.from(onlineUsers.keys()));
            console.log('User setup complete:', userId);
        });

        // Handle private messaging
        socket.on('send-message', async (messageData) => {
            const { recipientId, content } = messageData;
            const senderId = socket.userId;

            try {
                // Save message to database
                const newMessage = await Message.create({
                    sender: senderId,
                    recipient: recipientId,
                    content
                });

                // Create notification for new message
                await Notification.create({
                    sender: senderId,
                    recipient: recipientId,
                    type: 'message',
                    message: newMessage._id,
                    read: false
                });

                // Populate sender details
                await newMessage.populate('sender', 'username profilePhoto');

                // Send to recipient if online
                io.to(recipientId).emit('receive-message', newMessage);

                // Send back to sender
                socket.emit('message-sent', newMessage);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message-error', { error: error.message });
            }
        });

        // Handle typing status
        socket.on('typing', (data) => {
            io.to(data.recipientId).emit('typing', {
                senderId: socket.userId,
                typing: true
            });
        });

        socket.on('stop-typing', (data) => {
            io.to(data.recipientId).emit('stop-typing', {
                senderId: socket.userId,
                typing: false
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit('online-users', Array.from(onlineUsers.keys()));
            }
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export default setupSocket;