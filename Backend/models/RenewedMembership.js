const mongoose = require('mongoose');

const RenewedMembershipSchema = new mongoose.Schema({
    membershipId: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    previousPlan: {
        type: String,
        required: true
    },
    newPlan: {
        type: String,
        required: true
    },
    renewalDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RenewedMembership', RenewedMembershipSchema);