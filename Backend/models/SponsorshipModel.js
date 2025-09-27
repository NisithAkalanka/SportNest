// Backend/models/SponsorshipModel.js

const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
    // User who submitted this sponsorship request (linked to Member model)
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },

    // 1. Sponsor Information
    fullName: { type: String, required: true },
    organizationName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        match: [/.+\@.+\..+/, 'කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න'] 
    },
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
    preferredPerks: { type: String }, // Comma-separated list or free text

    // 3. Company / Brand Details
    logoUrl: { type: String }, 
    website: { type: String },
    promotionalMessage: { type: String },

    // 4. Agreement & Conditions
    agreedToTerms: { type: Boolean, required: true },
    agreedToLogoUsage: { type: Boolean, required: true },

    // 5. System Metadata
    registrationId: { type: String, required: true, unique: true },

    // Instead of approvalStatus → use contactStatus
    contactStatus: {
        type: String,
        enum: ['Not Contacted', 'Contacted'],
        default: 'Not Contacted'
    },

    accessToken: { type: String } // Optional
}, { 
    timestamps: true // Adds createdAt & updatedAt automatically
});

// Export Model
const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);
module.exports = Sponsorship;
