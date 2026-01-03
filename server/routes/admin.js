const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware pentru verificarea rolului de administrator
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis. Doar administratorii pot accesa această resursă.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea permisiunilor'
    });
  }
};

// Toate rutele necesită autentificare și rol de administrator
router.use(auth);
router.use(isAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/bookings', adminController.getBookings);
router.get('/users', adminController.getUsers);
router.get('/trains', adminController.getTrains);

module.exports = router;

