const express = require('express');
const router = express.Router();

const ctl = require('../controllers/eventsController');
const { protectAny, adminOnly } = require('../middleware/authMiddleware');

// List approved events
router.get('/approved', ctl.listApproved);

// 🟢 real-time preview register count
router.patch('/:id/preview-register', ctl.previewRegister);

// Public registration
router.post('/:id/register', ctl.register);

/* ---------------- MEMBER / ADMIN ---------------- */
router.post('/submit', protectAny, ctl.submitEvent);
router.get('/mine', protectAny, ctl.listMine);

/*  ADMIn */
router.get('/',              protectAny, adminOnly, ctl.listEvents);
router.patch('/:id/approve', protectAny, adminOnly, ctl.approve);
router.patch('/:id/reject',  protectAny, adminOnly, ctl.reject);

/* -------------- UPDATE / DELETE ----------------- */
router.put('/:id',    protectAny, ctl.updateEvent);
router.delete('/:id', protectAny, ctl.deleteEvent);

// Place LAST
router.get('/:id', ctl.getById);

module.exports = router;
