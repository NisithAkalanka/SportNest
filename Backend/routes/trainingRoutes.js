const express = require('express');
const router = express.Router();
const {
  createTrainingSession,
  getAllTrainings,
  getMySessions,
  updateSession,
  deleteSession,
  registerForTraining,
  unregisterFromTraining,
  getCoachSummary,
} = require('../controllers/trainingController');
const { protectAny } = require('../middleware/authMiddleware');

// --- All Trainings (anyone can view), Coach can create ---
router.route('/')
  .get(getAllTrainings)
  .post(protectAny, createTrainingSession);

// --- Coach’s own sessions ---
router.route('/mysessions').get(protectAny, getMySessions);

// --- Coach’s summary dashboard ---
router.route('/coach/summary').get(protectAny, getCoachSummary);

// --- Update/Delete specific session ---
router.route('/:id')
  .put(protectAny, updateSession)
  .delete(protectAny, deleteSession);

// --- Player register/unregister ---
router.post('/:id/register', protectAny, registerForTraining);
router.post('/:id/unregister', protectAny, unregisterFromTraining);

module.exports = router;
