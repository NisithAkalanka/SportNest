const express = require('express');
const router = express.Router();
const { createRenewal } = require('../controllers/renewalController');

// POST request එකක් ආවම createRenewal function එක call කරනවා
// http://localhost:PORT/api/renewals/renew
router.post('/renew', createRenewal);

module.exports = router;