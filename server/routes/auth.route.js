import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import upload from '../config/Usermulter.config.js';
import { createAccount, getCurrentUserProfile, getUserProfile, login, logout, updateUserProfile } from '../controllers/auth.controller.js';


const authRoute = express.Router();

authRoute.post('/createAccount', createAccount);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.get('/myProfile', protectRoute, getCurrentUserProfile);
authRoute.get('/profile/:userId', protectRoute, getUserProfile);
authRoute.put('/updateProfile', protectRoute, upload.fields([{name: 'profilePhoto', maxCount: 1}, {name: 'coverPhoto', maxCount: 1}]), updateUserProfile);

export default authRoute;