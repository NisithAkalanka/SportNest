const express = require('express');
const router = express.Router();
const {
  processEventPayment,
  getEventPayments,
  getAllEventPayments,
  getPaymentDetails,
  processRefund,
  deletePayment
} = require('../controllers/eventPaymentController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// Public routes
router.post('/payment', processEventPayment);

// Protected routes
router.get('/payments/all', auth, adminAuth, getAllEventPayments);
router.get('/:eventId/payments', auth, adminAuth, getEventPayments);
router.get('/payments/:paymentId', auth, getPaymentDetails);
router.put('/payments/:paymentId/refund', auth, adminAuth, processRefund);
router.delete('/payments/:paymentId', auth, adminAuth, deletePayment);

module.exports = router;






