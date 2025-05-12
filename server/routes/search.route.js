import express from 'express';
import { search } from '../controllers/search.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const searchRoute = express.Router();

// Protected search route
searchRoute.get('/', protectRoute, search);

export default searchRoute;