const express = require('express');
const router = express.Router();
const {
    getAllCoaches,
    markAttendance,
    getAttendanceHistory,
    deleteAttendance
} = require('../controllers/attendanceController');

const { protect, admin } = require('../middleware/authMiddleware'); // Admin ට පමණක් access දීමට

// Coach hamoma laba ganimata route eka (Dropdown ekt)
// router.get('/coaches', protect, admin, getAllCoaches);
router.get('/coaches', getAllCoaches); // danta admin middleware eka nomathiwa test krmu

// attendance reports labaganimata saha aluthin mark kirimata Routes
router.route('/')
    .get(getAttendanceHistory)      // GET -> /api/attendance
    .post(markAttendance);     // POST -> /api/attendance

// delete kirimata Route ek
router.delete('/:id', deleteAttendance); // DELETE -> /api/attendance/60d5ecb8b48f4f3a2c8f8b8f (EX: ID)

module.exports = router;