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
        // ★★★ 1. Enum ලැයිස්තුවට 'Leave' එකතු කිරීම ★★★
        enum: ['Work Full-Day', 'Work Half-Day', 'Absent', 'Duty-Leave', 'Leave'],
        required: true,
    },
}, { 
    timestamps: true
}); 

// මෙම Index එක Data Integrity සඳහා ඉතා වැදගත් නිසා, එය සක්‍රීයව තැබීම නිර්දේශ කරමි.
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;