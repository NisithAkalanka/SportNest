// Backend/routes/shippingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
  processShipping, 
  getShippingRates, 
  trackOrder, 
  getUserOrders 
} = require('../controllers/shippingController');

// Process shipping information and create order
router.post('/process', authMiddleware, processShipping);

// Get shipping rates
router.get('/rates', getShippingRates);

// Track order
router.get('/track/:orderId', authMiddleware, trackOrder);

// Get user's orders
router.get('/orders', authMiddleware, getUserOrders);

module.exports = router;
