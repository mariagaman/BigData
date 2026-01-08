const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Starting for path:', req.path);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({
        success: false,
        message: 'Token de autentificare lipsă'
      });
    }

    console.log('Auth middleware - Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here-change-in-production');
    console.log('Auth middleware - Token decoded, userId:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('Auth middleware - User not found');
      return res.status(401).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    req.user = user;
    console.log('Auth middleware - user authenticated:', user.email, 'userId:', user._id, 'role:', user.role);
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token invalid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = auth;

