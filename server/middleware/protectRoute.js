// server/middleware/protectRoute.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';     
import dotenv from 'dotenv';
dotenv.config();

const protectRoute = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.jwt) { // Changed from token to jwt
      token = req.cookies.jwt;
    } 
    // Check for token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, please login' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('protectRoute error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, please login' 
    });
  }
};

export default protectRoute;