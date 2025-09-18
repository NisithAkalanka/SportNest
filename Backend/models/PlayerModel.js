const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    // 'members' collection එකේ ඇති මුල් member ට සම්බන්ධ කිරීම
    member: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Member'
    },
    clubId: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    
    // ඔවුන් ලියාපදිංචි වන ක්‍රීඩාව
    sportName: {
        type: String,
        required: true
    },
    
    // ඔබ විසින් ඉල්ලන ලද නව fields
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
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'] // මේ අගයන් හතරෙන් එකක් පමණක් ඇතුළත් කළ හැක
    },
    
    healthHistory: {
        type: String,
        required: false // මෙය ඇතුළත් කිරීම අනිවාර්ය නොවේ
    },

}, { timestamps: true }); // createdAt සහ updatedAt fields ස්වයංක්‍රීයව එකතු කරයි

// ★★★ නිවැරදි කරන ලද කොටස මෙන්න ★★★
// Mongoose විසින් 'Player' නමින් model එකක් දැනටමත් සාදා ඇත්දැයි මුලින්ම පරීක්ෂා කරයි.
// එසේ සාදා ඇත්නම්, පවතින model එකම නැවත භාවිතා කරයි.
// එසේ සාදා නොමැති නම් පමණක්, අලුතින් model එකක් සාදයි.
// මෙමගින් 'OverwriteModelError' එක සම්පූර්ණයෙන්ම නතර වේ.
module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);