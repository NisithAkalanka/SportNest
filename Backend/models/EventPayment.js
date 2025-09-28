// Backend/models/EventPayment.js
const mongoose = require('mongoose');

const EventPaymentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: false // Optional for guest registrations
  },
  registrationData: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal'],
      required: false
    },
    cardName: String,
    cardNumber: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String
  },
  billingInfo: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    city: { type: String, required: false },
    postalCode: { type: String, required: false },
    province: { type: String, required: false },
    country: { type: String, required: false }
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  transactionId: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date,
  refundReason: String
}, {
  timestamps: true
});

// Index for query performance
EventPaymentSchema.index({ eventId: 1, status: 1 });
EventPaymentSchema.index({ 'registrationData.email': 1 });
EventPaymentSchema.index({ participantId: 1 });

module.exports = mongoose.model('EventPayment', EventPaymentSchema);
