const express = require('express');
const router = express.Router();
const {
  logPreOrderPayment,
  getPreOrderPayments,
  getPaymentDetails,
  getAllPreOrderPaymentsForFinancial
} = require('../controllers/preOrderPaymentController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(auth);
router.use(adminAuth);

// Routes
router.post('/', logPreOrderPayment);
router.get('/', getPreOrderPayments);
router.get('/financial/all', getAllPreOrderPaymentsForFinancial);
router.get('/:id', getPaymentDetails);

module.exports = router;
