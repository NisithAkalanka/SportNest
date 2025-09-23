// File: backend/routes/feedbackRoutes.js (UPDATED & COMPLETE)

const express = require('express');
const router  = express.Router();

const protect = require('../middleware/authMiddleware');

// Import all functions from the controller as a single 'feedbackController' object
const feedbackController = require('../controllers/feedbackController');

// CREATE a new feedback submitted by a coach
// POST /api/feedbacks/coach
router.post('/coach', protect, feedbackController.createCoachFeedback);

// READ all feedbacks for the currently logged-in coach
// GET /api/feedbacks/coach/mine
router.get('/coach/mine', protect, feedbackController.getCoachFeedbacks);

// ★★★ NEW ROUTE FOR DASHBOARD SUMMARY ★★★
// This route must be defined *before* routes with parameters like '/:id'
// GET /api/feedbacks/coach/summary
router.get('/coach/summary', protect, feedbackController.getFeedbackSummary);

// UPDATE a specific feedback by its ID
// PATCH /api/feedbacks/:id
router.patch('/:id', protect, feedbackController.updateFeedback);

// DELETE a specific feedback by its ID
// DELETE /api/feedbacks/:id
router.delete('/:id', protect, feedbackController.deleteFeedback);

module.exports = router;