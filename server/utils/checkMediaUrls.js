import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkMediaUrls = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        // Check User Photos
        console.log('\nChecking User Photos:');
        const users = await User.find({});
        console.log(`Total users: ${users.length}`);
        
        users.forEach(user => {
            console.log(`\nUser: ${user.username}`);
            if (user.profilePhoto) {
                console.log('Profile Photo:', user.profilePhoto);
            }
            if (user.coverPhoto) {
                console.log('Cover Photo:', user.coverPhoto);
            }
        });

        // Check Post Media
        console.log('\nChecking Post Media:');
        const posts = await Post.find({});
        console.log(`Total posts: ${posts.length}`);
        
        posts.forEach(post => {
            console.log(`\nPost ID: ${post._id}`);
            if (post.media && post.media.length > 0) {
                console.log('Media URLs:', post.media);
            }
        });

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the check
checkMediaUrls(); 