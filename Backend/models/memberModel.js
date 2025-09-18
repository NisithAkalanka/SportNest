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
    clubId: { type: String, unique: true, sparse: true }
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
// ✅ reuse if already compiled (prevents OverwriteModelError)
module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);