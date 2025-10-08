// File: Backend/models/InventoryLog.js

const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['addition', 'removal_expired', 'removal_damaged', 'sale', 'sale_return'], 
    required: true 
  },
  quantityChange: { 
    type: Number, 
    required: true // Positive for additions, negative for removals
  },
  cost: { 
    type: Number, 
    default: 0 // Only for 'addition' type
  },
  reason: { 
    type: String, 
    trim: true
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);