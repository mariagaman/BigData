const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, method, transactionId } = req.body;
    const userId = req.user._id;

    if (!bookingId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Date incomplete pentru plată'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifică dacă utilizatorul are dreptul să plătească pentru această rezervare
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să plătești pentru această rezervare'
      });
    }

    // Verifică dacă există deja o plată pentru această rezervare
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Există deja o plată pentru această rezervare'
      });
    }

    // Creează plata
    const payment = new Payment({
      bookingId,
      userId,
      amount: booking.totalPrice,
      method,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: 'completed',
      paymentDate: new Date()
    });

    await payment.save();

    // Actualizează statusul rezervării
    booking.paymentStatus = 'completed';
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

    // Verifică dacă utilizatorul are dreptul să vadă această plată
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

