const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash parola înainte de salvare
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodă pentru compararea parolelor
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Verifică dacă parola este hash-uită (bcrypt hash începe cu $2a$, $2b$, $2y$)
    if (this.password.startsWith('$2')) {
      // Compară cu bcrypt
      return await bcrypt.compare(candidatePassword, this.password);
    } else {
      // Parola nu este hash-uită (plain text) - compară direct
      // Aceasta este doar pentru migrare - în producție toate parolele ar trebui să fie hash-uite
      return this.password === candidatePassword;
    }
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);

