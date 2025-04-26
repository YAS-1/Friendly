
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6, // Hashed with bcrypt in backend
      },
      profilePhoto: {
        type: String,
        default: '', // URL to profile photo; empty if not set
      },
      coverPhoto: {
        type: String,
        default: '', // URL to cover photo; empty if not set
      },
      bio: {
        type: String,
        default: '',
        maxlength: 160, // Short bio for profile
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light', // For Dark Mode/Light Mode Toggle
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    });


    const User = mongoose.model('User', userSchema);

    export default User;

