// Backend/routes/dashboardRoutes.js 

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');



// 'adminMiddleware' eka import 

const protectAdmin = require('../middleware/adminMiddleware');


// ★★★ Route එක, දැන් 'protectAdmin' middleware eken araksha karanawa ★★★
router.get('/stats', protectAdmin, getStats);


module.exports = router;