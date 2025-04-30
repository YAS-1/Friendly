// server/middleware/protectRoute.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';     
import dotenv from 'dotenv';
dotenv.config();

const protectRoute = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // Check for token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    console.log('ProtectedRoute - Token Received:', token);
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('ProtectedRoute - Token Verified:', decoded);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('protectRoute error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(401).json({ message: 'Authorization error' });
  }
};

export default protectRoute;