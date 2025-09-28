const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        //  1. Enum list ekt 'Leave' add kirima
        enum: ['Work Full-Day', 'Work Half-Day', 'Absent', 'Duty-Leave', 'Leave'],
        required: true,
    },
}, { 
    timestamps: true
}); 

// mema Index ek Data Integrity sdha important nisa, eya active wa thabima
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;