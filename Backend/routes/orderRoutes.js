const express = require('express');
const router = express.Router();
const { checkout, getAllOrders, getMyOrders, getOrderById } = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

// Public routes
router.post('/checkout', checkout);

// Protected routes
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;