import Post from '../models/post.model.js';
import Bookmark from '../models/bookmark.model.js';
import Notification from '../models/notification.model.js';
import Comment from '../models/comment.model.js';

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, hashtags } = req.body;
        const media = req.files ? req.files.map(file => `/Uploads/posts/${file.filename}`) : [];

        const post = new Post({
            user: req.user._id,
            content,
            media,
            hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : []
        });

        await post.save();
        
        // Populate user details
        await post.populate('user', 'username profilePhoto');
        
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message
        });
    }
};

// Helper to add isBookmarked and comments to posts
const enrichPosts = async (posts, userId) => {
    // Get all bookmarks for this user
    const bookmarks = await Bookmark.find({ user: userId });
    const bookmarkedPostIds = new Set(bookmarks.map(b => b.post.toString()));

    // For each post, populate comments and add isBookmarked
    return Promise.all(posts.map(async (post) => {
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');
        // Populate comments with user info
        const comments = await Comment.find({ post: post._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePhoto');
        const postObj = populatedPost.toObject();
        postObj.comments = comments;
        postObj.isBookmarked = bookmarkedPostIds.has(post._id.toString());
        return postObj;
    }));
};

// Get all posts (with pagination)
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();
        const enrichedPosts = await enrichPosts(posts, req.user._id);

        res.status(200).json({
            success: true,
            posts: enrichedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
            error: error.message
        });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        // Populate comments
        const comments = await Comment.find({ post: post._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePhoto');
        // Check if bookmarked
        const isBookmarked = await Bookmark.exists({ user: req.user._id, post: post._id });
        const postObj = post.toObject();
        postObj.comments = comments;
        postObj.isBookmarked = !!isBookmarked;
        res.status(200).json({
            success: true,
            post: postObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching post',
            error: error.message
        });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const { content, hashtags } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user is the post owner
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }

        post.content = content || post.content;
        post.hashtags = hashtags ? hashtags.split(',').map(tag => tag.trim()) : post.hashtags;

        // Handle new media files if any
        if (req.files && req.files.length > 0) {
            const newMedia = req.files.map(file => `/Uploads/posts/${file.filename}`);
            post.media = [...post.media, ...newMedia];
        }

        await post.save();
        await post.populate('user', 'username profilePhoto');

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating post',
            error: error.message
        });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user is the post owner
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        // await post.remove();
        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
            error: error.message
        });
    }
};

// Like/Unlike a post
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex === -1) {
            // Like the post
            post.likes.push(req.user._id);
            
            // Create notification for post like
            if (post.user.toString() !== req.user._id.toString()) {
                await Notification.create({
                    sender: req.user._id,
                    recipient: post.user,
                    type: 'like',
                    post: post._id,
                    read: false
                });
            }
        } else {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        await post.populate('likes', 'username profilePhoto');

        res.status(200).json({
            success: true,
            message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
            likes: post.likes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling like',
            error: error.message
        });
    }
};

// Bookmark/Unbookmark a post
export const toggleBookmark = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        // Check if bookmark exists
        const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

        if (existingBookmark) {
            // Remove bookmark
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            // Remove user from post.bookmarks array
            await Post.findByIdAndUpdate(postId, { $pull: { bookmarks: userId } });
            res.status(200).json({
                success: true,
                message: 'Post unbookmarked'
            });
        } else {
            // Create new bookmark
            const newBookmark = new Bookmark({
                user: userId,
                post: postId
            });
            await newBookmark.save();
            // Add user to post.bookmarks array
            await Post.findByIdAndUpdate(postId, { $addToSet: { bookmarks: userId } });
            res.status(200).json({
                success: true,
                message: 'Post bookmarked'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling bookmark',
            error: error.message
        });
    }
};

// Get user's bookmarked posts
export const getBookmarkedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookmarks = await Bookmark.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'post',
                populate: [
                    { path: 'user', select: 'username profilePhoto' },
                    { path: 'likes', select: 'username profilePhoto' }
                ]
            });

        const total = await Bookmark.countDocuments({ user: req.user._id });

        // Get the posts from bookmarks
        const posts = bookmarks.map(bookmark => bookmark.post);

        // Enrich posts with comments and isBookmarked
        const enrichedPosts = await enrichPosts(posts, req.user._id);

        res.status(200).json({
            success: true,
            bookmarkedPosts: enrichedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBookmarks: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarked posts',
            error: error.message
        });
    }
};

// Get all liked posts
export const getLikedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Determine which user's likes to fetch
        const targetUserId = req.params.userId || req.user._id;

        const posts = await Post.find({ likes: targetUserId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ likes: targetUserId });
        const enrichedPosts = await enrichPosts(posts, req.user._id);

        res.status(200).json({
            success: true,
            likedPosts: enrichedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalLikedPosts: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching liked posts',
            error: error.message
        });
    }
};

// Get all posts of the currently logged in user
export const getMyPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ user: req.user._id });
        const enrichedPosts = await enrichPosts(posts, req.user._id);

        res.status(200).json({
            success: true,
            posts: enrichedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching your posts',
            error: error.message
        });
    }
};

// Get all posts by a specific user
export const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ user: userId });
        const enrichedPosts = await enrichPosts(posts, req.user._id);

        res.status(200).json({
            success: true,
            posts: enrichedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user posts',
            error: error.message
        });
    }
};

// Create a comment on a post
export const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = await Comment.create({
            post: postId,
            user: req.user._id,
            content
        });

        // Push comment reference to post.comments array (if you want to keep a reference)
        // await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

        // Create notification for post comment
        if (post.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                sender: req.user._id,
                recipient: post.user,
                type: 'comment',
                post: postId,
                read: false
            });
        }

        await comment.populate('user', 'username profilePhoto');

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating comment',
            error: error.message
        });
    }
};

// Get all comments for a post
export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePhoto');

        const total = await Comment.countDocuments({ post: postId });

        res.status(200).json({
            success: true,
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalComments: total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};