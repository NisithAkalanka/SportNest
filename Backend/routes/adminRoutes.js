const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');

<<<<<<< Updated upstream
router.post('/register', registerAdmin); // Admin ලියාපදිංචි කිරීමට (පළමු වරට පමණක්)
=======
const { 
  registerAdmin, 
  loginAdmin, 
  getUserManagementSummary,
  getUsersByPlan,
  getPlayersBySport,   
  getActiveMembers,
  getInactiveMembers,
  getAllMembers        
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/authMiddleware');

// ================== Auth ==================
router.post('/register', registerAdmin); 
>>>>>>> Stashed changes
router.post('/login', loginAdmin);

module.exports = router;