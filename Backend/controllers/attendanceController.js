
// File: backend/controllers/attendanceController.js


const Attendance = require('../models/AttendanceModel');
const { formatInTimeZone } = require('date-fns-tz');

// <<< NEW:time dekak athara paya ganana gananaya karana function ek >>>
const calculateDurationInHours = (inTime, outTime) => {
    try {
        const inDate = new Date(`1970-01-01T${inTime}`);
        const outDate = new Date(`1970-01-01T${outTime}`);
        const diffMs = outDate.getTime() - inDate.getTime();
        return diffMs / (1000 * 60 * 60); // milliseconds → hours
    } catch (e) {
        return 0; // wrdi time format ekak awoth 0 lesa salakai
    }
};

// --------------------------------------------------
// --- COACH FUNCTIONS ---
// --------------------------------------------------

exports.submitAttendanceByCoach = async (req, res) => {
    const { date, inTime, outTime, attendanceType, leaveReason } = req.body;
    const memberId = req.user._id;

    // --- Basic required fields ---
    if (!date || !attendanceType)
        return res.status(400).json({ message: 'Date and Attendance Type are required.' });
    if (attendanceType === 'Leave' && !leaveReason)
        return res.status(400).json({ message: 'Leave reason is required for leaves.' });

    // --- Time Validations ---
    if (['Full-Day', 'Half-Day'].includes(attendanceType) && (!inTime || !outTime)) {
        return res.status(400).json({
            message: 'For Full/Half-Day, In-Time and Out-Time are required.'
        });
    }
    if (inTime && outTime && outTime <= inTime)
        return res.status(400).json({ message: 'Out-Time must be after In-Time.' });

    // <<< NEW: time range (Duration) test kirima >>>
    if (inTime && outTime) {
        const duration = calculateDurationInHours(inTime, outTime);
        if (attendanceType === 'Full-Day' && duration < 5) {
            return res.status(400).json({
                message: 'A Full-Day must be at least 5 hours long.'
            });
        }
        if (attendanceType === 'Half-Day' && duration < 3) {
            return res.status(400).json({
                message: 'A Half-Day must be at least 3 hours long.'
            });
        }
    }

    try {
        const startOfDayUTC = new Date(date + 'T00:00:00.000Z');

        // ekma dwsedi, ekma coach wisin attendance dama athdai test kirima
        const existingAttendance = await Attendance.findOne({ memberId, date: startOfDayUTC });
        if (existingAttendance) {
            return res.status(409).json({
                message:
                    'You have already submitted attendance for this date. You can edit it if it is pending.'
            });
        }

        const newAttendance = new Attendance({
            memberId,
            date: startOfDayUTC,
            inTime,
            outTime,
            attendanceType,
            leaveReason,
            status: 'Pending'
        });

        await newAttendance.save();
        res.status(201).json({
            message: 'Attendance submitted successfully. Waiting for approval.',
            data: newAttendance
        });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// --- Coach Update ---
exports.updateAttendanceByCoach = async (req, res) => {
    const { id } = req.params;
    const { inTime, outTime, attendanceType, leaveReason } = req.body;
    const memberId = req.user._id;

    // --- Time Validations (for update) ---
    if (['Full-Day', 'Half-Day'].includes(attendanceType) && (!inTime || !outTime)) {
        return res.status(400).json({ message: 'In-Time and Out-Time are required.' });
    }
    if (inTime && outTime && outTime <= inTime)
        return res.status(400).json({ message: 'Out-Time must be after In-Time.' });

    // <<< NEW: Duration check for update >>>
    if (inTime && outTime) {
        const duration = calculateDurationInHours(inTime, outTime);
        if (attendanceType === 'Full-Day' && duration < 5) {
            return res.status(400).json({
                message: 'A Full-Day must be at least 5 hours long.'
            });
        }
        if (attendanceType === 'Half-Day' && duration < 3) {
            return res.status(400).json({
                message: 'A Half-Day must be at least 3 hours long.'
            });
        }
    }

    try {
        const record = await Attendance.findById(id);
        if (!record)
            return res.status(404).json({ message: 'Record not found.' });
        if (record.memberId.toString() !== memberId.toString() || record.status !== 'Pending') {
            return res.status(403).json({
                message: 'You are not authorized to edit this record.'
            });
        }

        record.attendanceType = attendanceType;
        record.inTime = inTime;
        record.outTime = outTime;
        record.leaveReason = leaveReason;
        await record.save();

        res.status(200).json({
            message: 'Attendance updated successfully.',
            data: record
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Server error while updating.' });
    }
};

// --- Coach Delete ---
exports.deleteAttendanceByCoach = async (req, res) => {
    const { id } = req.params;
    const memberId = req.user._id;
    try {
        const record = await Attendance.findById(id);
        if (!record)
            return res.status(404).json({ message: 'Record not found.' });
        if (record.memberId.toString() !== memberId.toString() || record.status !== 'Pending') {
            return res.status(403).json({
                message: 'You are not authorized to delete this record as it has been processed.'
            });
        }
        await Attendance.findByIdAndDelete(id);
        res.status(200).json({ message: 'Attendance record deleted.' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ message: 'Server error while deleting.' });
    }
};

// --- Coach Get History ---
exports.getCoachAttendanceHistory = async (req, res) => {
    try {
        const memberId = req.user._id;
        const records = await Attendance.find({ memberId })
            .sort({ date: -1 })
            .lean();

        const formattedRecords = records.map(record => ({
            ...record,
            date: formatInTimeZone(record.date, 'Asia/Colombo', 'yyyy-MM-dd')
        }));

        res.status(200).json(formattedRecords);
    } catch (error) {
        console.error('Error fetching coach history:', error);
        res.status(500).json({ message: 'Failed to fetch attendance history.' });
    }
};

// --------------------------------------------------
// --- ADMIN FUNCTIONS ---
// --------------------------------------------------

exports.getAllPendingAttendance = async (req, res) => {
    try {
        const pendingRecords = await Attendance.find({ status: 'Pending' })
            .populate('memberId', 'firstName lastName')
            .sort({ date: -1 })
            .lean();

        const formattedRecords = pendingRecords.map(record => ({
            ...record,
            date: record.date
                ? formatInTimeZone(record.date, 'Asia/Colombo', 'yyyy-MM-dd')
                : 'Invalid Date'
        }));

        res.status(200).json(formattedRecords);
    } catch (error) {
        console.error('Error fetching pending attendance:', error);
        res.status(500).json({ message: 'Failed to fetch pending attendance requests.' });
    }
};

// --- Admin Approve / Reject ---
exports.updateAttendanceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const record = await Attendance.findById(id);
        if (!record) return res.status(404).json({ message: 'Attendance record not found.' });

        record.status = status;
        await record.save();

        res.status(200).json({
            message: `Attendance has been ${status.toLowerCase()}.`,
            data: record
        });
    } catch (error) {
        console.error('Error updating attendance status:', error);
        res.status(500).json({ message: 'Server error while updating status.' });
    }
};

// --- Admin View All ---
exports.getAdminAttendanceView = async (req, res) => {
    try {
        const allRecords = await Attendance.find({})
            .populate('memberId', 'firstName lastName')
            .sort({ date: -1 })
            .lean();

        const formattedHistory = allRecords.map(record => ({
            ...record,
            date: record.date
                ? formatInTimeZone(record.date, 'Asia/Colombo', 'yyyy-MM-dd')
                : 'Invalid Date'
        }));

        res.status(200).json(formattedHistory);
    } catch (error) {
        console.error('Error fetching all attendance for admin:', error);
        res.status(500).json({ message: 'Failed to fetch attendance records.' });
    }
};

// --- Admin Full Edit ---
exports.updateAttendanceByAdmin = async (req, res) => {
    const { id } = req.params;
    const { date, attendanceType, inTime, outTime, leaveReason, status } = req.body;

    try {
        const record = await Attendance.findById(id);
        if (!record) return res.status(404).json({ message: 'Attendance record not found.' });

        if (date) record.date = new Date(date + 'T00:00:00.000Z');
        if (attendanceType) record.attendanceType = attendanceType;
        if (status) record.status = status;
        record.inTime = inTime;
        record.outTime = outTime;
        record.leaveReason = leaveReason;

        const updatedRecord = await record.save();
        res.status(200).json({
            message: 'Record updated successfully by admin.',
            data: updatedRecord
        });
    } catch (error) {
        console.error('Admin Update Error:', error);
        res.status(500).json({ message: 'Failed to update record.' });
    }
};

// --- Admin Delete Any ---
exports.deleteAttendanceForAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const record = await Attendance.findByIdAndDelete(id);
        if (!record)
            return res.status(404).json({ message: 'Record not found to delete.' });
        res.status(200).json({ message: 'Attendance record permanently deleted by admin.' });
    } catch (error) {
        console.error('Admin Delete Error:', error);
        res.status(500).json({ message: 'Error deleting attendance record.' });
    }
};
