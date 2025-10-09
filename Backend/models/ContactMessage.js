// File: backend/models/ContactMessage.js

const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address.',
    ],
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject.'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide a message.'],
  },
  isRead: { // Admin ta paniwidya kiyewwda ndd yanna lakunu kirima
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);