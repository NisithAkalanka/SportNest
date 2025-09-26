// File: Backend/routes/coachRoutes.js

const express = require('express');
const router = express.Router();

// controllers වලින් අවශ්‍ය functions import කර ගැනීම
const { 
    getAllCoaches, 
    updateCoachSalary,
    deleteCoachSalary // ★★★ Delete function එක import කිරීම ★★★
} = require('../controllers/coachController');

// Middleware import කරගැනීම (ඔබට අවශ්‍ය නම් uncomment කරන්න)
// const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/coaches -> සියලුම coaches ලාව ලබාගැනීම
router.get('/', /* protect, admin, */ getAllCoaches);

// PUT /api/coaches/:id/salary -> coach ගේ salary එක update කිරීම (Route එක වඩාත් නිශ්චිත කර ඇත)
router.put('/:id/salary', /* protect, admin, */ updateCoachSalary);

// ★★★ DELETE /api/coaches/:id/salary -> coach ගේ salary එක delete කිරීම සඳහා අලුත් Route එක ★★★
router.delete('/:id/salary', /* protect, admin, */ deleteCoachSalary);


module.exports = router;