const express = require('express');
const router = express.Router();
const { generateSalaryReport } = require('../controllers/salaryController');
// const { protect, admin } = require('../middleware/authMiddleware'); // අවශ්‍ය නම් පසුව admin security එකතු කළ හැකියි

// POST -> /api/salaries/report
router.post('/report', generateSalaryReport);

module.exports = router;