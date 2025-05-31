import cloudinary from '../config/cloudinary.config.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple approaches to load environment variables
try {
    // First try: relative path
    dotenv.config({ path: './.env' });
    
    // Second try: absolute path
    if (!process.env.MONGO_URI) {
        const envPath = path.join(__dirname, '..', '.env');
        console.log('Trying to load .env from:', envPath);
        dotenv.config({ path: envPath });
    }
    
    // Third try: read file directly
    if (!process.env.MONGO_URI) {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envVars = envContent.split('\n').reduce((acc, line) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    acc[key.trim()] = value.trim();
                }
                return acc;
            }, {});
            process.env = { ...process.env, ...envVars };
        }
    }
} catch (error) {
    console.error('Error loading .env file:', error);
}

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Environment variables loaded:', process.env);
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Function to get the correct file path
const getFilePath = (urlPath) => {
    // Remove leading slash if present
    const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
    return path.join(__dirname, '..', cleanPath);
};

// Function to upload a local file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        console.log(`Attempting to upload: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath}`);
            return null;
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto'
        });
        console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`Error uploading ${filePath} to Cloudinary:`, error);
        return null;
    }
};

// Migrate user profile photos
const migrateUserPhotos = async () => {
    try {
        const users = await User.find({
            $or: [
                { profilePhoto: { $regex: '^/Uploads/' } },
                { coverPhoto: { $regex: '^/Uploads/' } }
            ]
        });

        console.log(`Found ${users.length} users with local photos to migrate`);

        for (const user of users) {
            let updates = {};
            console.log(`Processing user: ${user.username}`);

            if (user.profilePhoto && user.profilePhoto.startsWith('/Uploads/')) {
                const localPath = getFilePath(user.profilePhoto);
                console.log(`Profile photo path: ${localPath}`);
                if (fs.existsSync(localPath)) {
                    const cloudinaryUrl = await uploadToCloudinary(localPath, 'friendly/profiles');
                    if (cloudinaryUrl) {
                        updates.profilePhoto = cloudinaryUrl;
                        console.log(`Updated profile photo URL to: ${cloudinaryUrl}`);
                    }
                }
            }

            if (user.coverPhoto && user.coverPhoto.startsWith('/Uploads/')) {
                const localPath = getFilePath(user.coverPhoto);
                console.log(`Cover photo path: ${localPath}`);
                if (fs.existsSync(localPath)) {
                    const cloudinaryUrl = await uploadToCloudinary(localPath, 'friendly/profiles');
                    if (cloudinaryUrl) {
                        updates.coverPhoto = cloudinaryUrl;
                        console.log(`Updated cover photo URL to: ${cloudinaryUrl}`);
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    { $set: updates },
                    { new: true }
                );
                console.log(`Updated user ${user.username} with new URLs:`, {
                    profilePhoto: updatedUser.profilePhoto,
                    coverPhoto: updatedUser.coverPhoto
                });
            }
        }
    } catch (error) {
        console.error('Error migrating user photos:', error);
        throw error;
    }
};

// Migrate post media
const migratePostMedia = async () => {
    try {
        const posts = await Post.find({
            media: { $regex: '^/Uploads/' }
        });

        console.log(`Found ${posts.length} posts with local media to migrate`);

        for (const post of posts) {
            console.log(`Processing post: ${post._id}`);
            const newMedia = [];
            for (const mediaUrl of post.media) {
                if (mediaUrl.startsWith('/Uploads/')) {
                    const localPath = getFilePath(mediaUrl);
                    console.log(`Media path: ${localPath}`);
                    if (fs.existsSync(localPath)) {
                        const cloudinaryUrl = await uploadToCloudinary(localPath, 'friendly/posts');
                        if (cloudinaryUrl) {
                            newMedia.push(cloudinaryUrl);
                            console.log(`Added new media URL: ${cloudinaryUrl}`);
                        }
                    }
                } else {
                    newMedia.push(mediaUrl);
                }
            }

            if (newMedia.length > 0) {
                const updatedPost = await Post.findByIdAndUpdate(
                    post._id,
                    { $set: { media: newMedia } },
                    { new: true }
                );
                console.log(`Updated post ${post._id} with new media URLs:`, updatedPost.media);
            }
        }
    } catch (error) {
        console.error('Error migrating post media:', error);
        throw error;
    }
};

// Main migration function
export const migrateToCloudinary = async () => {
    console.log('Starting migration to Cloudinary...');
    console.log('Current directory:', __dirname);
    
    try {
        // Connect to MongoDB first
        await connectDB();
        
        // Run migrations
        await migrateUserPhotos();
        await migratePostMedia();
        
        console.log('Migration completed successfully!');
        
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Migration failed:', error);
        // Close MongoDB connection on error
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        throw error;
    }
};

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    migrateToCloudinary()
        .then(() => {
            console.log('Migration script completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
} 