const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },

  
  reorderPoint: {
    type: Number,
    required: true, // ★ aniwarya karanawa (data consistency එකට) ★
    default: 10     // ★ Default agayak dimen, null/undefined  ★
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