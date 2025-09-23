const express = require('express');
const router  = express.Router();

const protect = require('../middleware/authMiddleware');     // default export function
const feedback = require('../controllers/feedbackController');

router.post('/coach', protect, feedback.createCoachFeedback);  // CREATE
router.get('/coach/mine', protect, feedback.getCoachFeedbacks); // READ
router.patch('/:id', protect, feedback.updateFeedback);        // UPDATE
router.delete('/:id', protect, feedback.deleteFeedback);       // DELETE

module.exports = router;
