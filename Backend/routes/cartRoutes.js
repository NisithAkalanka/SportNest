const express = require('express');
const router = express.Router();

// අපි අවශ්‍ය functions දෙකම එකම පේළියකින් මෙතැනදී import කරගන්නවා
const { addToCart, getCartItems, removeCartItem, updateCartItemQuantity } = require('../controllers/cartController');

// Cart එකට item එකක් එකතු කරන Route එක
router.post('/add', addToCart);

// Cart එකේ තියෙන items ටික ලබාගන්නා Route එක
router.get('/', getCartItems);

// Cart එකෙන් item එකක් ඉවත් කරන Route එක
router.delete('/:id', removeCartItem);

// ★★★ Quantity එක update කිරීමට අලුත් PUT Route එක

router.put('/:id', updateCartItemQuantity);

module.exports = router;