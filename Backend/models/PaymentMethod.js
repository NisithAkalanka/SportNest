const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    required: true
  },
  cardName: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  expiryMonth: {
    type: String,
    required: true
  },
  expiryYear: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
PaymentMethodSchema.index({ userId: 1, isActive: 1 });
PaymentMethodSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);

