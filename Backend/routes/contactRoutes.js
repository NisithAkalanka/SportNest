// File: backend/routes/contactRoutes.js

const express = require('express');
const router = express.Router();
const {
  createContactMessage,
  getContactMessages,
  deleteContactMessage
} = require('../controllers/contactController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware'); // ඔබගේ admin middleware එක මෙතන import කරන්න

// Form එක submit කිරීමට ඇති පොදු route එක
router.route('/').post(createContactMessage);

// Admin ට පමණක් අදාළ routes
router.route('/').get(protect, admin, getContactMessages);
router.route('/:id').delete(protect, admin, deleteContactMessage);

module.exports = router;