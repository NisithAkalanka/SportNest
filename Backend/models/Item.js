const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ මෙන්න නිවැරදි කරන ලද reorderPoint Field එක ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  reorderPoint: {
    type: Number,
    required: true, // ★ අනිවාර්ය කිරීම (data consistency එකට) ★
    default: 10     // ★ Default අගයක් දීමෙන්, null/undefined වීම වළක්වනවා ★
  },

  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  
  price: {
    type: Number,
    required: true,
    default: 0.00
  },
  batchNumber: {
    type: String,
    default: 'N/A'
  },
  expiryDate: {
    type: Date,
  },
  
  grn: { type: String },
  
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);