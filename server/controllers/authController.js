const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generare token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-here-change-in-production', {
    expiresIn: '7d'
  });
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Te rugăm să completezi email-ul și parola'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${email.toLowerCase()}`);
      return res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă'
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for email: ${email.toLowerCase()}`);
      return res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă'
      });
    }

    // Dacă parola nu este hash-uită dar este corectă, hash-uiește-o acum
    if (!user.password.startsWith('$2')) {
      console.log('Password is not hashed, hashing now for user:', user.email);
      user.password = password; // Va fi hash-uită de pre('save')
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Eroare la autentificare',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Te rugăm să completezi toate câmpurile obligatorii'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parola trebuie să aibă minim 6 caractere'
      });
    }

    // Verifică dacă utilizatorul există deja
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilizator cu acest email există deja'
      });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone: phone || ''
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la înregistrare'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea datelor utilizatorului'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea datelor utilizatorului'
    });
  }
};

