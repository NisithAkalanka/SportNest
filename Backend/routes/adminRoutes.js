const express = require('express');
const router = express.Router();

const { 
  registerAdmin, 
  loginAdmin, 
  getUserManagementSummary,
  getUsersByPlan,
  getAllPlayers,       // ✅ මේක එකතු කරන්න
  getPlayersBySport,   // ✅ මේක එකතු කරන්න
  getActiveMembers,
  getInactiveMembers,
  getAllMembers,       // ✅ මේකත් එකතු කරන්න
  deleteMember         // ✅ මේක එකතු කරන්න
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/authMiddleware');

// ================== Auth ==================
router.post('/register', registerAdmin); 
router.post('/login', loginAdmin);

// ================== Dashboard Summary ==================
router.get('/user-summary', getUserManagementSummary);
router.get('/users/all', getAllMembers);

// ================== Members ==================
router.get('/users/status/active',  getActiveMembers);
router.get('/users/status/inactive', getInactiveMembers);
router.get('/users/plan/:planName',  getUsersByPlan);
router.delete('/users/:id',         deleteMember);

// ================== Players ==================
router.get('/players/all',               getAllPlayers);
router.get('/players/sport/:sportName',  getPlayersBySport);

module.exports = router;
