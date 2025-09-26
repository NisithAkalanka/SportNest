const express = require('express');
const router = express.Router();
const { checkout, getAllOrders, getOrderById } = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

// Public routes
router.post('/checkout', checkout);

// Protected routes (Admin only)
router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;