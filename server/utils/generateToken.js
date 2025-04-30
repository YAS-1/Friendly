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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }
  
  return token;
};

export default generateToken;