const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { protect } = require('../middleware/authMiddleware');//////

const { addToCart, getCartItems, removeCartItem, updateCartItemQuantity } = require('../controllers/cartController');

// Cart ekata  item ekak ekathu kirima Route eka
router.post('/add', authMiddleware, addToCart);

// Cart eke thiyena items tika eka ganna Route 
router.get('/', authMiddleware, getCartItems);

// Cart eken item eken iwath karana Route 
router.delete('/:id', authMiddleware, removeCartItem);

// ★★★ Quantity eka update kirimata  PUT Route 

router.put('/:id', authMiddleware, updateCartItemQuantity);

module.exports = router;