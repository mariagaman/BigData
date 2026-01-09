const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {

    const logBody = { ...req.body };
    if (logBody.password) {
      logBody.password = '***';
    }
    console.log('Body:', logBody);
  }
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'RailMate API Server',
    status: 'running',
    version: '1.0.0'
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/trains', require('./routes/trains'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('email firstName lastName role');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/debug/bookings/user/:identifier', async (req, res) => {
  try {
    const Booking = require('./models/Booking');
    const User = require('./models/User');
    const { identifier } = req.params;

    let user;
    if (identifier.includes('@')) {

      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {

      user = await User.findById(identifier);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    const bookings = await Booking.find({ userId: user._id })
      .populate('train', 'trainNumber type from to departureTime arrivalTime price')
      .populate('userId', 'email firstName lastName')
      .sort({ bookingDate: -1 })
      .select('-__v');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/debug/bookings', async (req, res) => {
  try {
    const Booking = require('./models/Booking');
    const bookings = await Booking.find()
      .populate('train', 'trainNumber type from to')
      .populate('userId', 'email firstName lastName')
      .sort({ bookingDate: -1 })
      .limit(50)
      .select('-__v');

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/debug/trains', async (req, res) => {
  try {
    const Train = require('./models/Train');
    const trains = await Train.find()
      .populate('from', 'name city')
      .populate('to', 'name city')
      .populate('route.intermediateStations.station', 'name city')
      .limit(20)
      .select('-wagons');

    res.json({
      success: true,
      count: trains.length,
      trains: trains.map(train => ({
        id: train._id,
        trainNumber: train.trainNumber,
        type: train.type,
        from: train.from?.name || train.from,
        to: train.to?.name || train.to,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        price: train.price,
        hasIntermediateStations: train.route?.intermediateStations?.length > 0,
        intermediateStationsCount: train.route?.intermediateStations?.length || 0,
        intermediateStations: train.route?.intermediateStations?.map(s => ({
          station: s.station?.name || s.station,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime
        })) || []
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/debug/auth-check', async (req, res) => {
  try {
    const auth = require('./middleware/auth');
    const jwt = require('jsonwebtoken');

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.json({
        success: false,
        message: 'No token provided',
        hasToken: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here-change-in-production');
    const User = require('./models/User');
    const user = await User.findById(decoded.userId).select('email firstName lastName _id');

    const Booking = require('./models/Booking');
    const bookingsCount = await Booking.countDocuments({ userId: user._id });

    res.json({
      success: true,
      token: {
        decoded: decoded,
        userId: decoded.userId,
        userIdType: typeof decoded.userId
      },
      user: {
        _id: user._id,
        _idString: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      bookings: {
        count: bookingsCount,
        userId: user._id,
        userIdString: user._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`Server RailMate is running on port ${PORT}`);

  await connectDB();
});

