// Backend/models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Please provide driver full name'],
        trim: true
    },
    licenseNumber: { 
        type: String, 
        required: [true, 'Please provide license number'],
        unique: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: [true, 'Please provide phone number'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Please provide email address'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please provide a valid email address'],
        trim: true,
        lowercase: true
    },
    address: { 
        type: String, 
        required: [true, 'Please provide address'],
        trim: true
    },
    hireDate: { 
        type: Date, 
        required: [true, 'Please provide hire date'],
        default: Date.now
    },
    salary: { 
        type: Number, 
        required: [true, 'Please provide salary amount'],
        min: [0, 'Salary cannot be negative']
    },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Suspended', 'Terminated'],
        default: 'Active'
    },
    profileImage: { 
        type: String, 
        default: '/uploads/default-driver.png'
    },
    emergencyContact: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        relationship: { type: String, trim: true }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for better search performance
driverSchema.index({ fullName: 'text', email: 'text', licenseNumber: 'text' });
driverSchema.index({ status: 1 });
driverSchema.index({ hireDate: -1 });

// Virtual for formatted hire date
driverSchema.virtual('formattedHireDate').get(function() {
    return this.hireDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
});

// Ensure virtual fields are serialized
driverSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
