import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixMediaUrls = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        // Fix User Photos
        console.log('\nFixing User Photos:');
        const users = await User.find({
            $or: [
                { profilePhoto: { $regex: '^/Uploads/' } },
                { coverPhoto: { $regex: '^/Uploads/' } }
            ]
        });

        console.log(`Found ${users.length} users with local photos to fix`);

        for (const user of users) {
            let updates = {};
            console.log(`\nProcessing user: ${user.username}`);

            if (user.profilePhoto && user.profilePhoto.startsWith('/Uploads/')) {
                const localPath = path.join(__dirname, '..', user.profilePhoto);
                if (fs.existsSync(localPath)) {
                    const result = await cloudinary.uploader.upload(localPath, {
                        folder: 'friendly/profiles'
                    });
                    updates.profilePhoto = result.secure_url;
                    console.log(`Updated profile photo URL to: ${result.secure_url}`);
                }
            }

            if (user.coverPhoto && user.coverPhoto.startsWith('/Uploads/')) {
                const localPath = path.join(__dirname, '..', user.coverPhoto);
                if (fs.existsSync(localPath)) {
                    const result = await cloudinary.uploader.upload(localPath, {
                        folder: 'friendly/profiles'
                    });
                    updates.coverPhoto = result.secure_url;
                    console.log(`Updated cover photo URL to: ${result.secure_url}`);
                }
            }

            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, { $set: updates });
                console.log(`Updated user ${user.username}`);
            }
        }

        // Fix Post Media
        console.log('\nFixing Post Media:');
        const posts = await Post.find({
            media: { $regex: '^/Uploads/' }
        });

        console.log(`Found ${posts.length} posts with local media to fix`);

        for (const post of posts) {
            console.log(`\nProcessing post: ${post._id}`);
            const newMedia = [];
            
            for (const mediaUrl of post.media) {
                if (mediaUrl.startsWith('/Uploads/')) {
                    const localPath = path.join(__dirname, '..', mediaUrl);
                    if (fs.existsSync(localPath)) {
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: 'friendly/posts',
                            resource_type: 'auto'
                        });
                        newMedia.push(result.secure_url);
                        console.log(`Updated media URL to: ${result.secure_url}`);
                    }
                } else {
                    newMedia.push(mediaUrl);
                }
            }

            if (newMedia.length > 0) {
                await Post.findByIdAndUpdate(post._id, { $set: { media: newMedia } });
                console.log(`Updated post ${post._id}`);
            }
        }

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the fix
fixMediaUrls(); 