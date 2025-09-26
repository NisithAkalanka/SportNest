// File: backend/routes/playerRoutes.js (FINAL CLEAN VERSION)

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

// ★★★ Controller functions import කරනවා ★★★
const {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList,
} = require('../controllers/playerController');

// ─── Routes ────────────────────────────────

// 🔸 Player Registration (login protect)
router.post('/register', protect, registerPlayer);

// 🔸 Get my profiles
router.get('/my-profiles', protect, getMyProfiles);

// 🔸 Update profile (by ID)
router.put('/profile/:id', protect, updateMyProfile);

// 🔸 Delete profile (by ID)
router.delete('/profile/:id', protect, deleteMyProfile);

// 🔸 Simple player list (coach/admin only)
router.get('/simple-list', protect, getSimplePlayerList);

module.exports = router;
