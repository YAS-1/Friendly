
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HashtagSchema = new Schema({
    hashtag: {
      type: String,
      required: true,
      unique: true, // e.g., '#FriendlyApp'
    },
    posts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post', // Posts using this hashtag
    }],
    count: {
      type: Number,
      default: 0, // Number of posts using this hashtag
    },
    lastUsed: {
      type: Date,
      default: Date.now, // For sorting trending hashtags
    },
  });

const Hashtag = mongoose.model('Hashtag', HashtagSchema);

export default Hashtag;