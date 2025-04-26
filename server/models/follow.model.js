
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const followSchema = new mongoose.Schema({
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'User', // User who is following
        required: true,
      },
      following: {
        type: Schema.Types.ObjectId,
        ref: 'User', // User being followed
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
});

const Follow = mongoose.model('Follow', followSchema);

export default Follow;