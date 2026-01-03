const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Station = require('../models/Station');
const Payment = require('../models/Payment');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { trainId, passengers, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!trainId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date incomplete pentru rezervare'
      });
    }

    const train = await Train.findById(trainId)
      .populate('from', 'name')
      .populate('to', 'name');

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Tren negăsit'
      });
    }

    // Calculează prețul total
    const totalPrice = train.price * passengers.length;

    // Creează snapshot-ul trenului
    const trainSnapshot = {
      trainNumber: train.trainNumber,
      type: train.type,
      from: train.from.name,
      to: train.to.name,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price
    };

    // Creează rezervarea
    const booking = new Booking({
      userId,
      train: trainId,
      trainSnapshot,
      passengers,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'pending',
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    // Generează QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.bookingNumber)}`;
    booking.qrCode = qrCodeUrl;
    await booking.save();

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        train: trainSnapshot,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        status: booking.status,
        qrCode: booking.qrCode
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea rezervării'
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const bookings = await Booking.find({ userId })
      .populate('train')
      .sort({ bookingDate: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      train: {
        trainNumber: booking.trainSnapshot.trainNumber,
        type: booking.trainSnapshot.type,
        from: booking.trainSnapshot.from,
        to: booking.trainSnapshot.to,
        departureTime: booking.trainSnapshot.departureTime,
        arrivalTime: booking.trainSnapshot.arrivalTime
      },
      passengers: booking.passengers,
      totalPrice: booking.totalPrice,
      status: booking.status,
      bookingDate: booking.bookingDate,
      qrCode: booking.qrCode
    }));

    res.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea rezervărilor'
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('train')
      .populate('userId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifică dacă utilizatorul are dreptul să vadă această rezervare
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să accesezi această rezervare'
      });
    }

    const formattedBooking = {
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      train: {
        trainNumber: booking.trainSnapshot.trainNumber,
        type: booking.trainSnapshot.type,
        from: booking.trainSnapshot.from,
        to: booking.trainSnapshot.to,
        departureTime: booking.trainSnapshot.departureTime,
        arrivalTime: booking.trainSnapshot.arrivalTime
      },
      passengers: booking.passengers,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate,
      qrCode: booking.qrCode
    };

    res.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea rezervării'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifică dacă utilizatorul are dreptul să anuleze această rezervare
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să anulezi această rezervare'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Rezervarea este deja anulată'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    await booking.save();

    // Actualizează și plata dacă există
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment && payment.status === 'completed') {
      payment.status = 'refunded';
      payment.refundDate = new Date();
      payment.refundAmount = payment.amount;
      await payment.save();
    }

    res.json({
      success: true,
      message: 'Rezervare anulată cu succes',
      booking: {
        id: booking._id,
        status: booking.status,
        cancellationDate: booking.cancellationDate
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea rezervării'
    });
  }
};

