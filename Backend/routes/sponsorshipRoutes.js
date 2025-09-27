// Backend/routes/sponsorshipRoutes.js

const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Admin authentication middleware

// Import controllers
const { 
    registerSponsorship, 
    getSponsorshipForEditing,
    updateSponsorship,
    deleteSponsorship,
    getAllSponsorships,
    sendInvitationEmail // ★★★ approveSponsorship වෙනුවට මෙය import කරන්න
} = require('../controllers/sponsorshipController');

// --- Public Routes ---
router.post('/', registerSponsorship);                  // Submit new sponsorship application
router.get('/:id', getSponsorshipForEditing);           // Retrieve sponsorship by ID (with token)
router.put('/:id', updateSponsorship);                  // Update sponsorship (within 5 hours)
router.delete('/:id', deleteSponsorship);               // Delete sponsorship (within 5 hours)

// --- Admin Routes ---
router.get('/admin/all', protect, getAllSponsorships);  // Get all sponsorships (admin only)

// ★★★ 'approve' route එක ඉවත් කරලා 'send-invitation' එක යොදනවා ★★★
router.post('/admin/send-invitation/:id', protect, sendInvitationEmail);

module.exports = router;
