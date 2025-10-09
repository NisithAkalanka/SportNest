// File: Backend/controllers/expenseController.js

const Expense = require('../models/Expense');
const Supplier = require('../models/Supplier');
const Preorder = require('../models/Preorder');

// @route   POST /api/expenses/log
// @desc    Log a new expense (e.g., supplier payment)
// @access  Admin
const logExpense = async (req, res) => {
  const { description, amount, category, supplierId, preorderId } = req.body;

  if (!description || !amount) {
    return res.status(400).json({ msg: 'Description and amount are required.' });
  }
  
  try {
    const newExpense = new Expense({
      description,
      amount: Number(amount),
      category: category || 'Supplier Payment',
      supplier: supplierId,
      preorder: preorderId,
    });

    const expense = await newExpense.save();
    res.status(201).json({ msg: 'Payment logged successfully!', expense });

  } catch (err) {
    console.error('Log Expense Error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  logExpense,
};