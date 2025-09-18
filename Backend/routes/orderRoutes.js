const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/orderController');

router.post('/checkout', checkout);

module.exports = router;