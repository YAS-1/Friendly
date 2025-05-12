import User from '../models/user.model.js';
import Post from '../models/post.model.js';

// Search users, posts, and hashtags
export const search = async (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = {
      users: [],
      posts: [],
      hashtags: []
    };

    // Search users if type is 'all' or 'users'
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .select('-password -refreshToken -__v')
      .limit(type === 'all' ? 5 : 20);

      results.users = users;
    }

    // Search posts if type is 'all' or 'posts'
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { hashtags: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('user', 'username name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(type === 'all' ? 3 : 20);

      results.posts = posts;
    }

    // Search hashtags if type is 'all' or 'hashtags'
    if (type === 'all' || type === 'hashtags') {
      const hashtagRegex = new RegExp(`#${query}`, 'i');
      const postsWithHashtags = await Post.find({
        hashtags: hashtagRegex
      });

      // Extract unique hashtags and their counts
      const hashtagCounts = {};
      postsWithHashtags.forEach(post => {
        post.hashtags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          }
        });
      });

      const hashtags = Object.entries(hashtagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, type === 'all' ? 10 : 50);

      results.hashtags = hashtags;
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
};