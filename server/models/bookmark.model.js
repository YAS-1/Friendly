
import mongoose, { Schema } from "mongoose";

Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

export default Bookmark;