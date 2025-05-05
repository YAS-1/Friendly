import express from 'express';
import { searchUsers, searchPosts } from '../controllers/search.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const searchRoute = express.Router();

// Protected search routes
searchRoute.get('/users', protectRoute, searchUsers);
searchRoute.get('/posts', protectRoute, searchPosts);

export default searchRoute;