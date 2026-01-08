const mongoose = require('mongoose');

const trainSnapshotSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const passengerSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  wagonNumber: {
    type: Number,
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true
  },
  trainSnapshot: trainSnapshotSchema,
  passengers: [passengerSchema],
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['finalizat', 'rambursat', 'anulat'],
    default: 'finalizat'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Prețul nu poate fi negativ']
  },
  status: {
    type: String,
    enum: ['confirmata', 'anulata'],
    default: 'confirmata'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

bookingSchema.index({ userId: 1, status: 1, bookingDate: -1 });
bookingSchema.index({ train: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: -1 });

bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = `RAILMATE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

