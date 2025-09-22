// Backend/models/PlayerModel.js

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Member'
    },
    fullName: {
        type: String,
        required: true
    },
    clubId: {
        type: String,
        required: true // ★★★ Club ID-யையும் கட்டாயமாக்குதல்
    },
    membershipId: {
        type: String,
        required: [true, 'Membership ID is required'] // ★★★ Membership ID-யையும் கட்டாயமாக்குதல்
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
        type: String,
        required: false
    },
}, { timestamps: true });

module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);