// Backend/routes/dashboardRoutes.js 

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');


const protectAdmin = require('../middleware/adminMiddleware');


// ★★★ Route 'protectAdmin' middleware 
router.get('/stats', protectAdmin, getStats);


module.exports = router;