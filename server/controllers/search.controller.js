import User from '../models/user.model.js';
import Post from '../models/post.model.js';

// Search users by username, name, or email
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password -refreshToken -__v');

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
};

// Search posts by content or hashtags
export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('user', 'username name profilePic')
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Error searching posts' });
  }
};