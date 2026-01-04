const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware pentru verificarea rolului de administrator
const isAdmin = async (req, res, next) => {
  try {
    console.log('isAdmin middleware - Checking role:', req.user?.role);
    if (!req.user) {
      console.log('isAdmin middleware - No user found');
      return res.status(401).json({
        success: false,
        message: 'Nu ești autentificat'
      });
    }
    if (req.user.role !== 'administrator') {
      console.log('isAdmin middleware - Access denied, role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Acces interzis. Doar administratorii pot accesa această resursă.'
      });
    }
    console.log('isAdmin middleware - Access granted');
    next();
  } catch (error) {
    console.error('isAdmin middleware - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea permisiunilor'
    });
  }
};

// Toate rutele necesita autentificare si rol de administrator
router.use((req, res, next) => {
  console.log('Admin router - Request received:', req.method, req.path);
  next();
});

router.use(auth);

router.use((req, res, next) => {
  console.log('Admin router - After auth middleware, user:', req.user?.email, 'role:', req.user?.role);
  next();
});

router.use(isAdmin);

router.use((req, res, next) => {
  console.log('Admin router - After isAdmin middleware');
  next();
});

router.get('/dashboard/stats', (req, res, next) => {
  console.log('Route /dashboard/stats - Handler called');
  adminController.getDashboardStats(req, res, next);
});
router.get('/bookings', adminController.getBookings);
router.get('/users', adminController.getUsers);
router.get('/trains', adminController.getTrains);

module.exports = router;

