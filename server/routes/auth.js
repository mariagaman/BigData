const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);

router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, authController.updateUser);
router.put('/change-password', auth, authController.changePassword);
router.delete('/me', auth, authController.deleteUser);

module.exports = router;

