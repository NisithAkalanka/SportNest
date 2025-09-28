const Attendance = require('../models/AttendanceModel');
const Member = require('../models/memberModel');
const { formatInTimeZone } = require('date-fns-tz');

exports.getAllCoaches = async (req, res) => {
    try {
        const coaches = await Member.find({ role: 'Coach' }, 'firstName lastName');
        res.status(200).json(coaches);
    } catch (error) {
        console.error("Error fetching coaches:", error);
        res.status(500).json({ message: 'Error fetching coaches', error: error.message });
    }
};


exports.markAttendance = async (req, res) => {
    try {
        const { memberId, date, status } = req.body;
        if (!memberId || !date || !status) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const startOfDayUTC = new Date(date + 'T00:00:00.000Z');
        const endOfDayUTC = new Date(startOfDayUTC);
        endOfDayUTC.setUTCDate(startOfDayUTC.getUTCDate() + 1);

        // 1. palamuwa, adala coach ta, adala date eke record ekk thiyenawadai saralawa seweema.
        const existingAttendance = await Attendance.findOne({
            memberId: memberId,
            date: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });

        // 2. Record ekk tynwnm -> UPDATE krnna
        if (existingAttendance) {
            existingAttendance.status = status;
            await existingAttendance.save();
            return res.status(200).json({ message: 'Attendance updated successfully', data: existingAttendance });
        } 
        // 3. Record ekk damima -> aluthin CREATE krnn
        else {
            const newAttendance = new Attendance({
                memberId,
                date: startOfDayUTC,
                status
            });
            await newAttendance.save();
            return res.status(201).json({ message: 'Attendance marked successfully', data: newAttendance });
        }
    } catch (error) {
        console.error("Server Error in markAttendance:", error);
        res.status(500).json({ message: 'Server error while processing attendance.', error: error.message });
    }
};


exports.getAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.find({}).populate('memberId', 'firstName lastName').sort({ date: -1 }).lean();
        
        const formattedHistory = history.map(record => {
            if (!record.date) { 
                return { ...record, date: 'Invalid Date' };
            }
            const formattedDate = formatInTimeZone(record.date, 'Asia/Colombo', 'yyyy-MM-dd');
            return { ...record, date: formattedDate };
        });
        
        res.status(200).json(formattedHistory);
    } catch (error) {
        console.error("Error fetching attendance history:", error);
        res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        await Attendance.findByIdAndDelete(id);
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error("Error deleting record:", error);
        res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
    }
};