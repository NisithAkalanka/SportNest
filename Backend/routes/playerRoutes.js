<<<<<<< Updated upstream

=======
// File: backend/routes/playerRoutes.js
>>>>>>> Stashed changes
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
 const { registerPlayer, getMyProfiles, updateMyProfile, deleteMyProfile } = require('../controllers/playerController'); // path එක 'controllers' ද 'Controllers' ද බලන්න

<<<<<<< Updated upstream

=======
// ★★★ IMPORT CONTROLLER FUNCTIONS ★★★
const {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList
} = require('../controllers/playerController');

// ─── Player Registration ────────────────────────────────
>>>>>>> Stashed changes
router.post('/register', protect, registerPlayer);


router.get('/my-profiles', protect, getMyProfiles); 


router.put('/profile/:id', protect, updateMyProfile);
<<<<<<< Updated upstream


router.delete('/profile/:id', protect, deleteMyProfile);

=======
router.delete('/profile/:id', protect, deleteMyProfile); // ✅ Delete by ID only

// ─── Simple list for coach dropdown ─────────────────────
router.get('/simple', protect, getSimplePlayerList);

>>>>>>> Stashed changes
module.exports = router;
