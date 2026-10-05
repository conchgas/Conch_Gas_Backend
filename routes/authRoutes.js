const express = require('express');
const {
  registerCustomer,
  register,
  login,
  getMe,
  updateProfile,
  getCustomerOrders,
  updatePassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public Customer Auth Endpoints
router.post('/customer/register', registerCustomer);
router.post('/login', login);

// SuperAdmin Staff Creation Endpoint
router.post('/register', protect, authorize('superadmin'), register);

// Private Authenticated User Endpoints (Both Customer and Admin)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/customer/orders', protect, getCustomerOrders);
router.put('/update-password', protect, updatePassword);

module.exports = router;
