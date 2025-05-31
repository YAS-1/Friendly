/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { deleteFromCloudinary } from '../utils/cloudinaryUtils.js';
dotenv.config();

//Create user account
export const createAccount = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        const Userexists = await User.findOne({email});
        if (Userexists) {
            res.status(400).json({ message: 'User already exists' });
            console.log('User already exists');
        }

        const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegx.test(email)) {
            res.status(400).json({ message: 'Invalid email format' });
            console.log('Invalid email format');
        }

        if(password.length < 6){
            res.status(400).json({ message: 'Password must be at least 6 characters' });
            console.log('Password must be at least 6 characters');
        }

        if (username.length <= 3){
            res.status(400).json({ message: 'Username must be at least 3 characters' });
            console.log('Username must be at least 3 characters');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profilePhoto: '',
            coverPhoto: '',
            bio: '',
            theme: 'light',
        });
        await newUser.save();

        res.status(201).json({message: 'User account created successfully',newUser:{
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profilePhoto: newUser.profilePhoto,
            coverPhoto: newUser.coverPhoto,
            bio: newUser.bio,
            theme: newUser.theme
        },
        });
    } catch (error) {
        console.log(`Error creating user account: ${error}`);
        res.status(500).json({ message: 'Error creating user account' });
    }
};


//Login controller
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            console.log('Invalid credentials');
        }
        
        // Pass res to generateToken to set the cookie
        const token = generateToken(user._id, res);
        
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto,
                coverPhoto: user.coverPhoto,
                bio: user.bio,
                theme: user.theme
            },
            token
        });
    } catch (error) {
        console.log(`Error logging in: ${error}`);
        res.status(500).json({ message: 'Error logging in' });
    }
};


//Logout controller
export const logout = (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0), // This will make the cookie expire immediately
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protect against CSRF
            path: '/' // Cookie is available for all paths
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            token: null // Explicitly return null token to client
        });
    } catch (error) {
        console.log(`Error logging out: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Error logging out'
        });
    }
};


//Get current userProfile
export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if(!user){
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }

        res.status(200).json({message: 'User profile fetched successfully',user});
    } catch (error) {
        console.log(`Error fetching user profile: ${error}`);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};


//get other user profile
export const getUserProfile = async (req, res) => {
    try {
        // Change from {UserId} to {userId} for consistent naming convention
        const { userId } = req.params;
        
        // Validate the userId input
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).select('-password -__v');
        
        // Add return statement to prevent further execution
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }

        // Format the response data to match your application's needs
        res.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto,
                coverPhoto: user.coverPhoto,
                bio: user.bio,
                theme: user.theme,
                createdAt: user.createdAt
                // Add any other fields you want to return
            }
        });
    }
    catch (error) {
        console.log(`Error fetching user profile: ${error}`);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching user profile' 
        });
    }
};


//Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { username, email, bio, theme } = req.body;
        
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Process uploaded files if they exist
        let profilePhotoPath = user.profilePhoto;
        let coverPhotoPath = user.coverPhoto;
        
        if (req.files) {
            // Handle profile photo upload
            if (req.files.profilePhoto && req.files.profilePhoto.length > 0) {
                // Delete old profile photo if it exists
                if (user.profilePhoto) {
                    await deleteFromCloudinary(user.profilePhoto);
                }
                profilePhotoPath = req.files.profilePhoto[0].path;
                console.log("Profile photo updated:", profilePhotoPath);
            }
            
            // Handle cover photo upload
            if (req.files.coverPhoto && req.files.coverPhoto.length > 0) {
                // Delete old cover photo if it exists
                if (user.coverPhoto) {
                    await deleteFromCloudinary(user.coverPhoto);
                }
                coverPhotoPath = req.files.coverPhoto[0].path;
                console.log("Cover photo updated:", coverPhotoPath);
            }
        }

        // Update user fields
        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.theme = theme || user.theme;
        
        // Update photo fields with new paths or keep existing ones
        user.profilePhoto = profilePhotoPath;
        user.coverPhoto = coverPhotoPath;
        
        // Save updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto,
                coverPhoto: user.coverPhoto,
                bio: user.bio,
                theme: user.theme
            }
        });
        
    } catch (error) {
        console.log(`Error updating user profile:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user profile',
            error: error.message 
        });
    }
};