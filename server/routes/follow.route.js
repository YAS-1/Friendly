import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {
    getSuggestedUsers,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from '../controllers/follow.controller.js';

const followRoute = express.Router();


// Get suggested users to follow
followRoute.get('/suggested', protectRoute, getSuggestedUsers);

// Follow/unfollow routes
followRoute.post('/followUser/:userId', protectRoute, followUser);
followRoute.delete('/unfollowUser/:userId', protectRoute, unfollowUser);

// Get followers/following
followRoute.get('/followers/:userId', protectRoute, getFollowers);
followRoute.get('/following/:userId', protectRoute, getFollowing);

export default followRoute;