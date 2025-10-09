const express = require('express');
const router = express.Router();
const {
  requestRefund,
  getMyRefunds,
  getRefundById,
  getAllRefunds,
  approveRefund,
  rejectRefund,
  completeRefund,
  getRefundStats
} = require('../controllers/refundController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   POST /api/refunds/request
// @desc    Create a refund request
// @access  Private (Member)
router.post('/request', authMiddleware, requestRefund);

// @route   GET /api/refunds/my-refunds
// @desc    Get user's refund requests
// @access  Private (Member)
router.get('/my-refunds', authMiddleware, getMyRefunds);

// @route   GET /api/refunds/:id
// @desc    Get refund by ID
// @access  Private
router.get('/:id', authMiddleware, getRefundById);

// @route   GET /api/refunds
// @desc    Get all refunds (Admin only)
// @access  Private (Admin)
router.get('/', authMiddleware, adminMiddleware, getAllRefunds);

// @route   PUT /api/refunds/:id/approve
// @desc    Approve a refund request
// @access  Private (Admin)
router.put('/:id/approve', authMiddleware, adminMiddleware, approveRefund);

// @route   PUT /api/refunds/:id/reject
// @desc    Reject a refund request
// @access  Private (Admin)
router.put('/:id/reject', authMiddleware, adminMiddleware, rejectRefund);

// @route   PUT /api/refunds/:id/complete
// @desc    Mark refund as completed
// @access  Private (Admin)
router.put('/:id/complete', authMiddleware, adminMiddleware, completeRefund);

// @route   GET /api/refunds/stats/summary
// @desc    Get refund statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/summary', authMiddleware, adminMiddleware, getRefundStats);

module.exports = router;
