const express = require('express');
const router = express.Router();
const { generateSalaryReport } = require('../controllers/salaryController');
// const { protect, admin } = require('../middleware/authMiddleware'); // awashya nam pasuwa admin security ekathu kl hakii

// POST -> /api/salaries/report
router.post('/report', generateSalaryReport);

module.exports = router;