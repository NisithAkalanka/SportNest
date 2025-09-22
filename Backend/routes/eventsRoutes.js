// Backend/routes/eventsRoutes.js
const express = require('express');
const router = express.Router();

const ctl = require('../controllers/eventsController');
const { protectAny, adminOnly } = require('../middleware/authMiddleware');

/* -------------------- PUBLIC -------------------- */
// List approved events
router.get('/approved', ctl.listApproved);

// Public registration (⚠️ keep BEFORE '/:id')
router.post('/:id/register', ctl.register);

/* ---------------- MEMBER / ADMIN ---------------- */
router.post('/submit', protectAny, ctl.submitEvent); // member submit -> pending

// Member's own submissions (⚠️ keep BEFORE '/:id')
router.get('/mine', protectAny, ctl.listMine);

/* -------------------- ADMIN --------------------- */
router.get('/',              protectAny, adminOnly, ctl.listEvents);
router.patch('/:id/approve', protectAny, adminOnly, ctl.approve);
router.patch('/:id/reject',  protectAny, adminOnly, ctl.reject);

/* -------------- UPDATE / DELETE ----------------- */
// Admin can always; submitter allowed in controller rules
router.put('/:id',    protectAny, ctl.updateEvent);
router.delete('/:id', protectAny, ctl.deleteEvent);

/* -------------- ID ROUTE LAST ------------------- */
// Place LAST so it doesn't swallow the others
router.get('/:id', ctl.getById);

module.exports = router;
