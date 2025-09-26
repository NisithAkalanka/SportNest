const express = require('express');
const router = express.Router();
const {
    getAllCoaches,
    markAttendance,
    getAttendanceHistory,
    deleteAttendance
} = require('../controllers/attendanceController');

const { protect, admin } = require('../middleware/authMiddleware'); // Admin ට පමණක් access දීමට

// Coach ලා සියල්ලන්ව ලබා ගැනීමට Route එක (Dropdown එකට)
// router.get('/coaches', protect, admin, getAllCoaches);
router.get('/coaches', getAllCoaches); // දැනට admin middleware එක නොමැතිව test කරමු

// පැමිණීමේ වාර්තා ලබාගැනීමට සහ අලුතින් සටහන් කිරීමට Routes
router.route('/')
    .get(getAttendanceHistory)      // GET -> /api/attendance
    .post(markAttendance);     // POST -> /api/attendance

// නිශ්චිත වාර්තාවක් මකා දැමීමට Route එක
router.delete('/:id', deleteAttendance); // DELETE -> /api/attendance/60d5ecb8b48f4f3a2c8f8b8f (උදාහරණ ID)

module.exports = router;