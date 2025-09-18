const express = require('express');
const router = express.Router();
const { registerForSport } = require('../Controllers/sportController');
const  protect  = require('../middleware/authMiddleware');

// Route for sport registration. It's protected, so only logged-in users can access it.
router.post('/register', protect, registerForSport);

module.exports = router;