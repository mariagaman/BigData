const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, method, transactionId } = req.body;
    const userId = req.user._id;

    console.log('Create payment - bookingId:', bookingId, 'type:', typeof bookingId);

    if (!bookingId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Date incomplete pentru plată'
      });
    }

    // Convertește bookingId la string si verifica daca este ObjectId valid
    const mongoose = require('mongoose');
    let bookingIdObj;
    
    try {
      // Convertește la string
      bookingIdObj = String(bookingId);
      
      // Verifica daca este un ObjectId valid (24 caractere hex)
      if (!mongoose.Types.ObjectId.isValid(bookingIdObj)) {
        console.error('Invalid ObjectId:', bookingIdObj, 'type:', typeof bookingId);
        console.error('BookingId length:', bookingIdObj.length, 'expected: 24');
        
        // Daca este un numar (timestamp), inseamna ca nu este ObjectId valid
        if (typeof bookingId === 'number' || !isNaN(Number(bookingId))) {
          return res.status(400).json({
            success: false,
            message: 'ID-ul rezervării este invalid. Te rugăm să reîncerci procesul de rezervare.'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'ID-ul rezervării este invalid'
        });
      }
    } catch (error) {
      console.error('Error validating bookingId:', error);
      return res.status(400).json({
        success: false,
        message: 'ID-ul rezervării este invalid'
      });
    }

    console.log('Looking for booking with ID:', bookingIdObj);
    let booking = await Booking.findById(bookingIdObj);
    
    if (!booking) {
      console.error('Booking not found with ID:', bookingIdObj);
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifica daca utilizatorul are dreptul sa plateasca pentru aceasta rezervare
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să plătești pentru această rezervare'
      });
    }

    // Verifica daca exista deja o plata pentru aceasta rezervare
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Există deja o plată pentru această rezervare'
      });
    }

    // Creeaza plata
    const payment = new Payment({
      bookingId,
      userId,
      amount: booking.totalPrice,
      method,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: 'finalizat',
      paymentDate: new Date()
    });

    await payment.save();

    // Actualizeaza statusul rezervarii
    booking.paymentStatus = 'finalizat';
    await booking.save();

    res.status(201).json({
      success: true,
      payment: {
        id: payment._id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la procesarea plății'
    });
  }
};

// Get payment by booking ID
exports.getPaymentByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findOne({ bookingId })
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Plată negăsită'
      });
    }

    // Verifica daca utilizatorul are dreptul sa vada aceasta plata
    if (payment.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să accesezi această plată'
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea plății'
    });
  }
};

