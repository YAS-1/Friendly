/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

//Create user account
export const createAccount = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        const Userexists = await User.findOne({email});
        if (Userexists) {
            res.status(400).json({ message: 'User already exists' });
        }

        const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegx.test(email)) {
            res.status(400).json({ message: 'Invalid email format' });
        }

        if(password.length < 6){
            res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (username.length <= 3){
            res.status(400).json({ message: 'Username must be at least 3 characters' });
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

        const token = generateToken(newUser);

        res.status(201).json({message: 'User account created successfully',newUser:{
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profilePhoto: newUser.profilePhoto,
            coverPhoto: newUser.coverPhoto,
            bio: newUser.bio,
            theme: newUser.theme
        },
        token
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
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.status(200).json({message: 'Login successful',user: {
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
    res.status(200).json({ message: 'Logout successful' });
};


//Get current userProfile
export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            res.status(404).json({ message: 'User not found' });
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
        const {UserId} = req.params;

        const user = await User.findById(UserId).select('-password');
        if(!user){
            res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({message: 'User profile fetched successfully',user});
    }
    catch (error){
        console.log(`Error fetching user profile: ${error}`);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};


//Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const {username, email, profilePhoto, coverPhoto, bio, theme} = req.body;

        const user = await User.findById(req.user.id);
        if(!user){
            res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.profilePhoto = profilePhoto || user.profilePhoto;
        user.coverPhoto = coverPhoto || user.coverPhoto;
        user.bio = bio || user.bio;
        user.theme = theme || user.theme;
        await user.save();
        
    } catch (error) {
        console.log(`Error updating user profile: ${error}`);
        res.status(500).json({ message: 'Error updating user profile' });
    }
};