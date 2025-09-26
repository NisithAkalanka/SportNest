// File: Backend/controllers/coachController.js

const Member = require('../models/memberModel');

// 'Coach' role එක ඇති සියලුම members ලාව ලබා ගැනීම
exports.getAllCoaches = async (req, res) => {
    try {
        const coaches = await Member.find({ role: 'Coach' }).select('firstName lastName email baseSalary');
        res.status(200).json(coaches);
    } catch (error) {
        console.error("Error fetching coaches:", error);
        res.status(500).json({ message: 'Error fetching coaches', error: error.message });
    }
};

// නිශ්චිත coach කෙනෙක්ගේ baseSalary එක update කිරීම හෝ අලුතින් එක් කිරීම
exports.updateCoachSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { baseSalary } = req.body;

        // Salary එක වලංගු අගයක්දැයි පරීක්ෂා කිරීම
        if (baseSalary === undefined || baseSalary === null || isNaN(baseSalary) || baseSalary < 0) {
            return res.status(400).json({ message: 'Please provide a valid, non-negative base salary.' });
        }

        // අදාළ ID එකෙන් coach ව සොයා ගැනීම
        const coach = await Member.findById(id);

        if (!coach || coach.role !== 'Coach') {
            return res.status(404).json({ message: 'Coach not found.' });
        }

        // Salary එක update කර save කිරීම
        coach.baseSalary = Number(baseSalary);
        await coach.save();

        res.status(200).json({ message: 'Base salary updated successfully.', data: coach });
    } catch (error) {
        console.error("Error updating salary:", error);
        res.status(500).json({ message: 'Error updating salary', error: error.message });
    }
};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ අලුතින් එකතු කළ Salary Delete කිරීමේ Controller Function එක ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
exports.deleteCoachSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await Member.findById(id);

        if (!coach || coach.role !== 'Coach') {
            return res.status(404).json({ message: 'Coach not found.' });
        }

        // $unset operator එක භාවිතයෙන් baseSalary field එක සම්පූර්ණයෙන්ම ඉවත් කිරීම
        await Member.updateOne({ _id: id }, { $unset: { baseSalary: "" } });

        res.status(200).json({ message: 'Salary deleted successfully.' });

    } catch (error) {
        console.error("Error deleting salary:", error);
        res.status(500).json({ message: 'Error deleting salary', error: error.message });
    }
};