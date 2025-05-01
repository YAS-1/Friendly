import Post from '../models/post.model.js';
import Bookmark from '../models/bookmark.model.js';

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

// Get all posts (with pagination)
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');

        const total = await Post.countDocuments();

        res.status(200).json({
            success: true,
            posts,
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

        res.status(200).json({
            success: true,
            post
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

        await post.remove();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
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

        res.status(200).json({
            success: true,
            bookmarkedPosts: bookmarks.map(bookmark => bookmark.post),
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

        const posts = await Post.find({ likes: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');

        const total = await Post.countDocuments({ likes: req.user._id });

        res.status(200).json({
            success: true,
            likedPosts: posts,
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
            .limit(limit)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');

        const total = await Post.countDocuments({ user: req.user._id });

        res.status(200).json({
            success: true,
            posts,
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
            .limit(limit)
            .populate('user', 'username profilePhoto')
            .populate('likes', 'username profilePhoto');

        const total = await Post.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            posts,
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