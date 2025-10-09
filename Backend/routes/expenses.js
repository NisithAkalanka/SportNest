// File: Backend/routes/expenses.js

const express = require('express');
const router = express.Router();
const { logExpense } = require('../controllers/expenseController');
const protectAdmin = require('../middleware/adminMiddleware'); // Assuming you have this middleware

router.post('/log', protectAdmin, logExpense);

module.exports = router;