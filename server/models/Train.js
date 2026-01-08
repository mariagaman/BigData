const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true
  }
}, { _id: false });

const wagonSchema = new mongoose.Schema({
  wagonNumber: {
    type: Number,
    required: true
  },
  wagonType: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seats: [seatSchema]
}, { _id: false });

const intermediateStationSchema = new mongoose.Schema({
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  stopDuration: {
    type: Number,
    required: true
  },
  distanceFromStart: {
    type: Number,
    required: true
  }
}, { _id: false });

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  date: {
    type: Date,
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
  },
  totalSeats: {
    type: Number,
    required: true
  },
  stops: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String
  }],
  wagons: [wagonSchema],
  route: {
    intermediateStations: [intermediateStationSchema]
  }
}, {
  timestamps: true
});

trainSchema.index({ from: 1, to: 1, departureTime: 1 });
trainSchema.index({ trainNumber: 1 });
trainSchema.index({ date: 1 });
trainSchema.index({ departureTime: 1 });

module.exports = mongoose.model('Train', trainSchema);

