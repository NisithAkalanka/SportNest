const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reorderPoint: { type: Number, default: 10 }, // ROP
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  
  // --- අලුතින් එකතු කළ Fields ---
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
  // --- /අලුතින් එකතු කළ Fields ---

  grn: { type: String }, // Goods Received Note (optional)
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Item', ItemSchema);