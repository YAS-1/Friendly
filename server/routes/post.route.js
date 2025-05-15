import express from 'express';
import protectRoute  from '../middleware/protectRoute.js';
import upload from '../config/postMulter.config.js';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    toggleBookmark,
    getBookmarkedPosts,
    getLikedPosts,
    getUserPosts,
    getMyPosts,
    createComment,
    getPostComments
} from '../controllers/post.controller.js';

const postsRouter = express.Router();

// Apply protectRoute middleware to all routes
postsRouter.use(protectRoute);

// Post CRUD routes
postsRouter.post('/', upload.array('media', 5), createPost);
postsRouter.get('/', getAllPosts);
postsRouter.get('/:id', getPostById);
postsRouter.put('/updatePost/:id', upload.array('media', 5), updatePost);
postsRouter.delete('/deletePost/:id', deletePost);

// Comment routes
postsRouter.post('/:postId/comments', createComment);

// fetch all posts of logged in user
postsRouter.get('/me', getMyPosts);
// fetch all posts of a user by userId
postsRouter.get('/user/:userId', getUserPosts);

// Post interaction routes
postsRouter.post('/:id/like', toggleLike);
postsRouter.post('/:id/bookmark', toggleBookmark);
postsRouter.get('/bookmarks/me', getBookmarkedPosts);
postsRouter.get('/likes/me', getLikedPosts);
postsRouter.get('/likes/user/:userId', getLikedPosts);

export default postsRouter;