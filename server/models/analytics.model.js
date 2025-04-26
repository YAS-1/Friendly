
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AnalyticsSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One analytics record per user
    },
    totalPosts: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0, // Total likes received on all posts
    },
    totalComments: {
      type: Number,
      default: 0, // Total comments received
    },
    followerGrowth: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 }, // Daily follower count
    }],
    profileViews: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

export default Analytics;