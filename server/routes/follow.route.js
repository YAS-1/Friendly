import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {
    getSuggestedUsers,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from '../controllers/follow.controller.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protectRoute);

// Get suggested users to follow
router.get('/suggested', getSuggestedUsers);

// Follow/unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get followers/following
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

export default router;