const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { protect } = require('../middleware/authMiddleware');//////

const { addToCart, getCartItems, removeCartItem, updateCartItemQuantity } = require('../controllers/cartController');

// Cart එකට item එකක් එකතු කරන Route එක
router.post('/add', authMiddleware, addToCart);

// Cart එකේ තියෙන items ටික ලබාගන්නා Route එක
router.get('/', authMiddleware, getCartItems);

// Cart එකෙන් item එකක් ඉවත් කරන Route එක
router.delete('/:id', authMiddleware, removeCartItem);

// ★★★ Quantity එක update කිරීමට අලුත් PUT Route එක

router.put('/:id', authMiddleware, updateCartItemQuantity);

module.exports = router;