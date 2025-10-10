// Backend/routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protectAny, adminOnly, protectCoach } = require('../middleware/authMiddleware');

// --- Coach Routes ---
router.route('/coach')
    .post(protectAny, protectCoach, attendanceController.submitAttendanceByCoach)
    .get(protectAny, protectCoach, attendanceController.getCoachAttendanceHistory);

router.route('/coach/:id')
    .put(protectAny, protectCoach, attendanceController.updateAttendanceByCoach)
    .delete(protectAny, protectCoach, attendanceController.deleteAttendanceByCoach);

// --- Admin Routes ---
router.get('/admin/pending', protectAny, adminOnly, attendanceController.getAllPendingAttendance); 
router.get('/admin/all', protectAny, adminOnly, attendanceController.getAdminAttendanceView);
router.put('/admin/update/:id', protectAny, adminOnly, attendanceController.updateAttendanceStatus); // Approve/Reject
router.delete('/admin/delete/:id', protectAny, adminOnly, attendanceController.deleteAttendanceForAdmin); // Delete any record

// <<< NEW: Admin t sampurna record ekkma update kirima >>>
router.put('/admin/full-update/:id', protectAny, adminOnly, attendanceController.updateAttendanceByAdmin);

module.exports = router;