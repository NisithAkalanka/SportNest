const mongoose = require('mongoose');

const PreOrderPaymentSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  bank: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque', 'online'],
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  preOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreOrder',
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
PreOrderPaymentSchema.index({ supplierId: 1, paymentDate: -1 });
PreOrderPaymentSchema.index({ status: 1 });
PreOrderPaymentSchema.index({ referenceNumber: 1 });

module.exports = mongoose.model('PreOrderPayment', PreOrderPaymentSchema);
