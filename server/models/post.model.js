import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: function() {
            return !this.media || this.media.length === 0;
        },
        maxlength: 1000, // Text content of the post
    },
    media: [{
        type: String, // URLs to images/videos
        default: [],
    }],
    hashtags: [{
        type: String, // Extracted hashtags (e.g., '#FriendlyApp')
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User', // Users who liked the post
    }],
    bookmarks: [{
        type: Schema.Types.ObjectId,
        ref: 'User', // Users who bookmarked the post
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model('Post', postSchema);

export default Post;
