const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  customer: { 
    type: String, 
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow letters, spaces, numbers, and common punctuation
        return /^[a-zA-Z0-9\s.,-]+$/.test(v);
      },
      message: 'Customer name contains invalid characters'
    }
  },
  address: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  deliveryDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        // Delivery date must be in the future
        return v > new Date();
      },
      message: 'Delivery date must be in the future'
    }
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: false
  },
  driverEmail: {
    type: String,
    required: false,
    trim: true
  },
  confirmationToken: {
    type: String,
    required: false,
    unique: true
  },
  driverConfirmed: {
    type: Boolean,
    default: false
  },
  confirmationDate: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { timestamps: true });

// Index for better query performance
DeliverySchema.index({ orderId: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ deliveryDate: 1 });

module.exports = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);
