const express = require('express');
const router = express.Router();

// අපි අවශ්‍ය functions දෙකම එකම පේළියකින් මෙතැනදී import කරගන්නවා
const { addToCart, getCartItems, removeCartItem } = require('../controllers/cartController');

<<<<<<< Updated upstream
// Cart එකට item එකක් එකතු කරන Route එක
router.post('/add', addToCart);

// Cart එකේ තියෙන items ටික ලබාගන්නා Route එක
router.get('/', getCartItems);

// Cart එකෙන් item එකක් ඉවත් කරන Route එක
router.delete('/:id', removeCartItem);
=======
// Cart ekata item ekak ekathu karana Route 
router.post('/add', authMiddleware, addToCart);

// Cart eke thiyena itemstika gnnawa Route 
router.get('/', authMiddleware, getCartItems);

// Cart eken item eka iwath karanawa Route 
router.delete('/:id', authMiddleware, removeCartItem);

// ★★★ Quantity eka update kirimata PUT Route eka

router.put('/:id', authMiddleware, updateCartItemQuantity);
>>>>>>> Stashed changes

module.exports = router;