const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true }, // e.g., "Payment for Pre-order of 50 Cricket Balls"
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Supplier Payment', 'Salary', 'Utility', 'Other'], 
    default: 'Supplier Payment' 
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // ಯಾವ supplier ටද ගෙව්වේ
  preorder: { type: mongoose.Schema.Types.ObjectId, ref: 'Preorder' }, // ಯಾವ pre-order එකටද
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);