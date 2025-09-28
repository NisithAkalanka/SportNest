const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    testDriverModel,
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    getDriverStats,
    exportDriversToPDF,
    bulkUpdateStatus,
    bulkDeleteDrivers
} = require('../controllers/driverController');

// =================================================================================
// DRIVER ROUTES
// =================================================================================

// --- PUBLIC ROUTES (if needed) ---
// Currently all routes are protected, but you can add public routes here if needed

// --- PROTECTED ROUTES ---

// Create a new driver
router.post('/', protect, upload.single('profileImage'), (req, res, next) => {
  console.log('Route: Create driver request received');
  console.log('Route: Request body:', req.body);
  console.log('Route: File uploaded:', req.file ? 'Yes' : 'No');
  next();
}, createDriver);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Driver routes are working!', timestamp: new Date().toISOString() });
});

// Test database connection and model
router.get('/test-model', testDriverModel);

// Get all drivers with search, filter, and pagination
router.get('/', protect, getAllDrivers);

// Get driver statistics
router.get('/stats', protect, getDriverStats);

// Export drivers to PDF
router.get('/export/pdf', protect, exportDriversToPDF);

// Get driver by ID
router.get('/:id', protect, getDriverById);

// Update driver
router.put('/:id', protect, upload.single('profileImage'), (req, res, next) => {
  console.log('Route: Update driver request received');
  console.log('Route: Driver ID:', req.params.id);
  console.log('Route: Request body:', req.body);
  console.log('Route: File uploaded:', req.file ? 'Yes' : 'No');
  next();
}, updateDriver);

// Delete driver
router.delete('/:id', protect, deleteDriver);

// --- BULK OPERATIONS ---

// Bulk update driver status
router.patch('/bulk/status', protect, bulkUpdateStatus);

// Bulk delete drivers
router.delete('/bulk/delete', protect, bulkDeleteDrivers);

module.exports = router;
