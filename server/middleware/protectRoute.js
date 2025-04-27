// server/middleware/protectRoute.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';     
import dotenv from 'dotenv';

dotenv.config();

const protectRoute = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }

    // Fetch user from database (optional, but useful for routes needing user details)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user; // Includes _id, username, email, etc.
    next(); // Proceed to the protected route
  } catch (err) {
    console.error('protectRoute error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(401).json({ message: 'Authorization error' });
  }
};

module.exports = protectRoute;