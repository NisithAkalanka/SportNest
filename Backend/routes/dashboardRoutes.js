// Backend/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getMembershipStats, 
  getPlayerStats, 
  getStats 
} = require('../controllers/dashboardController');

// ★★★ Use dedicated admin middleware for security ★★★
const protectAdmin = require('../middleware/adminMiddleware');

// --- Admin-only routes ---
router.get('/membership-stats', protectAdmin, getMembershipStats);
router.get('/player-stats', protectAdmin, getPlayerStats);
router.get('/stats', protectAdmin, getStats);

module.exports = router;
