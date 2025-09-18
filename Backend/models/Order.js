const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // User ID එකක් පසුව එකතු කරන්න පුළුවන්
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);