
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'Please provide a first name'] },
    lastName: { type: String, required: [true, 'Please provide a last name'] },
    age: { type: Number, required: [true, 'Please provide your age'] },
    nic: { type: String, required: [true, 'Please provide your NIC number'], unique: true },
    gender: { type: String, required: [true, 'Please select a gender'] },
    role: { type: String, required: true, default: 'Member' },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, match: [/.+\@.+\..+/, 'Please fill a valid email address'] },
    contactNumber: { type: String, required: [true, 'Please provide a contact number'] },
    password: { type: String, required: [true, 'Please provide a password'] },
    clubId: { type: String, unique: true, sparse: true },
    passwordResetToken: String,
    passwordResetExpires: Date,

    profileImage: { type: String, default: '/uploads/default-avatar.png' },
    membershipId: { type: String },
    membershipPlan: {
        type: String,
        enum: ['None','Student Membership', 'Ordinary Membership', 'Life Time Membership'],
        default: 'None'
    },
    membershipStatus: { type: String, default: 'Inactive' },
    membershipExpiresAt: { type: Date, default: null },

    // Coach salary field (from main2)
    baseSalary: { type: Number, default: 0 }
}, {
    timestamps: true
});

memberSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

memberSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    return resetToken; 
};

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);//ayni
