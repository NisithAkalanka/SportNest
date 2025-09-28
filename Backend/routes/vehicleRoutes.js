const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  addVehicle,
  getById,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');

// GET /api/vehicles - Get all vehicles
router.get('/', getAllVehicles);

// POST /api/vehicles - Add new vehicle
router.post('/', addVehicle);

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', getById);

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', updateVehicle);

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', deleteVehicle);

module.exports = router;
