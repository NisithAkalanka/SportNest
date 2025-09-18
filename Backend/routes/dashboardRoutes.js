// Backend/routes/dashboardRoutes.js (සම්පූර්ණ නිවැරදි කරන ලද කේතය)

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');

// ★★★ නිවැරදි කරන ලද වැදගත්ම කොටස ★★★
// පරණ 'authMiddleware' එක වෙනුවට, Admin ටම වෙන්වුණු
// 'adminMiddleware' එක import කරගන්නවා.
// (මෙමගින්, එය 'admins' collection එක පරීක්ෂා කරනු ඇත)
const protectAdmin = require('../middleware/adminMiddleware');


// ★★★ Route එක, දැන් 'protectAdmin' middleware එකෙන් ආරක්ෂා කරනවා ★★★
router.get('/stats', protectAdmin, getStats);


module.exports = router;