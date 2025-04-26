
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
