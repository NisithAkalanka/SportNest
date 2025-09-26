// File: backend/routes/playerRoutes.js (FINAL & CORRECTED VERSION)

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

// ★★★ 1. IMPORT THE NEW CONTROLLER FUNCTION ★★★
const {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList // Import the function we created in the controller
} = require('../controllers/playerController');

// NOTE: We don't need to import the 'Player' model here anymore,
// because the controller is now handling all the database logic.

// ─── EXISTING ROUTES (No changes needed here) ────────────────────────────────
router.post('/register', protect, registerPlayer);
router.get('/my-profiles', protect, getMyProfiles);
router.put('/profile/:id', protect, updateMyProfile);
router.delete('/profile/:id', protect, deleteMyProfile);


// ─── NEW: Simple list for coach dropdown (CLEANED UP) ──────────────────────
// ★★★ 2. THE FIX: The route now points cleanly to the controller function ★★★
// All the complicated logic has been removed from this file and is now
// correctly located inside `playerController.js`.
router.get('/simple', protect, getSimplePlayerList);


module.exports = router;