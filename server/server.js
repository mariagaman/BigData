const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware pentru debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Nu logăm parola completă pentru securitate
    const logBody = { ...req.body };
    if (logBody.password) {
      logBody.password = '***';
    }
    console.log('Body:', logBody);
  }
  next();
});

// Rute de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'RailMate API Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Rute API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/trains', require('./routes/trains'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));

// Endpoint temporar pentru debugging - listează utilizatorii
app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('email firstName lastName role');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Port
const PORT = process.env.PORT || 5001;

// Pornește serverul și conectează baza de date
app.listen(PORT, async () => {
  console.log(`🚂 Server RailMate rulează pe portul ${PORT}`);
  // Conectare la baza de date după ce serverul pornește
  await connectDB();
});

