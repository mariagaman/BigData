const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Suma este obligatorie'],
    min: [0, 'Suma nu poate fi negativă']
  },
  currency: {
    type: String,
    default: 'RON',
    uppercase: true
  },
  method: {
    type: String,
    enum: ['card', 'paypal', 'transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  paymentDate: {
    type: Date
  },
  refundDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: [0, 'Suma de rambursare nu poate fi negativă']
  }
}, {
  timestamps: true
});

// Indexuri (bookingId și transactionId au deja index din unique: true)
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

