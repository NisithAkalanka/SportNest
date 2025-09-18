const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');

router.post('/register', registerAdmin); // Admin ලියාපදිංචි කිරීමට (පළමු වරට පමණක්)
router.post('/login', loginAdmin);

module.exports = router;