// File: Backend/models/PlayerModel.js

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    // ★★★ නිවැරදි කරන ලදී: Field එකේ නම 'memberId' සිට 'member' ලෙස වෙනස් කරන ලදී. ★★★
    member: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Member reference is required'],
        ref: 'Member', // This ensures it links to the Member model
        unique: true,   // One member should only have one core player profile
    },
    // Player registration form එකෙන් එන දත්ත
    fullName: {
        type: String,
        required: true
    },
    clubId: {
        type: String,
        required: true
    },
    membershipId: {
        type: String,
        required: [true, 'Membership ID is required']
    },
    sportName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    emergencyContactName: {
        type: String,
        required: true
    },
    emergencyContactNumber: {
        type: String,
        required: true
    },
    skillLevel: { 
        type: String, 
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional']
    },
    healthHistory: {
        type: String
    },
}, { timestamps: true });

// To prevent mongoose from recompiling the model
module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);