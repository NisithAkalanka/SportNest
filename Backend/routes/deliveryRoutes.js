const express = require('express');
const router = express.Router();

const {
  addDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  generateDeliveryCsvReport,
  getDeliveryStats,
  getAvailableOrders,
  autoCreateDelivery,
  getAvailableDrivers,
  confirmDelivery,
  getConfirmationStatus,
  testDrivers,
  testDatabase,
  testEmail
} = require('../controllers/deliveryController');

// Admin middleware for protecting routes
const protectAdmin = require('../middleware/adminMiddleware');

// --- Public routes (Driver confirmation) ---
router.get('/confirm/:token', confirmDelivery);
router.get('/confirmation-status/:token', getConfirmationStatus);

// --- Debug routes ---
router.get('/test-drivers', testDrivers);
router.get('/test-database', testDatabase);
router.post('/test-email', testEmail);

// --- Admin only routes (protected) ---
router.post('/', protectAdmin, addDelivery);
router.get('/', protectAdmin, getDeliveries);
router.get('/stats', protectAdmin, getDeliveryStats);
router.get('/available-orders', protectAdmin, getAvailableOrders);
router.get('/available-drivers', protectAdmin, getAvailableDrivers);
router.post('/auto-create', protectAdmin, autoCreateDelivery);
router.get('/:id', protectAdmin, getDeliveryById);
router.put('/:id', protectAdmin, updateDelivery);
router.delete('/:id', protectAdmin, deleteDelivery);

// CSV Report route (Admin only)
router.get('/report/csv', protectAdmin, generateDeliveryCsvReport);

module.exports = router;
