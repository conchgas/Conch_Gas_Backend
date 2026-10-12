const express = require('express');
const { 
  submitContact, 
  getContacts, 
  getContact, 
  updateContact, 
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/', submitContact);

// Admin / Staff protected routes
router.use(protect, authorize('superadmin', 'admin', 'staff'));
router.get('/', getContacts);
router.get('/:id', getContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
