// Backend/models/AttendanceModel.js

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
    // niwadu catogarize kirima
    attendanceType: {
        type: String,
        enum: ['Full-Day', 'Half-Day', 'Leave', 'Duty-Leave'],
        required: true,
    },
    // inTime aniwarya na (leave gnn wita)
    inTime: {
        type: String, 
    },
    // outTime aniwarya na
    outTime: {
        type: String,
    },
    // hethuwa leave damimata
    leaveReason: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, { 
    timestamps: true
}); 

attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;