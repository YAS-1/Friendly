
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'message'],
        required: true,
      },
      post: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Relevant post (if applicable)
        default: null,
      },
      message: {
        type: Schema.Types.ObjectId,
        ref: 'Message', // Relevant message (if applicable)
        default: null,
      },
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
});


const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;