// server/utils/generateToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Generate JWT for a user
const generateToken = (id, res) => {
  // Create payload
  const payload = {
    id
  };
  
  // Sign token
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  // Set cookie
  if (res) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Changed to match logout handler
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/' // Added to ensure cookie is available for all paths
    });
  }
  
  return token;
};

export default generateToken;