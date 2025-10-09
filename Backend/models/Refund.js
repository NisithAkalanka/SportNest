const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'REF' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      originalPrice: {
        type: Number,
        required: true
      },
      refundAmount: {
        type: Number,
        required: true
      }
    }
  ],
  totalRefundAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'defective_item',
      'wrong_item',
      'not_as_described',
      'damaged_during_shipping',
      'changed_mind',
      'duplicate_order',
      'other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  refundMethod: {
    type: String,
    enum: ['original_payment', 'store_credit', 'bank_transfer'],
    default: 'original_payment'
  },
  // For tracking refund processing
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Evidence/attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
RefundSchema.index({ orderId: 1, userId: 1 });
RefundSchema.index({ status: 1 });
RefundSchema.index({ requestedDate: -1 });

module.exports = mongoose.model('Refund', RefundSchema);
