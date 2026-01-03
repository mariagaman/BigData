const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Toate rutele necesită autentificare
router.post('/', auth, paymentController.createPayment);
router.get('/booking/:bookingId', auth, paymentController.getPaymentByBookingId);

module.exports = router;

