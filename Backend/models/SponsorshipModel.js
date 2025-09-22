const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
    // User who submitted this, links to the Member model
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    
    // 1. Sponsor Information
    fullName: { type: String, required: true },
    organizationName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },

    // 2. Sponsorship Details
    sponsorshipPlan: { 
        type: String, 
        required: true,
        enum: ['Silver', 'Gold', 'Platinum', 'Custom']
    },
    sponsorshipAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    preferredPerks: { type: String }, // Can be a comma-separated string

    // 3. Company / Brand Details
    logoUrl: { type: String }, // We'll handle this as a URL for simplicity
    website: { type: String },
    promotionalMessage: { type: String },

    // 5. Agreement & Conditions (Renamed for clarity)
    agreedToTerms: { type: Boolean, required: true },
    agreedToLogoUsage: { type: Boolean, required: true },

    // 6. System Metadata (Auto-handled)
    registrationId: { type: String, required: true, unique: true },
    approvalStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    
     
    accessToken: {
        type: String,
        required: false 
    }

}, { timestamps: true }); // 'timestamps: true' so. find the createdAt  field 

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);
module.exports = Sponsorship;