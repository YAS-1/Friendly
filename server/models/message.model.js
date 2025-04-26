
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000,
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

const Message = mongoose.model('Message', messageSchema);

export default Message;