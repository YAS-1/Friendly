import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Get suggested users to follow (4 random users not already followed)
const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get IDs of users already being followed
        const following = await Follow.find({ follower: userId }).select('following');
        const followingIds = following.map(f => f.following);
        followingIds.push(userId); // Add own ID to exclude from suggestions

        // Find random users not being followed
        const suggestedUsers = await User.aggregate([
            { $match: { _id: { $nin: followingIds } } },
            { $sample: { size: 4 } },
            { $project: {
                password: 0,
                email: 0,
                coverPhoto: 0,
                bio: 0,
                theme: 0,
                createdAt: 0,
                updatedAt: 0
            }}
        ]);

        res.status(200).json({
            success: true,
            data: suggestedUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting suggested users',
            error: error.message
        });
    }
};

// Follow a user
const followUser = async (req, res) => {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: 'Already following this user'
            });
        }

        // Create new follow relationship
        const follow = await Follow.create({
            follower: followerId,
            following: followingId
        });

        // Create notification for follow
        await Notification.create({
            sender: followerId,
            recipient: followingId,
            type: 'follow',
            read: false
        });

        res.status(201).json({
            success: true,
            data: follow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error following user',
            error: error.message
        });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;

        const result = await Follow.findOneAndDelete({
            follower: followerId,
            following: followingId
        });

        if (!result) {
            return res.status(400).json({
                success: false,
                message: 'Not following this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully unfollowed user'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unfollowing user',
            error: error.message
        });
    }
};

// Get followers of a user
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;

        const followers = await Follow.find({ following: userId })
            .populate('follower', '-password -email -coverPhoto -bio -theme -createdAt -updatedAt')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: followers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting followers',
            error: error.message
        });
    }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;

        const following = await Follow.find({ follower: userId })
            .populate('following', '-password -email -coverPhoto -bio -theme -createdAt -updatedAt')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: following
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting following users',
            error: error.message
        });
    }
};

// Check if the current user is following a given user
const checkFollowStatus = async (req, res) => {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;

        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });

        res.status(200).json({
            success: true,
            isFollowing: !!existingFollow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking follow status',
            error: error.message
        });
    }
};

export {
    getSuggestedUsers,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus
};