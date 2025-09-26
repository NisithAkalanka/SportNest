const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    membershipPlan: { type: String },
    membershipStatus: { type: String, default: 'Inactive' },

    // ★★★★★ මෙන්න අලුතින් එකතු කළ ක්ෂේත්‍රය ★★★★★
    baseSalary: { 
        type: Number,
        default: 0  // Coach කෙනෙක් නොවේ නම්, default අගය 0 වේ
    }

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

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);